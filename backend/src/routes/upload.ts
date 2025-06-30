import { Router, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import config from '@/config';
import { AuthRequest, ApiResponse, ValidationError, NotFoundError, UnauthorizedError } from '@/types';
import { asyncHandler } from '@/middleware/errorHandler';
import { authenticate } from '@/middleware/auth';
import logger from '@/config/logger';

const router = Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.upload.maxFileSize, // 5MB
    files: 10, // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    if (config.upload.allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Upload single image
router.post('/image',
  authenticate,
  upload.single('image'),
  [
    body('folder').optional().isString().withMessage('Folder must be a string'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array().map(error => ({
        field: error.param,
        message: error.msg,
      })));
    }

    if (!req.file) {
      throw new ValidationError('Validation failed', [{
        field: 'image',
        message: 'Image file is required',
      }]);
    }

    try {
      const { folder = 'amazon-clone', tags = [] } = req.body;

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: folder,
            tags: [...tags, 'amazon-clone', req.user!.id],
            transformation: [
              { width: 1000, height: 1000, crop: 'limit' },
              { quality: 'auto', fetch_format: 'auto' },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.file!.buffer);
      });

      const uploadResult = result as any;

      logger.info('Image uploaded successfully:', {
        publicId: uploadResult.public_id,
        userId: req.user!.id,
      });

      const response: ApiResponse = {
        success: true,
        message: 'Image uploaded successfully',
        data: {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format,
          size: uploadResult.bytes,
        },
      };

      res.status(201).json(response);
    } catch (error: any) {
      logger.error('Image upload failed:', error);
      throw new ValidationError('Upload failed', [{
        field: 'image',
        message: error.message || 'Failed to upload image',
      }]);
    }
  })
);

// Upload multiple images
router.post('/images',
  authenticate,
  upload.array('images', 10),
  [
    body('folder').optional().isString().withMessage('Folder must be a string'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array().map(error => ({
        field: error.param,
        message: error.msg,
      })));
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      throw new ValidationError('Validation failed', [{
        field: 'images',
        message: 'At least one image file is required',
      }]);
    }

    try {
      const { folder = 'amazon-clone', tags = [] } = req.body;

      // Upload all images to Cloudinary
      const uploadPromises = files.map(file => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              folder: folder,
              tags: [...tags, 'amazon-clone', req.user!.id],
              transformation: [
                { width: 1000, height: 1000, crop: 'limit' },
                { quality: 'auto', fetch_format: 'auto' },
              ],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(file.buffer);
        });
      });

      const results = await Promise.all(uploadPromises);

      const uploadResults = results.map((result: any) => ({
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
      }));

      logger.info('Multiple images uploaded successfully:', {
        count: uploadResults.length,
        userId: req.user!.id,
      });

      const response: ApiResponse = {
        success: true,
        message: `${uploadResults.length} images uploaded successfully`,
        data: { images: uploadResults },
      };

      res.status(201).json(response);
    } catch (error: any) {
      logger.error('Multiple image upload failed:', error);
      throw new ValidationError('Upload failed', [{
        field: 'images',
        message: error.message || 'Failed to upload images',
      }]);
    }
  })
);

// Delete image
router.delete('/image/:publicId',
  authenticate,
  param('publicId').isString().withMessage('Public ID is required'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array().map(error => ({
        field: error.param,
        message: error.msg,
      })));
    }

    const { publicId } = req.params;

    try {
      // Delete from Cloudinary
      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result !== 'ok') {
        throw new NotFoundError('Image not found or already deleted');
      }

      logger.info('Image deleted successfully:', {
        publicId,
        userId: req.user!.id,
      });

      const response: ApiResponse = {
        success: true,
        message: 'Image deleted successfully',
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Image deletion failed:', error);

      if (error instanceof NotFoundError) {
        throw error;
      }

      throw new ValidationError('Deletion failed', [{
        field: 'publicId',
        message: error.message || 'Failed to delete image',
      }]);
    }
  })
);

// Get upload signature for client-side uploads
router.post('/signature',
  authenticate,
  [
    body('folder').optional().isString(),
    body('tags').optional().isArray(),
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed', errors.array().map(error => ({
        field: error.param,
        message: error.msg,
      })));
    }

    try {
      const { folder = 'amazon-clone', tags = [] } = req.body;
      const timestamp = Math.round(new Date().getTime() / 1000);

      const params = {
        timestamp,
        folder,
        tags: [...tags, 'amazon-clone', req.user!.id].join(','),
        transformation: 'w_1000,h_1000,c_limit/q_auto,f_auto',
      };

      const signature = cloudinary.utils.api_sign_request(params, config.cloudinary.apiSecret);

      const response: ApiResponse = {
        success: true,
        message: 'Upload signature generated successfully',
        data: {
          signature,
          timestamp,
          apiKey: config.cloudinary.apiKey,
          cloudName: config.cloudinary.cloudName,
          folder,
          tags: params.tags,
          transformation: params.transformation,
        },
      };

      res.json(response);
    } catch (error: any) {
      logger.error('Signature generation failed:', error);
      throw new ValidationError('Signature generation failed', [{
        field: 'signature',
        message: error.message || 'Failed to generate upload signature',
      }]);
    }
  })
);

export default router;
