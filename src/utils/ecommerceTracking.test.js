import test from "node:test";
import assert from "node:assert/strict";
import {
  __testing,
  trackAddPaymentInfoEvent,
  trackAddShippingInfoEvent,
  trackAddToCartEvent,
  trackBeginCheckoutEvent,
  trackPurchaseEvent,
  trackRemoveFromCartEvent,
  trackSelectItem,
  trackViewCartEvent,
  trackViewItem,
  trackViewItemList,
} from "./ecommerceTracking.js";

class LocalStorageMock {
  constructor() {
    this.map = new Map();
  }

  getItem(key) {
    return this.map.has(key) ? this.map.get(key) : null;
  }

  setItem(key, value) {
    this.map.set(key, String(value));
  }

  removeItem(key) {
    this.map.delete(key);
  }
}

const createConsentState = (analyticsEnabled) => ({
  choices: {
    essential: true,
    functional: false,
    analytics: analyticsEnabled,
    marketing: false,
  },
});

const setupWindow = ({
  analyticsEnabled = true,
  withDataLayer = true,
} = {}) => {
  const windowMock = {
    localStorage: new LocalStorageMock(),
    __naashpatiCookieConsent: createConsentState(analyticsEnabled),
  };

  if (withDataLayer) {
    windowMock.dataLayer = [];
  }

  globalThis.window = windowMock;
  return windowMock;
};

test("blocks ecommerce pushes when analytics consent is rejected", () => {
  setupWindow({ analyticsEnabled: false });

  const pushed = trackAddToCartEvent({
    product: {
      _id: "p1",
      name: "No Track",
      category: "Sunglasses",
      price: 1000,
    },
    quantity: 1,
  });

  assert.equal(pushed, false);
  assert.equal(window.dataLayer.length, 0);
});

test("does not create a new dataLayer when missing", () => {
  setupWindow({ analyticsEnabled: true, withDataLayer: false });

  const pushed = trackViewItem({
    product: {
      _id: "p2",
      name: "Missing Layer",
      category: "Sunglasses",
      price: 1500,
    },
  });

  assert.equal(pushed, false);
  assert.equal("dataLayer" in window, false);
});

test("tracks view_item, view_item_list, and select_item with GA4 ecommerce shape", () => {
  setupWindow({ analyticsEnabled: true });

  const products = [
    {
      _id: "v1",
      name: "Aviator",
      category: "Sunglasses",
      price: 4999,
    },
    {
      _id: "v2",
      name: "Rimless",
      category: "Sunglasses",
      price: 5299,
    },
  ];

  assert.equal(trackViewItem({ product: products[0] }), true);
  assert.equal(trackViewItemList({ listName: "all_products", products }), true);
  assert.equal(
    trackSelectItem({
      product: products[1],
      listName: "all_products",
      index: 1,
    }),
    true,
  );

  const eventNames = window.dataLayer
    .filter((entry) => entry && entry.event)
    .map((entry) => entry.event);

  assert.deepEqual(eventNames, ["view_item", "view_item_list", "select_item"]);

  const selectPayload = window.dataLayer.find(
    (entry) => entry?.event === "select_item",
  );
  assert.equal(selectPayload.ecommerce.currency, "PKR");
  assert.equal(selectPayload.ecommerce.items[0].item_id, "v2");
  assert.equal(selectPayload.ecommerce.items[0].item_list_name, "all_products");
});

test("tracks add_to_cart, remove_from_cart, and view_cart", () => {
  setupWindow({ analyticsEnabled: true });

  const product = {
    _id: "c1",
    name: "Polarized",
    category: "Sunglasses",
    price: 3000,
  };

  const cartItems = [
    {
      product,
      quantity: 2,
      price: 3000,
    },
  ];

  assert.equal(trackAddToCartEvent({ product, quantity: 2 }), true);
  assert.equal(trackRemoveFromCartEvent({ product, quantity: 1 }), true);
  assert.equal(trackViewCartEvent({ cartItems, totalValue: 6000 }), true);

  const addPayload = window.dataLayer.find(
    (entry) => entry?.event === "add_to_cart",
  );
  const removePayload = window.dataLayer.find(
    (entry) => entry?.event === "remove_from_cart",
  );
  const viewCartPayload = window.dataLayer.find(
    (entry) => entry?.event === "view_cart",
  );

  assert.equal(addPayload.ecommerce.value, 6000);
  assert.equal(removePayload.ecommerce.value, 3000);
  assert.equal(viewCartPayload.ecommerce.items.length, 1);
  assert.equal(viewCartPayload.ecommerce.value, 6000);
});

