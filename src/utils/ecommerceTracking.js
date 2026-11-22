import { COOKIE_CATEGORIES, canUseCookieCategory } from "./cookieConsent.js";

const CURRENCY = "PKR";
const PURCHASE_DEDUP_STORAGE_KEY = "naashpati-tracked-purchases";

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const clampQuantity = (value) => {
  const qty = Math.floor(toNumber(value, 1));
  return qty > 0 ? qty : 1;
};

const resolveProductId = (product) =>
  String(
    product?._id || product?.id || product?.product || product?.slug || "",
  ).trim();

const resolveProductName = (product) =>
  String(product?.name || product?.title || "Unnamed product").trim();

const resolveProductCategory = (product) =>
  String(product?.category || product?.collection || "Uncategorized").trim();

const resolveProductPrice = (product, fallback = 0) => {
  const salePrice = toNumber(product?.salePrice, NaN);
  if (Number.isFinite(salePrice) && salePrice > 0) {
    return salePrice;
  }

  const price = toNumber(product?.price, NaN);
  if (Number.isFinite(price) && price > 0) {
    return price;
  }

  const originalPrice = toNumber(product?.originalPrice, NaN);
  if (Number.isFinite(originalPrice) && originalPrice > 0) {
    return originalPrice;
  }

  return toNumber(fallback, 0);
};

const buildGaItem = (product, options = {}) => {
  const itemId = resolveProductId(product);
  if (!itemId) {
    return null;
  }

  const index = toNumber(options.index, NaN);
  const listName = String(options.listName || "").trim();

  const item = {
    item_id: itemId,
    item_name: resolveProductName(product),
    item_category: resolveProductCategory(product),
    price: resolveProductPrice(product, options.fallbackPrice),
    quantity: clampQuantity(options.quantity),
  };

  if (listName) {
    item.item_list_name = listName;
  }

  if (Number.isFinite(index) && index >= 0) {
    item.index = index;
  }

  return item;
};

const toGaItemsFromCart = (cartItems = [], listName = "") =>
  (Array.isArray(cartItems) ? cartItems : [])
    .map((entry, index) =>
      buildGaItem(entry?.product || entry, {
        quantity: entry?.quantity,
        fallbackPrice: entry?.price,
        listName,
        index,
      }),
    )
    .filter(Boolean);

const canTrackAnalytics = () => {
  if (typeof window === "undefined") {
    return false;
  }

  if (!canUseCookieCategory(COOKIE_CATEGORIES.analytics)) {
    return false;
  }

  return Array.isArray(window.dataLayer);
};

const pushToDataLayer = (payload, { clearEcommerce = true } = {}) => {
  if (!canTrackAnalytics()) {
    return false;
  }

  if (clearEcommerce) {
    window.dataLayer.push({ ecommerce: null });
  }

  window.dataLayer.push(payload);
  return true;
};

