const CATEGORY_ALIASES = {
  'cloth and wear': 'Clothes and wear',
  'clothes and wear': 'Clothes and wear',
  'computer and tech': 'Computer and tech',
  'computers and tech': 'Computer and tech',
  'computer tech': 'Computer and tech',
  'computers tech': 'Computer and tech',
  'sports and outddor': 'Sports and outdoor',
  'sports and outdoor': 'Sports and outdoor',
  'animal and pets': 'Animal and pets',
};

export const getCategoryLabel = (category) => {
  const label = String(category || '').trim();
  const key = label.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  return CATEGORY_ALIASES[key] || label;
};
