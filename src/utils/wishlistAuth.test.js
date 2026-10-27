import test from "node:test";
import assert from "node:assert/strict";
import { canManageWishlist } from "./wishlistAuth.js";

test("guests cannot manage wishlist items", () => {
  assert.equal(canManageWishlist(false), false);
});

test("authenticated users can manage wishlist items", () => {
  assert.equal(canManageWishlist(true), true);
});
