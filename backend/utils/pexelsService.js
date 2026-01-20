/**
 * Pexels API Service
 * 
 * This service fetches unique, category-based product images from the FREE Pexels API.
 * 
 * HOW IT WORKS:
 * 1. Takes a product category (e.g., "laptop", "dress")
 * 2. Searches Pexels for matching images
 * 3. Returns unique image URLs (no duplicates)
 * 4. Uses fallback images if API fails
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

// Your Pexels API key (from environment variable)
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

// Base URL for Pexels API
const PEXELS_BASE_URL = 'https://api.pexels.com/v1';

// Track which images have been used to prevent duplicates
const usedImageIds = new Set();

/**
 * CATEGORY TO SEARCH QUERY MAPPING
 * Maps your product categories to Pexels search terms
 */
const categorySearchQueries = {
    // Electronics
    'Electronics': ['laptop computer', 'smartphone technology', 'headphones audio', 'smartwatch wearable', 'wireless mouse keyboard', 'charger cable'],

    // Fashion - Men
    'Fashion - Men': ['mens fashion clothing', 'mens watch luxury', 'mens jeans denim', 'mens sneakers shoes', 'mens wallet leather', 'mens shirt formal'],

    // Fashion - Women
    'Fashion - Women': ['womens dress fashion', 'womens heels shoes', 'womens handbag purse', 'womens jewelry accessories', 'womens top blouse', 'womens sandals'],

    // Fashion - Kids
    'Fashion - Kids': ['kids clothing colorful', 'children toys play', 'kids shoes sneakers', 'school bag backpack', 'kids tshirt'],

    // Home & Kitchen
    'Home & Kitchen': ['kitchen appliance modern', 'home decor interior', 'bedding pillows', 'water bottle flask', 'cooking utensils'],

    // Beauty & Personal Care
    'Beauty & Personal Care': ['cosmetics makeup', 'skincare products', 'perfume fragrance', 'beauty cream lotion'],

    // Sports & Fitness
    'Sports & Fitness': ['sports equipment gym', 'fitness workout', 'yoga mat exercise', 'running shoes athletics'],

    // Books & Stationery
    'Books & Stationery': ['books stack library', 'notebook pen stationery', 'reading education'],

    // Jewellery
    'Jewellery': ['gold jewelry necklace', 'diamond ring elegant', 'earrings fashion'],

    // Makeup & Cosmetics
    'Makeup & Cosmetics': ['lipstick makeup', 'foundation beauty', 'mascara cosmetics'],

    // Default fallback
    'default': ['product ecommerce', 'retail shopping']
};

/**
 * FALLBACK IMAGES
 * Used when Pexels API fails or no images found
 */
const fallbackImages = {
    'Electronics': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=640',
    'Fashion - Men': 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=640',
    'Fashion - Women': 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=640',
    'Fashion - Kids': 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=640',
    'Home & Kitchen': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=640',
    'Beauty & Personal Care': 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=640',
    'Sports & Fitness': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=640',
    'Books & Stationery': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=640',
    'Jewellery': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=640',
    'Makeup & Cosmetics': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=640',
    'default': 'https://via.placeholder.com/640x480?text=Product+Image'
};

/**
 * Search Pexels for images matching a query
 * 
 * @param {string} query - Search term (e.g., "laptop computer")
 * @param {number} perPage - Number of results to fetch (max 80)
 * @returns {Promise<Array>} - Array of image objects
 */
async function searchPexels(query, perPage = 15) {
    try {
        const response = await fetch(
            `${PEXELS_BASE_URL}/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`,
            {
                headers: {
                    'Authorization': PEXELS_API_KEY
                }
            }
        );

        if (!response.ok) {
            console.error(`Pexels API error: ${response.status}`);
            return [];
        }

        const data = await response.json();
        return data.photos || [];
    } catch (error) {
        console.error(`Error fetching from Pexels: ${error.message}`);
        return [];
    }
}

/**
 * Get a unique image for a product
 * 
 * @param {string} category - Product category (e.g., "Electronics")
 * @param {string} name - Product name (e.g., "Dell Laptop")
 * @param {number} index - Product index (for variety)
 * @returns {Promise<string>} - Image URL
 */
export async function getImageForCategory(category, name = '', index = 0) {
    // 1. Try searching by Product Name for maximum relevance
    if (name) {
        console.log(`🔍 Searching Pexels for product name: "${name}"`);
        const photos = await searchPexels(name, 5);
        for (const photo of photos) {
            if (!usedImageIds.has(photo.id)) {
                usedImageIds.add(photo.id);
                return photo.src.medium;
            }
        }
    }

    // 2. Fallback to category-based search
    const queries = categorySearchQueries[category] || categorySearchQueries['default'];
    const query = queries[index % queries.length];
    console.log(`🔍 Searching Pexels for category query: "${query}"`);
    const photos = await searchPexels(query, 10);

    for (const photo of photos) {
        if (!usedImageIds.has(photo.id)) {
            usedImageIds.add(photo.id);
            return photo.src.medium;
        }
    }

    // 3. Absolute fallback
    return fallbackImages[category] || fallbackImages['default'];
}

/**
 * Fetch unique images for ALL products
 * 
 * @param {Array} products - Array of product objects
 * @returns {Promise<Array>} - Products with updated image URLs
 */
export async function fetchImagesForProducts(products) {
    console.log(`\n🖼️  Fetching premium images for ${products.length} products from Pexels...\n`);

    const updatedProducts = [];

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const category = product.category || 'default';

        // Use both category and name for high relevance
        const imageUrl = await getImageForCategory(category, product.name, i);

        updatedProducts.push({
            ...product,
            image: imageUrl
        });

        if ((i + 1) % 5 === 0) {
            console.log(`  ⏳ Processed ${i + 1}/${products.length} images...`);
        }

        // Delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 150));
    }

    console.log(`\n✅ Successfully assigned ${updatedProducts.length} unique premium images!\n`);
    return updatedProducts;
}

/**
 * Reset the used images tracker
 * Call this before re-seeding to allow reuse of images
 */
export function resetUsedImages() {
    usedImageIds.clear();
}

export default {
    getImageForCategory,
    fetchImagesForProducts,
    resetUsedImages
};
