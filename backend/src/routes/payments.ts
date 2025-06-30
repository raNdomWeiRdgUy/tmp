import express, { Router, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import Stripe from 'stripe';
import prisma from '@/config/database';
import config from '@/config';
import { AuthRequest, ApiResponse, PaymentIntentData, ValidationError, NotFoundError } from '@/types';
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticate } from '@/middleware/auth';
import logger from '@/config/logger';

const router = Router();

// Initialize Stripe
const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2023-10-16',
});

// Create payment intent
router.post('/create-intent',
  authenticate,
  [
    body('amount').isFloat({ min: 0.5 }).withMessage('Amount must be at least $0.50'),
    body('currency').optional().isIn(['usd', 'eur', 'gbp']).withMessage('Unsupported currency'),
    body('orderId').optional().isString(),
    body('paymentMethodId').optional().isString(),
    body('useDefaultPaymentMethod').optional().isBoolean(),
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array().map(error => ({
        field: error.param,
        message: error.msg,
      })));
    }

    const {
      amount,
      currency = 'usd',
      orderId,
      paymentMethodId,
      useDefaultPaymentMethod = false,
    } = req.body;

    const userId = req.user!.id;

    // Get or create Stripe customer
    let stripeCustomerId: string;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // For demo purposes, we'll create a customer each time
    // In production, you'd store the Stripe customer ID in the database
    const customer = await stripe.customers.create({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      metadata: {
        userId: user.id,
      },
    });

    stripeCustomerId = customer.id;

    // Payment intent options
    const paymentIntentData: Stripe.PaymentIntentCreateParams = {
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: stripeCustomerId,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId,
        ...(orderId && { orderId }),
      },
    };

    // If specific payment method provided, attach it
    if (paymentMethodId) {
      paymentIntentData.payment_method = paymentMethodId;
      paymentIntentData.confirmation_method = 'manual';
      paymentIntentData.confirm = true;
    } else if (useDefaultPaymentMethod) {
      // Get user's default payment method
      const defaultPaymentMethod = await prisma.paymentMethod.findFirst({
        where: { userId, isDefault: true },
      });

      if (defaultPaymentMethod?.stripePaymentMethodId) {
        paymentIntentData.payment_method = defaultPaymentMethod.stripePaymentMethodId;
        paymentIntentData.confirmation_method = 'manual';
        paymentIntentData.confirm = true;
      }
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

    const response: ApiResponse = {
      success: true,
      message: 'Payment intent created successfully',
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        customerId: stripeCustomerId,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      },
    };

    res.json(response);
  })
);

// Confirm payment intent
router.post('/confirm-intent/:id',
  authenticate,
  [
    param('id').isString().withMessage('Payment intent ID is required'),
    body('paymentMethodId').optional().isString(),
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array().map(error => ({
        field: error.param,
        message: error.msg,
      })));
    }

    const { id } = req.params;
    const { paymentMethodId } = req.body;

    try {
      const confirmParams: Stripe.PaymentIntentConfirmParams = {};

      if (paymentMethodId) {
        confirmParams.payment_method = paymentMethodId;
      }

      const paymentIntent = await stripe.paymentIntents.confirm(id, confirmParams);

      const response: ApiResponse = {
        success: true,
        message: 'Payment intent confirmed successfully',
        data: {
          paymentIntent: {
            id: paymentIntent.id,
            status: paymentIntent.status,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
          },
        },
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Payment confirmation failed:', error);

      throw new ValidationError('Payment confirmation failed', [{
        field: 'payment',
        message: error.message || 'Payment could not be processed',
      }]);
    }
  })
);

// Save payment method for future use
router.post('/save-payment-method',
  authenticate,
  [
    body('paymentMethodId').notEmpty().withMessage('Payment method ID is required'),
    body('isDefault').optional().isBoolean(),
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array().map(error => ({
        field: error.param,
        message: error.msg,
      })));
    }

    const { paymentMethodId, isDefault = false } = req.body;
    const userId = req.user!.id;

    try {
      // Retrieve payment method from Stripe
      const stripePaymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

      if (!stripePaymentMethod.card) {
        throw new ValidationError('Validation failed', [{
          field: 'paymentMethodId',
          message: 'Only card payment methods are supported',
        }]);
      }

      // If this is set as default, unset other default payment methods
      if (isDefault) {
        await prisma.paymentMethod.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      // Save to database
      const paymentMethod = await prisma.paymentMethod.create({
        data: {
          userId,
          type: stripePaymentMethod.card.funding === 'credit' ? 'CREDIT' : 'DEBIT',
          last4: stripePaymentMethod.card.last4,
          brand: stripePaymentMethod.card.brand.toUpperCase(),
          expiryMonth: stripePaymentMethod.card.exp_month,
          expiryYear: stripePaymentMethod.card.exp_year,
          isDefault,
          stripePaymentMethodId: paymentMethodId,
        },
      });

      const response: ApiResponse = {
        success: true,
        message: 'Payment method saved successfully',
        data: { paymentMethod },
      };

      res.status(201).json(response);
    } catch (error: any) {
      logger.error('Failed to save payment method:', error);

      if (error.type === 'StripeInvalidRequestError') {
        throw new ValidationError('Validation failed', [{
          field: 'paymentMethodId',
          message: 'Invalid payment method ID',
        }]);
      }

      throw error;
    }
  })
);

