import fs from 'fs';
import path from 'path';
import products from './data/products.js';

const artifactPath = 'C:\\Users\\n2110\\.gemini\\antigravity\\brain\\d9b1764e-f7de-4d62-ac7d-1d02e92faaf3\\products.json';

fs.writeFileSync(artifactPath, JSON.stringify(products, null, 2));

console.log(`Successfully exported ${products.length} products to ${artifactPath}`);
