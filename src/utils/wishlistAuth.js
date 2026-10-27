export const canManageWishlist = (isAuthenticated) => Boolean(isAuthenticated);

export const requireWishlistAuth = ({
  isAuthenticated,
  navigate,
  toast,
  redirectPath = "/login",
  message = "Please login or register to add products to wishlist",
}) => {
  if (canManageWishlist(isAuthenticated)) {
    return true;
  }

  if (toast) {
    toast.error(message);
  }

  if (navigate) {
    navigate(redirectPath);
  }

  return false;
};
