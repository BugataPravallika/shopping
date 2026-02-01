// Use environment variable for production, otherwise empty for proxy
export const BASE_URL = process.env.REACT_APP_API_URL || '';

export const PRODUCTS_URL = '/api/products';
export const USERS_URL = '/api/users';
export const ORDERS_URL = '/api/orders';
export const PAYPAL_URL = '/api/config/paypal';
export const WISHLIST_URL = '/api/wishlist';
export const CART_URL = '/api/cart';
export const COUPONS_URL = '/api/coupons';
