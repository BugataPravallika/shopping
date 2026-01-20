/**
 * Seed Products with Pexels Images
 * 
 * This script:
 * 1. Reads products from products.js
 * 2. Fetches unique images from Pexels API for each product based on category
 * 3. Saves products with real image URLs to MongoDB
 * 
 * USAGE:
 *   node backend/seedWithPexels.js
 * 
 * PREREQUISITES:
 *   Make sure PEXELS_API_KEY is set in your .env file
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import users from './data/users.js';
import products from './data/products.js';
import User from './models/userModel.js';
import Product from './models/productModel.js';
import Order from './models/orderModel.js';
import connectDB from './config/db.js';
import { fetchImagesForProducts, resetUsedImages } from './utils/pexelsService.js';

// Load environment variables
dotenv.config();

// Check if API key is present
if (!process.env.PEXELS_API_KEY) {
    console.error('❌ PEXELS_API_KEY is not set in your .env file!'.red.bold);
    console.log('\nTo fix this:'.yellow);
    console.log('1. Create or edit the .env file in the project root');
    console.log('2. Add this line: PEXELS_API_KEY=your_api_key_here');
    console.log('3. Run this script again\n');
    process.exit(1);
}

/**
 * Main function to seed the database with Pexels images
 */
const seedWithPexels = async () => {
    try {
        // Connect to MongoDB
        await connectDB();
        console.log('\n📦 Connected to MongoDB'.cyan);

        // Clear existing data
        console.log('🗑️  Clearing existing data...'.yellow);
        await Order.deleteMany();
        await Product.deleteMany();
        await User.deleteMany();

        // Create users
        console.log('👤 Creating users...'.yellow);
        const createdUsers = await User.insertMany(users);
        const adminUser = createdUsers[0]._id;

        // Reset used images tracker
        resetUsedImages();

        // Fetch unique images from Pexels for each product
        console.log('🖼️  Fetching images from Pexels API...'.yellow);
        const productsWithImages = await fetchImagesForProducts(products);

        // Add admin user to all products
        const sampleProducts = productsWithImages.map((product) => ({
            ...product,
            user: adminUser
        }));

        // Insert products one by one to avoid issues
        console.log('📝 Inserting products into database...'.yellow);
        let insertedCount = 0;
        for (const product of sampleProducts) {
            try {
                await Product.create(product);
                insertedCount++;

                // Progress indicator every 50 products
                if (insertedCount % 50 === 0) {
                    console.log(`   Inserted ${insertedCount}/${sampleProducts.length} products...`);
                }
            } catch (error) {
                console.error(`Error inserting product "${product.name}":`, error.message);
            }
        }

        console.log('\n' + '═'.repeat(50));
        console.log('✅ DATA SEEDED SUCCESSFULLY!'.green.bold);
        console.log('═'.repeat(50));
        console.log(`   👤 Users created: ${createdUsers.length}`);
        console.log(`   📦 Products created: ${insertedCount}`);
        console.log('═'.repeat(50) + '\n');

        process.exit();
    } catch (error) {
        console.error(`\n❌ Error: ${error.message}`.red.bold);
        process.exit(1);
    }
};

// Run the seeder
seedWithPexels();
