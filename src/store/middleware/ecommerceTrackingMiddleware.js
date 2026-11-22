import { addItemsToCart, addToCart, removeFromCart } from "../slices/cartSlice";
import {
  trackAddToCartEvent,
  trackRemoveFromCartEvent,
} from "../../utils/ecommerceTracking";

const findCartItemById = (items, productId) =>
  (Array.isArray(items) ? items : []).find(
    (item) => String(item?.product?._id) === String(productId),
  );

export const ecommerceTrackingMiddleware = (storeAPI) => (next) => (action) => {
  const prevState = storeAPI.getState();
  const result = next(action);
  const nextState = storeAPI.getState();

  if (action.type === addToCart.type) {
    const product = action?.payload?.product;
    const quantity = action?.payload?.quantity || 1;
    trackAddToCartEvent({
      product,
      quantity,
    });
    return result;
  }

  if (action.type === addItemsToCart.type) {
    const items = Array.isArray(action?.payload) ? action.payload : [];
    items.forEach((entry) => {
      trackAddToCartEvent({
        product: entry?.product,
        quantity: entry?.quantity || 1,
      });
    });
    return result;
  }

  if (action.type === removeFromCart.type) {
    const productId = action?.payload;
    const previousItem = findCartItemById(prevState?.cart?.items, productId);
    const itemStillExists = findCartItemById(nextState?.cart?.items, productId);

    if (previousItem && !itemStillExists) {
      trackRemoveFromCartEvent({
        product: previousItem.product,
        quantity: previousItem.quantity,
      });
    }
  }

  return result;
};
