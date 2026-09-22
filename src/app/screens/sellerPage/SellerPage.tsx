import React, { useEffect, useState } from "react";
import {
  Container, Typography, Avatar, Box, Button,
  Rating, CircularProgress, IconButton, Tooltip, Chip,
} from "@mui/material";
import { useParams, useHistory } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import InventoryIcon from "@mui/icons-material/Inventory";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import StarIcon from "@mui/icons-material/Star";

import UserService from "../../services/UserService";
import { SellerProfile } from "../../../lib/types/seller";
import { serverApi } from "../../../lib/config";
import { WishlistItem } from "../../../lib/types/wishlist";
import { useCart } from "../../context/CartContext";
import { useWishlistContext } from "../../context/WishlistContext";
import { useCreateOrder } from "../../hooks/useCreateOrder";

const userService = new UserService();

function formatDate(d: Date | string | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
}

export function SellerPage() {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();

  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const { toggleWishlist, isInWishlist } = useWishlistContext();
  const { onAdd: addToCart }             = useCart();
  const { handleBuyNow, loading: buyNowLoading } = useCreateOrder();

  useEffect(() => {
    if (!id) { setLoading(false); setError("Seller ID is missing."); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);
    userService
      .getSeller(id)
      .then((data) => { if (!cancelled) setProfile(data); })
      .catch((err: any) => {
        if (!cancelled)
          setError(err?.response?.data?.message || err?.message || "Failed to load seller.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  /* ── LOADING ── */
  if (loading) {
    return (
      <Box className="sp-loading">
        <CircularProgress size={44} thickness={3} sx={{ color: "var(--fz-brand)" }} />
        <Typography className="sp-loading-text">Loading seller…</Typography>
      </Box>
    );
  }

  /* ── ERROR ── */
  if (error || !profile) {
    return (
      <Box className="sp-error">
        <Typography className="sp-error-title">Seller not found</Typography>
        <Typography className="sp-error-sub">
          {error || "This seller profile doesn't exist or has been removed."}
        </Typography>
        <Button className="sp-error-btn" onClick={() => history.push("/products")}>
          Explore products
        </Button>
      </Box>
    );
  }

  const { user, productsAdded, products, productsSold, topSellingProducts } = profile;
  const imagePath = user.userImage ? `${serverApi}/${user.userImage}` : undefined;

  /* ── PRODUCT CARD — same as pp-card ── */
  const renderProductCard = (product: any) => {
    const imgPath =
      product.productImages?.length
        ? `${serverApi}/${product.productImages[0]}`
        : "/img/product-placeholder.svg";

    const rawViews = product.productViews ?? product.views ?? product.viewsCount ?? 0;
    const views = Number(rawViews) || 0;
    const wished     = isInWishlist(product._id);
    const safeRating = Number(product.productRating ?? 0);
    const collLabel  = String(product.productCollection ?? "").replace(/-/g, " ");
    const inStock = Number(product.productStock ?? 0) > 0;

    return (
      <Box
        key={product._id}
        className="pp-card"
        onClick={() => history.push(`/products/detail/${product._id}`)}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            history.push(`/products/detail/${product._id}`);
          }
        }}
        role="link"
        tabIndex={0}
        aria-label={`View ${product.productName}`}
      >
        {/* Image */}
        <Box className="pp-card-img-wrap">
          <img
            src={imgPath}
            alt={product.productName}
            className="pp-card-img"
            onError={(e) => {
              (e.target as HTMLImageElement).onerror = null;
              (e.target as HTMLImageElement).src = "/img/product-placeholder.svg";
            }}
          />

          {/* Wishlist */}
          <IconButton
            className={`pp-card-wish ${wished ? "active" : ""}`}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
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
          >
            {wished
              ? <FavoriteIcon sx={{ fontSize: 16 }} />
              : <FavoriteBorderIcon sx={{ fontSize: 16 }} />}
          </IconButton>
        </Box>

        {/* Info */}
        <Box className="pp-card-info">
          {collLabel && (
            <Typography className="pp-card-collection">{collLabel}</Typography>
          )}

          <Typography className="pp-card-name" title={product.productName}>
            {product.productName}
          </Typography>

          <Box className="pp-card-rating-row">
            <Rating
              value={safeRating}
              precision={0.5}
              readOnly
              size="small"
              icon={<StarIcon sx={{ fontSize: 13, color: "var(--fz-accent)" }} />}
              emptyIcon={<StarIcon sx={{ fontSize: 13, opacity: 0.2 }} />}
            />
            <Typography className="pp-card-review-count">
              {safeRating > 0 ? safeRating.toFixed(1) : "New"}
            </Typography>
            <Box className="pp-card-views">
              <VisibilityIcon sx={{ fontSize: 12 }} />
              <span>{views.toLocaleString()}</span>
            </Box>
          </Box>

          <Box className="pp-card-bottom">
            <Typography className="pp-card-price">
              ${product.productPrice.toLocaleString()}
            </Typography>

            <Box
              className="pp-card-actions"
              onClick={(e) => e.stopPropagation()}
            >
              <Tooltip title={inStock ? "Add to cart" : "Out of stock"}>
                <IconButton
                  className="pp-card-cart-btn"
                  aria-label={`Add ${product.productName} to cart`}
                  disabled={!inStock}
                  onClick={() =>
                    addToCart({
                      _id: product._id,
                      name: product.productName,
                      price: product.productPrice,
                      quantity: 1,
                      image: product.productImages?.[0] ?? "",
                      collection: String(product.productCollection),
                    })
                  }
                >
                  <ShoppingCartIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>

              <Button
                className="pp-card-buy-btn"
                disabled={buyNowLoading || !inStock}
                aria-label={`Buy ${product.productName} now`}
                onClick={() => handleBuyNow(product, 1)}
              >
                {inStock ? "Buy Now" : "Sold out"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  };

  const activeProducts = products.filter(
    (product: any) => String(product.productStatus ?? "") === "ACTIVE",
  );
  const activeProductsById = new Map(
    activeProducts.map((product: any) => [String(product._id), product]),
  );
  const enrichedTopProducts = topSellingProducts
    .map((product: any) => {
      const fullProduct = activeProductsById.get(String(product._id));
      return fullProduct ? { ...product, ...fullProduct } : null;
    })
    .filter(Boolean);
  const topProductIds = new Set(enrichedTopProducts.map((product: any) => String(product._id)));
  const remainingProducts = activeProducts.filter(
    (product: any) => !topProductIds.has(String(product._id)),
  );

  /* ── RENDER ── */
  return (
    <div className="sp-page">
      <Container maxWidth="xl" className="sp-container">

        {/* Back btn */}
        <Button
          startIcon={<ArrowBackIcon />}
          className="sp-back-btn"
          onClick={() => (history.length > 1 ? history.goBack() : history.push("/products"))}
        >
          Back
        </Button>

        {/* ── HERO ── */}
        <Box className="sp-hero">
          <Box className="sp-hero-inner">

            {/* Avatar */}
            <Box className="sp-avatar-wrap">
              <Avatar
                src={imagePath}
                alt={user.userNick}
                className="sp-avatar"
              >
                <StorefrontIcon sx={{ fontSize: 44 }} />
              </Avatar>
            </Box>

            {/* Identity */}
            <Box className="sp-hero-info">
              <Box className="sp-hero-top">
                <Typography className="sp-seller-name">
                  {user.userNick}
                </Typography>
                <Chip
                  label={user.userStatus ?? "ACTIVE"}
                  className="sp-status-chip"
                />
              </Box>

              <Typography className="sp-store-kicker">Independent FENZO storefront</Typography>

              {/* Info pills */}
              <Box className="sp-info-pills">
                {user.userPhone && (
                  <Box className="sp-info-pill">
                    <PhoneIcon sx={{ fontSize: 14 }} />
                    <a href={`tel:${user.userPhone}`}>{user.userPhone}</a>
                  </Box>
                )}
                {user.userAddress && (
                  <Box className="sp-info-pill">
                    <LocationOnIcon sx={{ fontSize: 14 }} />
                    <span>{user.userAddress}</span>
                  </Box>
                )}
                <Box className="sp-info-pill">
                  <CalendarTodayIcon sx={{ fontSize: 14 }} />
                  <span>Joined {formatDate(user.createdAt)}</span>
                </Box>
              </Box>

              {user.userDesc && (
                <Typography className="sp-seller-desc">
                  {user.userDesc}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Stats strip */}
          <Box className="sp-stats-strip">
            <Box className="sp-stat">
              <Typography className="sp-stat-value">{productsAdded}</Typography>
              <Typography className="sp-stat-label">Products Listed</Typography>
            </Box>
            <Box className="sp-stat">
              <Typography className="sp-stat-value">{productsSold}</Typography>
              <Typography className="sp-stat-label">Products Sold</Typography>
            </Box>
            <Box className="sp-stat">
              <Typography className="sp-stat-value">
                {user.createdAt ? new Date(user.createdAt).getFullYear() : "—"}
              </Typography>
              <Typography className="sp-stat-label">Member Since</Typography>
            </Box>
            <Box className="sp-stat">
              <Typography className="sp-stat-value">
                {activeProducts.length}
              </Typography>
              <Typography className="sp-stat-label">In this catalog</Typography>
            </Box>
          </Box>
        </Box>

        {/* ── TOP SELLING ── */}
        {enrichedTopProducts.length > 0 && (
          <Box className="sp-section">
            <Box className="sp-section-head">
              <Box className="sp-section-head-left">
                <Box className="sp-section-icon" sx={{ background: "rgba(255,152,0,0.10)" }}>
                  <TrendingUpIcon sx={{ fontSize: 18, color: "#f59e0b" }} />
                </Box>
                <Box>
                  <Typography className="sp-section-title">
                    Top Selling Products
                  </Typography>
                  <Typography className="sp-section-sub">
                    Best performers in this store
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={`${enrichedTopProducts.length} items`}
                className="sp-count-chip"
              />
            </Box>

            <div className="pp-grid">
              {enrichedTopProducts.map((p) => renderProductCard(p))}
            </div>
          </Box>
        )}

        {/* ── ALL PRODUCTS ── */}
        {remainingProducts.length > 0 && (
          <Box className="sp-section">
            <Box className="sp-section-head">
              <Box className="sp-section-head-left">
                <Box className="sp-section-icon" sx={{ background: "rgba(200,150,12,0.10)" }}>
                  <InventoryIcon sx={{ fontSize: 18, color: "var(--fz-brand)" }} />
                </Box>
                <Box>
                  <Typography className="sp-section-title">
                    All Store Products
                  </Typography>
                  <Typography className="sp-section-sub">
                    Complete catalog from this seller
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={`${remainingProducts.length} items`}
                className="sp-count-chip"
              />
            </Box>

            <div className="pp-grid">
              {remainingProducts.map((p) => renderProductCard(p))}
            </div>
          </Box>
        )}

        {activeProducts.length === 0 && (
          <Box className="sp-empty-catalog">
            <InventoryIcon />
            <Typography className="sp-error-title">This storefront is getting ready</Typography>
            <Typography className="sp-error-sub">New products from this seller will appear here.</Typography>
            <Button className="sp-error-btn" onClick={() => history.push("/products")}>Explore FENZO</Button>
          </Box>
        )}

      </Container>
    </div>
  );
}
