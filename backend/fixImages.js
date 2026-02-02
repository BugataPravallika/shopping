import fs from 'fs';
import products from './data/products.js';

const updatedProducts = products.map((product) => {
    // We use the product name to create a unique seed for the image
    // Removing special characters for a clean slug
    const seed = product.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    // Using Picsum with a seed guarantees a unique, stable image for this name
    return {
        ...product,
        image: `https://picsum.photos/seed/${seed}/640/480`
    };
});

const content = `const products = ${JSON.stringify(updatedProducts, null, 2)};\n\nexport default products;`;

try {
    fs.writeFileSync('backend/data/products.js', content);
    console.log('✅ Success: All product images have been updated with unique seeds!');
    console.log('🔄 Please run "npm run data:all" to apply these changes to your database.');
} catch (error) {
    console.error('❌ Error updating products:', error.message);
}
