// Shared mock product catalog used across pages until backend wiring is complete.

export const PRODUCTS = [
  { id: 'p1', name: 'Canon Camera EOS 2000, Black 10x zoom', price: 998.00, oldPrice: 1128.00, rating: 4, ratingNum: 7.5, orders: 154, image: '/products/cloth/1.jpg', desc: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' },
  { id: 'p2', name: 'GoPro HERO6 4K Action Camera - Black', price: 998.00, oldPrice: null, rating: 4, ratingNum: 7.5, orders: 154, image: '/products/tech/3.jpg', desc: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit' },
  { id: 'p3', name: 'GoPro HERO6 4K Action Camera - Black', price: 998.00, oldPrice: null, rating: 4, ratingNum: 7.5, orders: 154, image: '/products/tech/2.jpg', desc: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit' },
  { id: 'p4', name: 'GoPro HERO6 4K Action Camera - Black', price: 998.00, oldPrice: null, rating: 4, ratingNum: 7.5, orders: 154, image: '/products/tech/7.jpg', desc: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit' },
  { id: 'p5', name: 'GoPro HERO6 4K Action Camera - Black', price: 998.00, oldPrice: 1128.00, rating: 4, ratingNum: 7.5, orders: 154, image: '/products/tech/8.jpg', desc: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit' },
  { id: 'p6', name: 'GoPro HERO6 4K Action Camera - Black', price: 998.00, oldPrice: null, rating: 4, ratingNum: 7.5, orders: 154, image: '/products/tech/9.jpg', desc: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit' },
  { id: 'p7', name: 'Smartwatch Series Modern', price: 99.50, oldPrice: 1128.00, rating: 4, ratingNum: 7.5, orders: 154, image: '/products/tech/8.jpg', desc: 'Stylish smartwatch with health tracking and long battery life.' },
  { id: 'p8', name: 'Premium Laptop Slim', price: 99.50, oldPrice: 1128.00, rating: 4, ratingNum: 7.5, orders: 154, image: '/products/tech/7.jpg', desc: 'High performance slim laptop for work and play.' },
  { id: 'p9', name: 'Tablet Pro Max', price: 99.50, oldPrice: 1128.00, rating: 4, ratingNum: 7.5, orders: 154, image: '/products/tech/2.jpg', desc: 'Large display tablet with crisp resolution.' },
  { id: 'p10', name: 'Smartphone Red Edition', price: 99.50, oldPrice: 1128.00, rating: 4, ratingNum: 7.5, orders: 154, image: '/products/tech/1.jpg', desc: 'Latest smartphone with dual camera setup.' },
  { id: 'p11', name: 'Smartphone Blue Edition', price: 99.50, oldPrice: 1128.00, rating: 3, ratingNum: 5.9, orders: 154, image: '/products/tech/4.jpg', desc: 'Latest smartphone with dual camera setup.' },
  { id: 'p12', name: 'Smartphone Dark Edition', price: 99.50, oldPrice: null, rating: 4, ratingNum: 7.5, orders: 154, image: '/products/tech/3.jpg', desc: 'Latest smartphone with vibrant gradient finish.' },
  { id: 'p13', name: 'Wireless Headphones White', price: 99.50, oldPrice: 1128.00, rating: 4, ratingNum: 7.5, orders: 154, image: '/products/tech/9.jpg', desc: 'Premium noise-cancelling wireless headphones.' },
];

export const MAIN_PRODUCT = {
  id: 'main1',
  name: 'Mens Long Sleeve T-shirt Cotton Base Layer Slim Muscle',
  images: [
    '/products/cloth/2.jpg',
    '/products/cloth/1.jpg',
    '/products/cloth/3.jpg',
    '/products/cloth/4.jpg',
    '/products/cloth/5.jpg',
    '/products/cloth/6.jpg',
  ],
  rating: 4,
  ratingNum: 9.3,
  reviews: 32,
  sold: 154,
  inStock: true,
  pricing: [
    { price: '$98.00', range: '50-100 pcs' },
    { price: '$90.00', range: '100-700 pcs' },
    { price: '$78.00', range: '700+ pcs' },
  ],
  specs: [
    { label: 'Price', value: 'Negotiable' },
    { label: 'Type', value: 'Classic  shoes' },
    { label: 'Material', value: 'Plastic material' },
    { label: 'Design', value: 'Modern nice' },
    { label: 'Customization', value: 'Customized logo and design custom packages' },
    { label: 'Protection', value: 'Refund Policy' },
    { label: 'Warranty', value: '2 years full warranty' },
  ],
  supplier: {
    name: 'Guanjoi Trading LLC',
    initial: 'R',
    location: 'Germany, Berlin',
    verified: true,
    worldwideShipping: true,
  },
  description: `Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`,
  tableSpecs: [
    { label: 'Model', value: '#8786867' },
    { label: 'Style', value: 'Classic style' },
    { label: 'Certificate', value: 'ISO-898921212' },
    { label: 'Size', value: '34mm x 450mm x 19mm' },
    { label: 'Memory', value: '36GB RAM' },
  ],
  features: [
    'Some great feature name here',
    'Lorem ipsum dolor sit amet, consectetur',
    'Duis aute irure dolor in reprehenderit',
    'Some great feature name here',
  ],
  breadcrumb: ['Home', 'Clothings', "Men's wear", 'Summer clothing'],
};

export const YOU_MAY_LIKE = [
  { id: 'y1', name: 'Men Blazers Sets Elegant Formal', priceRange: '$7.00 - $99.50', image: '/products/cloth/7.jpg' },
  { id: 'y2', name: 'Men Shirt Sleeve Polo Contrast', priceRange: '$7.00 - $99.50', image: '/products/cloth/2.jpg' },
  { id: 'y3', name: 'Apple Watch Series Space Gray', priceRange: '$7.00 - $99.50', image: '/products/cloth/3.jpg' },
  { id: 'y4', name: 'Basketball Crew Socks Long Stuff', priceRange: '$7.00 - $99.50', image: '/products/cloth/1.jpg' },
  { id: 'y5', name: "New Summer Men's castrol T-Shirts", priceRange: '$7.00 - $99.50', image: '/products/cloth/5.jpg' },
];

export const RELATED_PRODUCTS = [
  { id: 'rp1', name: 'Xiaomi Redmi 8 Original', priceRange: '$32.00-$40.00', image: '/products/cloth/6.jpg' },
  { id: 'rp2', name: 'Xiaomi Redmi 8 Original', priceRange: '$32.00-$40.00', image: '/products/tech/8.jpg' },
  { id: 'rp3', name: 'Xiaomi Redmi 8 Original', priceRange: '$32.00-$40.00', image: '/products/tech/9.jpg' },
  { id: 'rp4', name: 'Xiaomi Redmi 8 Original', priceRange: '$32.00-$40.00', image: '/products/cloth/4.jpg' },
  { id: 'rp5', name: 'Xiaomi Redmi 8 Original', priceRange: '$32.00-$40.00', image: '/products/tech/10.jpg' },
  { id: 'rp6', name: 'Xiaomi Redmi 8 Original', priceRange: '$32.00-$40.00', image: '/products/interior/7.jpg' },
];

export const CATEGORY_FILTERS = [
  'Electronics',
  'Automobiles',
  'Clothes and wear',
  'Home interiors',
  'Sports and outdoor',
  'Animal and pets',
  'Tools, equipments',
  'Machinery tools',
];
export const BRAND_FILTERS = ['Samsung', 'Apple', 'Huawei', 'Pocco', 'Lenovo'];
export const FEATURE_FILTERS = ['Metallic', 'Plastic cover', '8GB Ram', 'Super power', 'Large Memory'];

export const CART_ITEMS_SEED = [
  { id: 'c1', name: 'T-shirts with multiple colors, for men and lady', size: 'medium', color: 'blue', material: 'Plastic', seller: 'Artel Market', price: 78.99, qty: 9, image: '/products/cloth/1.jpg' },
  { id: 'c2', name: 'T-shirts with multiple colors, for men and lady', size: 'medium', color: 'blue', material: 'Plastic', seller: 'Best factory LLC', price: 39.00, qty: 3, image: '/products/cloth/5.jpg' },
  { id: 'c3', name: 'T-shirts with multiple colors, for men and lady', size: 'medium', color: 'blue', material: 'Plastic', seller: 'Artel Market', price: 170.50, qty: 1, image: '/products/interior/6.jpg' },
];

export const SAVED_FOR_LATER = [
  { id: 's1', name: 'GoPro HERO6 4K Action Camera - Black', price: 99.50, image: '/products/tech/2.jpg' },
  { id: 's2', name: 'GoPro HERO6 4K Action Camera - Black', price: 99.50, image: '/products/tech/4.jpg' },
  { id: 's3', name: 'GoPro HERO6 4K Action Camera - Black', price: 99.50, image: '/products/tech/8.jpg' },
  { id: 's4', name: 'GoPro HERO6 4K Action Camera - Black', price: 99.50, image: '/products/tech/7.jpg' },
];
