import fs from 'fs';
import path from 'path';

const categories = [
    { name: 'Electronics', brands: ['Samsung', 'Apple', 'Sony', 'OnePlus', 'Dell', 'HP', 'Boat', 'JBL', 'Logitech'], items: ['Smartphone', 'Laptop', 'Headphones', 'Earbuds', 'Smartwatch', 'Fast Charger', 'Wireless Mouse', 'Keyboard'] },
    { name: 'Fashion - Men', brands: ['Nike', 'Adidas', 'Puma', 'Levis', 'Allen Solly', 'Raymond', 'Casio', 'Fossil'], items: ['Casual Shirt', 'T-Shirt', 'Jeans', 'Sneakers', 'Running Shoes', 'Analog Watch', 'Wallet', 'Belt'] },
    { name: 'Fashion - Women', brands: ['Zara', 'H&M', 'Biba', 'W', 'Lavie', 'Caprese', 'Bata', 'Metro'], items: ['Floral Dress', 'Kurti', 'Handbag', 'Heels', 'Top', 'Jeans', 'Sandals'] },
    { name: 'Fashion - Kids', brands: ['Gini & Jony', 'Mothercare', 'Lilliput', 'Adidas Kids'], items: ['T-Shirt', 'Shorts', 'Frock', 'School Bag', 'Sports Shoes', 'Toy Car'] },
    { name: 'Home & Kitchen', brands: ['Prestige', 'Milton', 'Philips', 'Bajaj', 'Solimo', 'Ikea'], items: ['Non-Stick Fry Pan', 'Pressure Cooker', 'Mixer Grinder', 'Toaster', 'Water Bottle', 'Storage Container Set', 'Bed Sheet'] },
    { name: 'Beauty & Personal Care', brands: ['Nivea', 'Dove', 'Himalaya', 'L\'Oreal', 'Maybelline', 'Mamaearth'], items: ['Face Wash', 'Moisturizer', 'Shampoo', 'Conditioner', 'Sunscreen', 'Body Lotion'] },
    { name: 'Sports & Fitness', brands: ['Yonex', 'Nivia', 'Decathlon', 'Cosco'], items: ['Yoga Mat', 'Dumbbells (Set)', 'Badminton Racket', 'Football', 'Cricket Bat', 'Resistance Bands'] },
    { name: 'Books & Stationery', brands: ['Classmate', 'Parker', 'Penguin', 'Arihant'], items: ['Notebook Set', 'Gel Pen Set', 'Scientific Calculator', 'Novel', 'Exam Prep Book', 'Sketch Pen Set'] },
    { name: 'Jewellery', brands: ['Tanishq (Artificial)', 'Giva', 'Voylla', 'Sukkhi'], items: ['Silver Plated Earrings', 'Necklace Set', 'Gold Plated Bangles', 'Ring', 'Anklet'] },
    { name: 'Makeup & Cosmetics', brands: ['Lakme', 'Maybelline', 'Sugar', 'Mac'], items: ['Matte Lipstick', 'Liquid Foundation', 'Eyeliner', 'Mascara', 'Compact Powder'] },
    { name: 'Girls Lifestyle', brands: ['Chumbak', 'Miniso', 'Accessorize'], items: ['Hair Band Set', 'Cute Clutch', 'Scrunchies Pack', 'Fashion Backpack', 'Kawaii Diary'] },
    { name: 'Boys Lifestyle', brands: ['Wildcraft', 'Fastrack', 'Beardo'], items: ['Leather Wallet', 'Aviator Sunglasses', 'Grooming Kit', 'Wrist Band', 'Cap'] },
];

const badges = ['New', 'Trending', 'Limited Stock', 'None', 'None', 'None'];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomPrice = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
const getRandomRating = () => (Math.random() * (1.5) + 3.5).toFixed(1); // 3.5 to 5.0

const itemsPerCategory = Math.ceil(210 / categories.length);

const getImageForCategory = (category, item) => {
    // improved keyword extraction for better variety
    const keywords = item.split(' ').join(',');
    const lock = Math.floor(Math.random() * 50000); // Larger range for locks
    return `https://loremflickr.com/640/480/${keywords},${category.split(' ')[0]}?lock=${lock}`;
};

const products = [];

categories.forEach((cat) => {
    for (let i = 0; i < itemsPerCategory; i++) {
        const brand = getRandom(cat.brands);
        const item = getRandom(cat.items);

        // Add variations to make titles unique
        const adjectives = ['Premium', 'Stylish', 'Durable', 'Classic', 'Modern', 'Elegant', 'High-Performance', 'Compact'];
        const title = `${brand} ${getRandom(adjectives)} ${item} - ${cat.name.split(' ')[0]}`;

        products.push({
            name: title,
            image: getImageForCategory(cat.name, item),
            brand: brand,
            category: cat.name,
            description: `Experience the best quality with ${title}. Perfect for daily use and designed to last long. Highly rated by customers.`,
            price: getRandomPrice(499, 15999),
            countInStock: getRandomPrice(0, 50),
            rating: parseFloat(getRandomRating()),
            numReviews: getRandomPrice(5, 500),
            isFeatured: Math.random() < 0.15,
            badge: getRandom(badges),
            user: "ADMIN_USER_ID_PLACEHOLDER"
        });
    }
});

const fileContent = `const products = ${JSON.stringify(products, null, 2)};\n\nexport default products;`;

const __dirname = path.resolve();
fs.writeFileSync(path.join(__dirname, 'backend/data/products.js'), fileContent);

console.log(`Successfully generated ${products.length} products with external images.`);