test("tracks begin_checkout, add_shipping_info, and add_payment_info", () => {
  setupWindow({ analyticsEnabled: true });

  const cartItems = [
    {
      product: {
        _id: "k1",
        name: "Classic",
        category: "Sunglasses",
        price: 2500,
      },
      quantity: 2,
      price: 2500,
    },
  ];

  assert.equal(
    trackBeginCheckoutEvent({
      cartItems,
      totalValue: 5000,
    }),
    true,
  );

  assert.equal(
    trackAddShippingInfoEvent({
      cartItems,
      totalValue: 5000,
      shippingTier: "standard",
    }),
    true,
  );

  assert.equal(
    trackAddPaymentInfoEvent({
      cartItems,
      totalValue: 5000,
      paymentType: "cod",
    }),
    true,
  );

  const shippingPayload = window.dataLayer.find(
    (entry) => entry?.event === "add_shipping_info",
  );
  const paymentPayload = window.dataLayer.find(
    (entry) => entry?.event === "add_payment_info",
  );

  assert.equal(shippingPayload.ecommerce.shipping_tier, "standard");
  assert.equal(paymentPayload.ecommerce.payment_type, "cod");
});

test("tracks purchase exactly once per transaction id", () => {
  setupWindow({ analyticsEnabled: true });

  const order = {
    _id: "order-123",
    totalPrice: 7777,
    taxPrice: 444,
    shippingPrice: 250,
    orderItems: [
      {
        product: "p-purchase",
        name: "Night Vision",
        category: "Sunglasses",
        price: 7777,
        quantity: 1,
      },
    ],
  };

  const firstPush = trackPurchaseEvent({ order });
  const secondPush = trackPurchaseEvent({ order });

  assert.equal(firstPush, true);
  assert.equal(secondPush, false);

  const purchaseEvents = window.dataLayer.filter(
    (entry) => entry?.event === "purchase",
  );
  assert.equal(purchaseEvents.length, 1);
  assert.equal(purchaseEvents[0].ecommerce.transaction_id, "order-123");
  assert.equal(purchaseEvents[0].ecommerce.currency, "PKR");

  const stored = JSON.parse(
    window.localStorage.getItem(__testing.PURCHASE_DEDUP_STORAGE_KEY) || "[]",
  );
  assert.equal(stored.includes("order-123"), true);
});

test("does not track purchase for invalid/failed order payload", () => {
  setupWindow({ analyticsEnabled: true });

  const pushed = trackPurchaseEvent({
    order: {
      totalPrice: 100,
      orderItems: [],
    },
  });

  assert.equal(pushed, false);
  const purchaseEvents = window.dataLayer.filter(
    (entry) => entry?.event === "purchase",
  );
  assert.equal(purchaseEvents.length, 0);
});

test("consent withdrawal stops future ecommerce events", () => {
  setupWindow({ analyticsEnabled: true });

  assert.equal(
    trackAddToCartEvent({
      product: {
        _id: "consent-1",
        name: "Before Withdraw",
        category: "Sunglasses",
        price: 1999,
      },
      quantity: 1,
    }),
    true,
  );

  window.__naashpatiCookieConsent = createConsentState(false);

  assert.equal(
    trackAddToCartEvent({
      product: {
        _id: "consent-2",
        name: "After Withdraw",
        category: "Sunglasses",
        price: 1999,
      },
      quantity: 1,
    }),
    false,
  );

  const addEvents = window.dataLayer.filter(
    (entry) => entry?.event === "add_to_cart",
  );
  assert.equal(addEvents.length, 1);
});