const readTrackedPurchases = () => {
  if (typeof window === "undefined") {
    return new Set();
  }

  try {
    const raw = window.localStorage.getItem(PURCHASE_DEDUP_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set();
  }
};

const markPurchaseTracked = (transactionId) => {
  if (typeof window === "undefined") {
    return;
  }

  const tracked = readTrackedPurchases();
  tracked.add(String(transactionId));

  try {
    window.localStorage.setItem(
      PURCHASE_DEDUP_STORAGE_KEY,
      JSON.stringify(Array.from(tracked).slice(-100)),
    );
  } catch {
    // Ignore storage errors and proceed without persistence.
  }
};

const getOrderItems = (order = {}, fallbackItems = []) => {
  if (Array.isArray(order.orderItems) && order.orderItems.length > 0) {
    return order.orderItems;
  }

  return Array.isArray(fallbackItems) ? fallbackItems : [];
};

const getOrderItemProduct = (orderItem) => ({
  _id: orderItem?.product?._id || orderItem?.product || orderItem?._id,
  name: orderItem?.name,
  category: orderItem?.category,
  price: orderItem?.price,
  salePrice: orderItem?.salePrice,
  originalPrice: orderItem?.originalPrice,
});

export const trackViewItem = ({ product }) => {
  const gaItem = buildGaItem(product);
  if (!gaItem) {
    return false;
  }

  return pushToDataLayer({
    event: "view_item",
    ecommerce: {
      currency: CURRENCY,
      value: toNumber(gaItem.price) * clampQuantity(gaItem.quantity),
      items: [gaItem],
    },
  });
};

export const trackViewItemList = ({ listName, products = [] }) => {
  const normalizedListName = String(listName || "product_list").trim();
  const items = (Array.isArray(products) ? products : [])
    .map((product, index) =>
      buildGaItem(product, {
        listName: normalizedListName,
        index,
      }),
    )
    .filter(Boolean);

  if (items.length === 0) {
    return false;
  }

  const value = items.reduce(
    (sum, item) => sum + toNumber(item.price) * clampQuantity(item.quantity),
    0,
  );

  return pushToDataLayer({
    event: "view_item_list",
    ecommerce: {
      item_list_name: normalizedListName,
      currency: CURRENCY,
      value,
      items,
    },
  });
};

export const trackSelectItem = ({ product, listName, index = 0 }) => {
  const gaItem = buildGaItem(product, {
    listName,
    index,
  });

  if (!gaItem) {
    return false;
  }

  return pushToDataLayer({
    event: "select_item",
    ecommerce: {
      item_list_name:
        gaItem.item_list_name || String(listName || "product_list"),
      currency: CURRENCY,
      value: toNumber(gaItem.price) * clampQuantity(gaItem.quantity),
      items: [gaItem],
    },
  });
};

export const trackAddToCartEvent = ({
  product,
  quantity = 1,
  listName = "",
}) => {
  const gaItem = buildGaItem(product, {
    quantity,
    listName,
  });

  if (!gaItem) {
    return false;
  }

  return pushToDataLayer({
    event: "add_to_cart",
    ecommerce: {
      currency: CURRENCY,
      value: toNumber(gaItem.price) * clampQuantity(gaItem.quantity),
      items: [gaItem],
    },
  });
};

export const trackRemoveFromCartEvent = ({ product, quantity = 1 }) => {
  const gaItem = buildGaItem(product, {
    quantity,
  });

  if (!gaItem) {
    return false;
  }

  return pushToDataLayer({
    event: "remove_from_cart",
    ecommerce: {
      currency: CURRENCY,
      value: toNumber(gaItem.price) * clampQuantity(gaItem.quantity),
      items: [gaItem],
    },
  });
};

export const trackViewCartEvent = ({ cartItems = [], totalValue = 0 }) => {
  const items = toGaItemsFromCart(cartItems);
  return pushToDataLayer({
    event: "view_cart",
    ecommerce: {
      currency: CURRENCY,
      value: toNumber(totalValue),
      items,
    },
  });
};

export const trackBeginCheckoutEvent = ({
  cartItems = [],
  totalValue = 0,
  coupon = "",
}) => {
  const items = toGaItemsFromCart(cartItems, "checkout");
  const ecommerce = {
    currency: CURRENCY,
    value: toNumber(totalValue),
    items,
  };

  if (coupon) {
    ecommerce.coupon = String(coupon);
  }

  return pushToDataLayer({
    event: "begin_checkout",
    ecommerce,
  });
};

export const trackAddShippingInfoEvent = ({
  cartItems = [],
  totalValue = 0,
  shippingTier = "standard",
  coupon = "",
}) => {
  const items = toGaItemsFromCart(cartItems, "checkout_shipping");
  const ecommerce = {
    currency: CURRENCY,
    value: toNumber(totalValue),
    shipping_tier: String(shippingTier || "standard"),
    items,
  };

  if (coupon) {
    ecommerce.coupon = String(coupon);
  }

  return pushToDataLayer({
    event: "add_shipping_info",
    ecommerce,
  });
};

export const trackAddPaymentInfoEvent = ({
  cartItems = [],
  totalValue = 0,
  paymentType = "cod",
  coupon = "",
}) => {
  const items = toGaItemsFromCart(cartItems, "checkout_payment");
  const ecommerce = {
    currency: CURRENCY,
    value: toNumber(totalValue),
    payment_type: String(paymentType || "cod"),
    items,
  };

  if (coupon) {
    ecommerce.coupon = String(coupon);
  }

  return pushToDataLayer({
    event: "add_payment_info",
    ecommerce,
  });
};

export const trackPurchaseEvent = ({ order, fallbackCartItems = [] }) => {
  const transactionId = String(
    order?._id || order?.id || order?.transaction_id || "",
  ).trim();
  if (!transactionId) {
    return false;
  }

  const tracked = readTrackedPurchases();
  if (tracked.has(transactionId)) {
    return false;
  }

  const sourceItems = getOrderItems(order, fallbackCartItems);
  const items = sourceItems
    .map((item, index) =>
      buildGaItem(getOrderItemProduct(item), {
        quantity: item?.quantity,
        fallbackPrice: item?.price,
        index,
      }),
    )
    .filter(Boolean);

  const value = toNumber(order?.totalPrice, 0);
  const tax = toNumber(order?.taxPrice, 0);
  const shipping = toNumber(order?.shippingPrice, 0);
  const coupon = String(order?.coupon || "").trim();

  const payload = {
    event: "purchase",
    ecommerce: {
      transaction_id: transactionId,
      currency: CURRENCY,
      value,
      tax,
      shipping,
      items,
    },
  };

  if (coupon) {
    payload.ecommerce.coupon = coupon;
  }

  const pushed = pushToDataLayer(payload);
  if (pushed) {
    markPurchaseTracked(transactionId);
  }

  return pushed;
};

export const __testing = {
  buildGaItem,
  toGaItemsFromCart,
  readTrackedPurchases,
  markPurchaseTracked,
  PURCHASE_DEDUP_STORAGE_KEY,
};
