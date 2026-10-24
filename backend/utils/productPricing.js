export const isSaleActive = (product, now = new Date()) => {
  if (!(Number(product.oldPrice) > Number(product.price))) return false;
  const startsAt = product.saleStartsAt ? new Date(product.saleStartsAt) : null;
  const endsAt = product.saleEndsAt ? new Date(product.saleEndsAt) : null;
  return Boolean(startsAt && endsAt && startsAt <= now && endsAt > now);
};

export const getEffectivePrice = (product, now = new Date()) => (
  isSaleActive(product, now) ? Number(product.price) : Number(product.oldPrice || product.price)
);

export const serializeProductPricing = (product, now = new Date()) => {
  const serialized = typeof product.toObject === 'function' ? product.toObject() : { ...product };
  if (isSaleActive(serialized, now)) {
    serialized.saleActive = true;
    return serialized;
  }

  if (Number(serialized.oldPrice) > Number(serialized.price)) {
    serialized.price = Number(serialized.oldPrice);
    serialized.oldPrice = null;
  }
  serialized.saleActive = false;
  return serialized;
};
