import React from "react";
import {
  Container, Box, Typography, Button, IconButton, Rating, Tooltip,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StarIcon from "@mui/icons-material/Star";
import { useHistory } from "react-router-dom";
import { createSelector } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { retrieveFeaturedProducts } from "./selector";
import { Product } from "../../../lib/types/product";
import { CartItem } from "../../../lib/types/cart";
import { WishlistItem } from "../../../lib/types/wishlist";
import { serverApi } from "../../../lib/config";
import { useCart } from "../../context/CartContext";
import { useWishlistContext } from "../../context/WishlistContext";
import { useCreateOrder } from "../../hooks/useCreateOrder";

const featuredRetriever = createSelector(
  retrieveFeaturedProducts,
  (featuredProducts) => ({ featuredProducts })
);

export function FeaturedProducts() {
  const history = useHistory();
  const { onAdd: addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlistContext();
  const { handleBuyNow, loading: buyNowLoading } = useCreateOrder();
  const { featuredProducts } = useSelector(featuredRetriever);
  const products = Array.isArray(featuredProducts) ? featuredProducts : [];

  return (
    <div className="lp-products-section">
      <Container maxWidth="xl">
        <div className="lp-section-head">
          <div>
            <span className="lp-section-eyebrow">Freshly selected</span>
            <Typography className="lp-section-title">New and noteworthy</Typography>
            <Typography className="lp-section-sub">
              Recently added pieces chosen for quality, utility, and style.
            </Typography>
          </div>
        </div>

        {/* ── exact same grid + card as Products page ── */}
        <div className="pp-grid">
          {products.slice(0, 8).map((product: Product) => {
            const img = product.productImages?.[0]
              ? `${serverApi}/${product.productImages[0]}`
              : "/img/product-placeholder.svg";

            const wished = isInWishlist(product._id);
            const ratingVal = Number(product.productRating ?? 0);
            const safeRating = Number.isFinite(ratingVal)
              ? Math.min(Math.max(ratingVal, 0), 5)
              : 0;
            const inStock = Number(product.productStock ?? 0) > 0;
            const collLabel = String(product.productCollection ?? "")
              .replace(/-/g, " ");

            return (
              <Box
                key={product._id}
                className="pp-card"
                onClick={() => history.push(`/products/detail/${product._id}`)}
                role="link"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    history.push(`/products/detail/${product._id}`);
                  }
                }}
              >
                {/* ── Image ── */}
                <Box className="pp-card-img-wrap">
                  <img
                    src={img}
                    alt={product.productName}
                    className="pp-card-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/img/product-placeholder.svg";
                    }}
                  />

                  {/* Wishlist */}
                  <IconButton
                    className={`pp-card-wish ${wished ? "active" : ""}`}
                    aria-label={wished
                      ? `Remove ${product.productName} from wishlist`
                      : `Add ${product.productName} to wishlist`}
                    onClick={(e) => {
                      e.stopPropagation();
                      const item: WishlistItem = {
                        _id: product._id,
                        name: product.productName,
                        price: product.productPrice,
                        image: product.productImages?.[0] ?? "",
                        collection: String(product.productCollection),
                      };
                      toggleWishlist(item);
                    }}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    {wished
                      ? <FavoriteIcon sx={{ fontSize: 16 }} />
                      : <FavoriteBorderIcon sx={{ fontSize: 16 }} />}
                  </IconButton>
                </Box>

                {/* ── Info ── */}
                <Box className="pp-card-info">
                  {collLabel && (
                    <Typography className="pp-card-collection">
                      {collLabel}
                    </Typography>
                  )}

                  <Typography className="pp-card-name" title={product.productName}>
                    {product.productName}
                  </Typography>

                  {/* Rating row */}
                  <Box className="pp-card-rating-row">
                    <Rating
                      value={safeRating}
                      precision={0.5}
                      readOnly
                      size="small"
                      icon={
                        <StarIcon sx={{ fontSize: 13, color: "var(--gold)" }} />
                      }
                      emptyIcon={
                        <StarIcon sx={{ fontSize: 13, opacity: 0.2 }} />
                      }
                    />
                    <Typography className="pp-card-review-count">
                      ({safeRating.toFixed(1)})
                    </Typography>
                    <Box className="pp-card-views">
                      <VisibilityIcon sx={{ fontSize: 12 }} />
                      <span>{product.productViews}</span>
                    </Box>
                  </Box>

                  {/* Price + actions */}
                  <Box className="pp-card-bottom">
                    <Typography className="pp-card-price">
                      ${product.productPrice.toLocaleString()}
                    </Typography>

                    <Box
                      className="pp-card-actions"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <Tooltip title={inStock ? "Add to cart" : "Sold out"}>
                        <IconButton
                          className="pp-card-cart-btn"
                          aria-label={inStock
                            ? `Add ${product.productName} to cart`
                            : `${product.productName} is sold out`}
                          disabled={!inStock}
                          onClick={() => {
                            const cartItem: CartItem = {
                              _id: product._id,
                              name: product.productName,
                              price: product.productPrice,
                              quantity: 1,
                              image: product.productImages?.[0] ?? "",
                              collection: String(product.productCollection),
                            };
                            addToCart(cartItem);
                          }}
                        >
                          <ShoppingCartIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>

                      <Button
                        className="pp-card-buy-btn"
                        disabled={buyNowLoading || !inStock}
                        onClick={() => handleBuyNow(product, 1)}
                      >
                        {inStock ? "Buy Now" : "Sold out"}
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
