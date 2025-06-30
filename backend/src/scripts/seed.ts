import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import logger from '../config/logger';

const seedDatabase = async () => {
  try {
    logger.info('🌱 Starting database seeding...');

    // Clear existing data
    await prisma.orderTracking.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.review.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.wishlistItem.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.productFeature.deleteMany();
    await prisma.productSpecification.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.seller.deleteMany();
    await prisma.userSession.deleteMany();
    await prisma.paymentMethod.deleteMany();
    await prisma.address.deleteMany();
    await prisma.user.deleteMany();

    // Create categories
    const electronics = await prisma.category.create({
      data: {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and gadgets',
        sortOrder: 1,
      },
    });

    const homeGarden = await prisma.category.create({
      data: {
        name: 'Home & Garden',
        slug: 'home-garden',
        description: 'Home and garden products',
        sortOrder: 2,
      },
    });

    const sports = await prisma.category.create({
      data: {
        name: 'Sports & Outdoors',
        slug: 'sports-outdoors',
        description: 'Sports and outdoor equipment',
        sortOrder: 3,
      },
    });

    // Create subcategories
    await prisma.category.createMany({
      data: [
        { name: 'Smartphones', slug: 'smartphones', parentId: electronics.id, sortOrder: 1 },
        { name: 'Laptops', slug: 'laptops', parentId: electronics.id, sortOrder: 2 },
        { name: 'Headphones', slug: 'headphones', parentId: electronics.id, sortOrder: 3 },
        { name: 'Furniture', slug: 'furniture', parentId: homeGarden.id, sortOrder: 1 },
        { name: 'Kitchen', slug: 'kitchen', parentId: homeGarden.id, sortOrder: 2 },
        { name: 'Fitness', slug: 'fitness', parentId: sports.id, sortOrder: 1 },
      ],
    });

    // Create sellers
    const sellers = await prisma.seller.createMany({
      data: [
        {
          name: 'TechGear Pro',
          email: 'seller1@example.com',
          description: 'Premium technology accessories and gadgets',
          isVerified: true,
        },
        {
          name: 'HomeStyle Living',
          email: 'seller2@example.com',
          description: 'Quality home and lifestyle products',
          isVerified: true,
        },
        {
          name: 'SportMax',
          email: 'seller3@example.com',
          description: 'Athletic gear and fitness equipment',
          isVerified: true,
        },
      ],
    });

    const sellerRecords = await prisma.seller.findMany();

    // Create sample stores for sellers
    const sampleStores = [
      {
        sellerId: sellerRecords[0].id,
        name: 'TechGear Pro Store',
        description: 'Your one-stop shop for premium technology accessories and the latest gadgets',
        category: 'Electronics',
        address: '123 Tech Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        phone: '+1-555-TECH-001',
        email: 'store@techgearpro.com',
        website: 'https://techgearpro.com',
        openingHours: JSON.stringify({
          monday: '9:00 AM - 8:00 PM',
          tuesday: '9:00 AM - 8:00 PM',
          wednesday: '9:00 AM - 8:00 PM',
          thursday: '9:00 AM - 8:00 PM',
          friday: '9:00 AM - 9:00 PM',
          saturday: '10:00 AM - 9:00 PM',
          sunday: '11:00 AM - 6:00 PM',
        }),
        status: 'APPROVED',
        isActive: true,
        isPremium: true,
        rating: 4.8,
        totalReviews: 247,
        establishedYear: 2018,
        licenseNumber: 'TECH-2018-001',
        taxId: 'EIN-12-3456789',
        socialMedia: JSON.stringify({
          facebook: 'https://facebook.com/techgearpro',
          instagram: 'https://instagram.com/techgearpro',
          twitter: 'https://twitter.com/techgearpro',
        }),
      },
      {
        sellerId: sellerRecords[1].id,
        name: 'HomeStyle Living Mall',
        description: 'Premium home decor, furniture, and lifestyle products for modern living',
        category: 'Home & Garden',
        address: '456 Home Boulevard',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        phone: '+1-555-HOME-002',
        email: 'info@homestyleliving.com',
        website: 'https://homestyleliving.com',
        openingHours: JSON.stringify({
          monday: '10:00 AM - 9:00 PM',
          tuesday: '10:00 AM - 9:00 PM',
          wednesday: '10:00 AM - 9:00 PM',
          thursday: '10:00 AM - 9:00 PM',
          friday: '10:00 AM - 10:00 PM',
          saturday: '9:00 AM - 10:00 PM',
          sunday: '10:00 AM - 8:00 PM',
        }),
        status: 'APPROVED',
        isActive: true,
        isPremium: false,
        rating: 4.5,
        totalReviews: 189,
        establishedYear: 2020,
        licenseNumber: 'HOME-2020-002',
        taxId: 'EIN-98-7654321',
        socialMedia: JSON.stringify({
          facebook: 'https://facebook.com/homestyleliving',
          pinterest: 'https://pinterest.com/homestyleliving',
        }),
      },
      {
        sellerId: sellerRecords[2].id,
        name: 'SportMax Fitness Center',
        description: 'Professional athletic gear, fitness equipment, and sports accessories',
        category: 'Sports & Fitness',
        address: '789 Athletic Avenue',
        city: 'Miami',
        state: 'FL',
        zipCode: '33101',
        phone: '+1-555-SPORT-003',
        email: 'contact@sportmaxfitness.com',
        website: 'https://sportmaxfitness.com',
        openingHours: JSON.stringify({
          monday: '6:00 AM - 10:00 PM',
          tuesday: '6:00 AM - 10:00 PM',
          wednesday: '6:00 AM - 10:00 PM',
          thursday: '6:00 AM - 10:00 PM',
          friday: '6:00 AM - 11:00 PM',
          saturday: '7:00 AM - 11:00 PM',
          sunday: '8:00 AM - 9:00 PM',
        }),
        status: 'APPROVED',
        isActive: true,
        isPremium: true,
        rating: 4.7,
        totalReviews: 312,
        establishedYear: 2017,
        licenseNumber: 'SPORT-2017-003',
        taxId: 'EIN-55-1122334',
        socialMedia: JSON.stringify({
          facebook: 'https://facebook.com/sportmaxfitness',
          instagram: 'https://instagram.com/sportmaxfitness',
          youtube: 'https://youtube.com/sportmaxfitness',
        }),
      },
    ];

    const createdStores = [];
    for (const storeData of sampleStores) {
      const { openingHours, socialMedia, ...storeInfo } = storeData;
      const slug = storeInfo.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const store = await prisma.store.create({
        data: {
          ...storeInfo,
          slug: `${slug}-${Date.now()}`,
          openingHours,
          socialMedia,
        },
      });
      createdStores.push(store);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123456', 12);
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@amazonclone.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isEmailVerified: true,
      },
    });

    // Create test customer
    const customerPassword = await bcrypt.hash('customer123', 12);
    const customer = await prisma.user.create({
      data: {
        email: 'customer@example.com',
        password: customerPassword,
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        role: 'CUSTOMER',
        isEmailVerified: true,
      },
    });

    // Create customer address
    await prisma.address.create({
      data: {
        userId: customer.id,
        type: 'HOME',
        firstName: 'John',
        lastName: 'Doe',
        address1: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States',
        isDefault: true,
      },
    });

    // Get categories for products
    const categoriesData = await prisma.category.findMany({
      where: { parentId: { not: null } },
    });

    // Create sample products
    const sampleProducts = [
      {
        title: 'Wireless Bluetooth Headphones - Premium Sound Quality',
        slug: 'wireless-bluetooth-headphones-premium',
        description: 'Experience crystal-clear audio with our premium wireless headphones featuring active noise cancellation.',
        price: 199.99,
        originalPrice: 299.99,
        sku: 'WBH-001',
        brand: 'AudioTech',
        stockQuantity: 50,
        categoryId: categoriesData.find(c => c.slug === 'headphones')?.id || electronics.id,
        sellerId: sellerRecords[0].id,
        storeId: createdStores[0].id,
        images: [
          { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop', alt: 'Wireless Headphones', sortOrder: 0 },
        ],
        specifications: [
          { name: 'Driver Size', value: '40mm' },
          { name: 'Battery Life', value: '30 hours' },
          { name: 'Connectivity', value: 'Bluetooth 5.0' },
        ],
        features: [
          { feature: 'Active Noise Cancellation' },
          { feature: 'Quick Charge' },
          { feature: 'Voice Assistant Compatible' },
        ],
      },
      {
        title: 'Smart Home Security Camera - 4K Ultra HD',
        slug: 'smart-home-security-camera-4k',
        description: 'Keep your home secure with our advanced 4K security camera featuring night vision and motion detection.',
        price: 149.99,
        sku: 'CAM-001',
        brand: 'SecureHome',
        stockQuantity: 30,
        categoryId: electronics.id,
        sellerId: sellerRecords[0].id,
        storeId: createdStores[0].id,
        images: [
          { url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&h=500&fit=crop', alt: 'Security Camera', sortOrder: 0 },
        ],
        specifications: [
          { name: 'Resolution', value: '4K Ultra HD' },
          { name: 'Field of View', value: '130°' },
          { name: 'Night Vision', value: 'Up to 30ft' },
        ],
        features: [
          { feature: '4K Ultra HD Recording' },
          { feature: 'Color Night Vision' },
          { feature: 'Two-Way Audio' },
        ],
      },
      {
        title: 'Ergonomic Office Chair - Professional Series',
        slug: 'ergonomic-office-chair-professional',
        description: 'Transform your workspace with our premium ergonomic office chair designed for all-day comfort.',
        price: 299.99,
        originalPrice: 399.99,
        sku: 'CHAIR-001',
        brand: 'ComfortPro',
        stockQuantity: 20,
        categoryId: categoriesData.find(c => c.slug === 'furniture')?.id || homeGarden.id,
        sellerId: sellerRecords[1].id,
        storeId: createdStores[1].id,
        images: [
          { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop', alt: 'Office Chair', sortOrder: 0 },
        ],
        specifications: [
          { name: 'Material', value: 'Premium Mesh & Fabric' },
          { name: 'Weight Capacity', value: '300 lbs' },
          { name: 'Warranty', value: '5 years' },
        ],
        features: [
          { feature: 'Lumbar Support' },
          { feature: 'Adjustable Armrests' },
          { feature: 'Breathable Mesh Back' },
        ],
      },
    ];

    for (const productData of sampleProducts) {
      const { images, specifications, features, ...product } = productData;

      const createdProduct = await prisma.product.create({
        data: product,
      });

      // Add images
      await prisma.productImage.createMany({
        data: images.map(img => ({ ...img, productId: createdProduct.id })),
      });

      // Add specifications
      await prisma.productSpecification.createMany({
        data: specifications.map(spec => ({ ...spec, productId: createdProduct.id })),
      });

      // Add features
      await prisma.productFeature.createMany({
        data: features.map(feature => ({ ...feature, productId: createdProduct.id })),
      });
    }

    logger.info('✅ Database seeded successfully!');
    logger.info('📧 Admin user: admin@amazonclone.com / admin123456');
    logger.info('👤 Customer user: customer@example.com / customer123');

  } catch (error) {
    logger.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

// Run seeder if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch(() => {
      process.exit(1);
    });
}

export default seedDatabase;
