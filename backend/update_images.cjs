const fs = require('fs');
const path = require('path');

const productsFilePath = path.join(__dirname, 'data', 'products.js');

try {
    let content = fs.readFileSync(productsFilePath, 'utf8');

    // Define mappings
    const mappings = [
        { keyword: 'Laptop', image: '/images/products/laptop.png' },
        { keyword: 'Mouse', image: '/images/products/mouse.png' },
        { keyword: 'Headphones', image: '/images/products/headphones.png' },
        { keyword: 'Smartwatch', image: '/images/products/smartwatch.png' },
        { keyword: 'Smartphone', image: '/images/products/phone.png' },
        { keyword: 'Keyboard', image: '/images/products/keyboard.png' },
        { keyword: 'Charger', image: '/images/products/electronics_fast_charger.png' }, // Fallback if I had it, but I don't.
    ];

    // Simple regex replacement strategy
    // We look for lines like: "image": "...", and check strictly associated name?
    // Actually, since it's a JS file, we can require it if we export it properly, but it's ES6 export usually?
    // The file starts with `const products = [`.
    // Let's just do text replacement line by line for safety.

    const lines = content.split('\n');
    let newLines = [];
    let currentProduct = {};

    // This is a bit fragile if lines are not structured perfectly, but the file looked pretty formatted.
    // Better approach: regex replace globally based on preceding name.

    // Strategy: Replace generic loremflickr URLs with specific ones based on the name in the SAME object context.
    // Since the file structure is predictable (Name line then Image line usually), we can try that.

    // Robust method:
    // 1. Extract the array content string.
    // 2. Eval it (risky?) or just regex replace.

    // Regex approach:
    // Match: "name": "(.*Laptop.*)",\s*"image": "(.*)"
    // Replace: "name": "$1",\s*"image": "/images/products/laptop.png"

    mappings.forEach(map => {
        // Regex to match name containing keyword, followed optionally by other fields, then image.
        // Handles cases where image might be before or after, but usually after.
        // Based on viewed file: name is first, image is second.
        const regex = new RegExp(`("name": ".*${map.keyword}.*",\\s*\\n\\s*"image": ")(.*?)(")`, 'g');
        content = content.replace(regex, `$1${map.image}$3`);
    });

    fs.writeFileSync(productsFilePath, content, 'utf8');
    console.log('Successfully updated product images.');

} catch (error) {
    console.error('Error updating products:', error);
}