// Get saved payment methods
router.get('/payment-methods',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { userId: req.user!.id },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    const response: ApiResponse = {
      success: true,
      message: 'Payment methods retrieved successfully',
      data: { paymentMethods },
    };

    res.json(response);
  })
);

// Delete payment method
router.delete('/payment-methods/:id',
  authenticate,
  param('id').isString().withMessage('Payment method ID is required'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array().map(error => ({
        field: error.param,
        message: error.msg,
      })));
    }

    const { id } = req.params;

    // Check if payment method belongs to user
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!paymentMethod) {
      throw new NotFoundError('Payment method not found');
    }

    // Detach from Stripe if it exists
    if (paymentMethod.stripePaymentMethodId) {
      try {
        await stripe.paymentMethods.detach(paymentMethod.stripePaymentMethodId);
      } catch (error) {
        logger.warn('Failed to detach payment method from Stripe:', error);
        // Continue with deletion even if Stripe fails
      }
    }

    await prisma.paymentMethod.delete({
      where: { id },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Payment method deleted successfully',
    };

    res.json(response);
  })
);

// Stripe webhook handler
router.post('/webhook',
  // Raw body parser for webhook signature verification
  express.raw({ type: 'application/json' }),
  asyncHandler(async (req: any, res: Response) => {
    const sig = req.headers['stripe-signature'];
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, config.stripe.webhookSecret);
    } catch (err: any) {
      logger.error('Webhook signature verification failed:', err.message);
      return res.status(400).json({
        success: false,
        message: 'Webhook signature verification failed',
      });
    }

    logger.info('Received Stripe webhook:', { type: event.type, id: event.id });

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        case 'charge.dispute.created':
          await handleChargeDispute(event.data.object as Stripe.Dispute);
          break;

        default:
          logger.info('Unhandled webhook event type:', event.type);
      }

      res.json({ received: true });
    } catch (error) {
      logger.error('Webhook handler error:', error);
      res.status(500).json({
        success: false,
        message: 'Webhook handler error',
      });
    }
  })
);

// Refund payment
router.post('/refund',
  authenticate,
  [
    body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required'),
    body('amount').optional().isFloat({ min: 0.5 }).withMessage('Refund amount must be at least $0.50'),
    body('reason').optional().isIn(['duplicate', 'fraudulent', 'requested_by_customer']),
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array().map(error => ({
        field: error.param,
        message: error.msg,
      })));
    }

    const { paymentIntentId, amount, reason = 'requested_by_customer' } = req.body;

    try {
      // Retrieve the payment intent to get the charge
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (!paymentIntent.charges.data.length) {
        throw new ValidationError('Validation failed', [{
          field: 'paymentIntentId',
          message: 'No charges found for this payment intent',
        }]);
      }

      const charge = paymentIntent.charges.data[0];

      // Create refund
      const refundParams: Stripe.RefundCreateParams = {
        charge: charge.id,
        reason,
      };

      if (amount) {
        refundParams.amount = Math.round(amount * 100); // Convert to cents
      }

      const refund = await stripe.refunds.create(refundParams);

      const response: ApiResponse = {
        success: true,
        message: 'Refund processed successfully',
        data: {
          refund: {
            id: refund.id,
            amount: refund.amount,
            currency: refund.currency,
            status: refund.status,
            reason: refund.reason,
          },
        },
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Refund failed:', error);

      throw new ValidationError('Refund failed', [{
        field: 'refund',
        message: error.message || 'Refund could not be processed',
      }]);
    }
  })
);

// Helper functions for webhook handlers
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;

  if (orderId) {
    // Update order status to confirmed
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CONFIRMED',
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    // Add tracking entry
    await prisma.orderTracking.create({
      data: {
        orderId,
        status: 'Payment Confirmed',
        description: 'Payment has been successfully processed',
      },
    });

    logger.info('Order payment confirmed:', { orderId, paymentIntentId: paymentIntent.id });
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;

  if (orderId) {
    // Update order status to cancelled and restore stock
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (order) {
      await prisma.$transaction(async (tx) => {
        // Cancel order
        await tx.order.update({
          where: { id: orderId },
          data: { status: 'CANCELLED' },
        });

        // Restore stock
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: { increment: item.quantity },
            },
          });
        }

        // Add tracking entry
        await tx.orderTracking.create({
          data: {
            orderId,
            status: 'Payment Failed',
            description: 'Payment could not be processed. Order has been cancelled.',
          },
        });
      });

      logger.warn('Order payment failed:', { orderId, paymentIntentId: paymentIntent.id });
    }
  }
}

async function handleChargeDispute(dispute: Stripe.Dispute) {
  logger.warn('Charge dispute created:', {
    disputeId: dispute.id,
    chargeId: dispute.charge,
    amount: dispute.amount,
    reason: dispute.reason,
  });

  // Handle dispute logic here (notify admin, update order status, etc.)
}

export default router;
