const FOOTER_LINKS = {
  'About Us': '/about',
  'Find store': '/contact',
  Categories: '/products',
  Blogs: '/help',
  'Help Center': '/help',
  'Money Refund': '/help#refund',
  Shipping: '/help#shipping',
  'Contact us': '/contact',
  Login: '/login',
  Register: '/register',
  Settings: '/profile',
  'My Orders': '/profile#orders',
};

export const getFooterLink = (label) => FOOTER_LINKS[label] || '/help';
