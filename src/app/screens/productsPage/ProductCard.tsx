import React, { useState, useEffect } from "react";
import {
  Container, Grid, Box, Typography, Button, Rating,
  Chip, IconButton, CircularProgress, Breadcrumbs,
  Link, Divider, Tooltip, TextField, Alert, Avatar
} from "@mui/material";

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HomeIcon from '@mui/icons-material/Home';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import LoopOutlinedIcon from '@mui/icons-material/LoopOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import StarIcon from '@mui/icons-material/Star';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

import { useHistory, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import { retrieveProducts } from "./selector";
import { retrieveTopSellers } from "../homePage/selector";
import { setTopSellers } from "../homePage/slice";
import {
  Product,
  ProductReview,
  ProductReviewSummary,
} from "../../../lib/types/product";
import { User } from "../../../lib/types/user";
import { serverApi } from "../../../lib/config";
import ProductService from "../../services/ProductService";
import UserService from "../../services/UserService";
import { useCart } from "../../context/CartContext";
import { useWishlistContext } from "../../context/WishlistContext";
import { useCreateOrder } from "../../hooks/useCreateOrder";
import { CartItem } from "../../../lib/types/cart";
import { WishlistItem } from "../../../lib/types/wishlist";
import { useGlobals } from "../../hooks/useGlobals";

const emptyReviewSummary: ProductReviewSummary = {
  average: 0,
  total: 0,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
};

const ProductsRetriever = createSelector(
  retrieveProducts,
  (products) => ({ products })
);

const TopSellersRetriever = createSelector(
  retrieveTopSellers,
  (topSellers) => ({ topSellers })
);

export function ProductCard() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { onAdd: addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlistContext();
  const { handleBuyNow, loading: buyNowLoading } = useCreateOrder();
  const { authUser } = useGlobals();
  const { productId } = useParams<{ productId: string }>();
  const { products } = useSelector(ProductsRetriever);
  const { topSellers } = useSelector(TopSellersRetriever);
  const chosenProduct = products?.find((p: Product) => p._id === productId);

  useEffect(() => {
    if (!Array.isArray(topSellers) || topSellers.length === 0) {
      new UserService().getTopSellers()
        .then((data) => dispatch(setTopSellers(data)))
        .catch(() => {});
    }
  }, [topSellers, dispatch]);

  const [product, setProduct] = useState<Product | null>(chosenProduct || null);
  const [related, setRelated] = useState<Product[]>([]);
  const [seller, setSeller] = useState<User | null>(null);
  const [loading, setLoading] = useState(!chosenProduct);
  const [activeImage, setActiveImage] = useState("");
  const [activeThumb, setActiveThumb] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [zoomed, setZoomed] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewSummary, setReviewSummary] = useState<ProductReviewSummary>(emptyReviewSummary);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState<number | null>(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [shareLabel, setShareLabel] = useState("Share");

  const totalPrice = (product?.productPrice ?? 0) * quantity;
  const originalUnitPrice = Number(product?.productDiscountPrice ?? 0);
  const hasProductSale = Boolean(product && originalUnitPrice > product.productPrice);
  const originalTotalPrice = hasProductSale ? originalUnitPrice * quantity : 0;
  const productSalePercent = hasProductSale && originalUnitPrice > 0
    ? Math.round(((originalUnitPrice - (product?.productPrice ?? 0)) / originalUnitPrice) * 100)
    : 0;
  const availableStock = Math.max(0, Number(product?.productStock ?? 0));
  const inStock = availableStock > 0;
  const sellerProfileId = seller?._id || seller?.userId || product?.userId;

  const handleSellerProfile = () => {
    if (!sellerProfileId) return;
    history.push(`/user/seller/${sellerProfileId}`);
  };

  const formatImage = (img?: string) =>
    img ? `${serverApi}/${img}` : "/img/product-placeholder.svg";

  useEffect(() => {
    setProduct(null);
    setRelated([]);
    setSeller(null);
    setActiveImage("");
    setActiveThumb(0);
    setQuantity(1);
    setZoomed(false);
    setAddedToCart(false);
    setLoading(true);
  }, [productId]);

  useEffect(() => {
    if (!productId) {
      setProduct(null);
      setLoading(false);
      return;
    }
    let active = true;
    setSeller(null);
    const productService = new ProductService();
    const userService = new UserService();

    const resolveSeller = (productData: any, apiSeller: User | null) => {
      const userData = productData?.user || productData?.seller;
      if (userData && (userData.userNick || userData.userId)) return userData;
      if (apiSeller) return apiSeller;
      const sellers = Array.isArray(topSellers) ? topSellers : [];
      const matched =
        productData?.userId &&
        sellers.find(
          (s: User) =>
            s._id === productData.userId || s.userId === productData.userId
        );
      if (matched) return matched;
      return { userNick: "Fenzo Store", userImage: undefined } as User;
    };

    const fetchSellerAndProduct = (data: any) => {
      if (!active) return;
      const productData =
        data?.value?.product || data?.value || data;
      setProduct(productData);
      setActiveImage(formatImage(productData?.productImages?.[0]));
      setActiveThumb(0);
      const userData =
        productData?.user ||
        productData?.seller ||
        data?.value?.user ||
        data?.value?.seller;
      if (userData && (userData.userNick || userData.userId)) {
        setSeller(userData);
        return;
      }
      if (productData?.userId) {
        userService
          .getSeller(productData.userId)
          .then((sellerProfile) => {
            if (active) setSeller(resolveSeller(productData, sellerProfile.user));
          })
          .catch(() => {
            if (active) setSeller(resolveSeller(productData, null));
          });
      } else {
        setSeller(resolveSeller(productData, null));
      }
    };

    if (chosenProduct) {
      setProduct(chosenProduct);
      setActiveImage(formatImage(chosenProduct.productImages?.[0]));
      setSeller(resolveSeller(chosenProduct, null));
      setLoading(false);
      productService
        .getProduct(productId)
        .then(fetchSellerAndProduct)
        .catch(() => {});
    } else {
      setLoading(true);
      productService
        .getProduct(productId)
        .then((data) => {
          fetchSellerAndProduct(data);
        })
        .catch(() => {
          if (active) setProduct(null);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }

    return () => {
      active = false;
    };
  }, [productId, chosenProduct, topSellers]);

  useEffect(() => {
    const stock = Math.max(1, Number(product?.productStock ?? 0));
    setQuantity((current) => Math.min(Math.max(current, 1), stock));
  }, [product?._id, product?.productStock]);

  useEffect(() => {
    if (!product || !product._id) {
      setRelated([]);
      return;
    }
    const svc = new ProductService();
    let active = true;

    const loadRelated = async () => {
      setRelatedLoading(true);
      try {
        let items = await svc.getSimilarProducts(product._id, 1, 8);
        let filtered = Array.isArray(items)
          ? items.filter((item) => item._id !== product._id)
          : [];

        if (filtered.length === 0) {
          items = await svc.getProducts({
            page: 1,
            limit: 9,
            order: "createdAt",
            productCollection: product.productCollection,
          });
          filtered = items.filter((item) => item._id !== product._id);
        }

        if (active) setRelated(filtered.slice(0, 8));
      } catch {
        if (active) setRelated([]);
      } finally {
        if (active) setRelatedLoading(false);
      }
    };

    loadRelated();
    return () => { active = false; };
  }, [product]);

  useEffect(() => {
    if (!productId) return;
    let active = true;
    const svc = new ProductService();

    setReviewsLoading(true);
    svc.getProductReviews(productId)
      .then((data) => {
        if (!active) return;
        setReviews(Array.isArray(data.reviews) ? data.reviews : []);
        setReviewSummary(data.summary ?? emptyReviewSummary);
      })
      .catch(() => {
        if (!active) return;
        setReviews([]);
        setReviewSummary(emptyReviewSummary);
      })
      .finally(() => {
        if (active) setReviewsLoading(false);
      });

    return () => { active = false; };
  }, [productId]);

  const handleQuantity = (type: "inc" | "dec") => {
    if (type === "inc" && quantity < availableStock) setQuantity((prev) => prev + 1);
    if (type === "dec" && quantity > 1) setQuantity((prev) => prev - 1);
  };

  const handleAddToCart = () => {
    if (!product || !inStock) return;
    const cartItem: CartItem = {
      _id: product._id,
      name: product.productName,
      price: product.productPrice,
      quantity,
      image: product.productImages?.[0] ?? "",
      collection: String(product.productCollection),
    };
    addToCart(cartItem);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: product?.productName || "FENZO product",
      text: product?.productDesc || "Discover this product on FENZO.",
      url: window.location.href,
    };

    try {
      if (navigator.share) await navigator.share(shareData);
      else if (navigator.clipboard) await navigator.clipboard.writeText(shareData.url);
      else throw new Error("Sharing is not supported");
      setShareLabel("Shared");
      window.setTimeout(() => setShareLabel("Share"), 1800);
    } catch (error: any) {
      if (error?.name !== "AbortError") {
        setShareLabel("Unable to share");
        window.setTimeout(() => setShareLabel("Share"), 1800);
      }
    }
  };

  const handleReviewSubmit = async () => {
    setReviewError("");
    setReviewSuccess("");

    if (!authUser) {
      setReviewError("Please log in to write a review.");
      return;
    }
    if (!reviewRating || reviewRating < 1) {
      setReviewError("Choose a rating from 1 to 5 stars.");
      return;
    }
    const comment = reviewComment.trim();
    if (comment.length < 3) {
      setReviewError("Your comment must contain at least 3 characters.");
      return;
    }

    setReviewSubmitting(true);
    try {
      const data = await new ProductService().saveProductReview(productId, {
        rating: reviewRating,
        comment,
      });
      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
      setReviewSummary(data.summary ?? emptyReviewSummary);
      setProduct((current) => current
        ? { ...current, productRating: data.summary?.average ?? current.productRating }
        : current);
      setReviewComment("");
      setReviewRating(0);
      setReviewSuccess("Thank you — your review has been published.");
    } catch (error: any) {
      setReviewError(error?.response?.data?.message || "Your review could not be saved.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box className="pc-loading-screen">
        <Box className="pc-loading-inner">
          <CircularProgress
            size={48}
            thickness={3}
            sx={{ color: "var(--pc-gold)" }}
          />
          <Typography className="pc-loading-text">
            Loading product…
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box className="pc-notfound">
        <Box className="pc-notfound-inner">
          <Typography className="pc-notfound-code">404</Typography>
          <Typography className="pc-notfound-title">
            Product not found
          </Typography>
          <Typography className="pc-notfound-sub">
            The item you're looking for doesn't exist or has been removed.
          </Typography>
          <Button
            className="pc-notfound-btn"
            onClick={() => history.push("/products")}
          >
            Back to Store
          </Button>
        </Box>
      </Box>
    );
  }

  const images = product.productImages?.length
    ? product.productImages.map((img) => `${serverApi}/${img}`)
    : ["/img/product-placeholder.svg"];

  const averageRating = reviewSummary.total > 0
    ? reviewSummary.average
    : Number(product.productRating ?? 0);
  const reviewCount = reviewSummary.total;

  return (
    <div className="pc-page">
      <Container maxWidth="xl" className="pc-container">

        {/* ── TOP NAV ── */}
        <Box className="pc-topnav">
          <Button
            startIcon={<ArrowBackIcon />}
            className="pc-back-btn"
            onClick={() => history.push("/products")}
          >
            Back
          </Button>

          <Breadcrumbs separator="/" className="pc-breadcrumbs">
            <Link
              className="pc-bread-link"
              onClick={() => history.push("/")}
            >
              <HomeIcon sx={{ fontSize: 14 }} />
              Home
            </Link>
            <Link
              className="pc-bread-link"
              onClick={() => history.push("/products")}
            >
              Products
            </Link>
            <Typography className="pc-bread-current">
              {product.productName}
            </Typography>
          </Breadcrumbs>

          <Tooltip title={shareLabel}>
            <IconButton className="pc-share-btn" aria-label="Share this product" onClick={handleShare}>
              <ShareOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* ── MAIN GRID ── */}
        <Grid container spacing={4} className="pc-main-grid">

          {/* ── LEFT: GALLERY ── */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box className="pc-gallery">

              {/* Main Image */}
              <Box
                className={`pc-main-img-wrap ${zoomed ? "zoomed" : ""}`}
                onClick={() => setZoomed((z) => !z)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setZoomed((value) => !value);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={zoomed ? "Zoom out product image" : "Zoom in product image"}
              >
                <img
                  src={activeImage || images[0]}
                  alt={product.productName}
                  className="pc-main-img"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "/img/product-placeholder.svg";
                  }}
                />

                {/* Overlays */}
                <Box className="pc-img-overlay">
                  <Chip
                    label={product.productCollection}
                    className="pc-collection-badge"
                  />
                  <span className="pc-zoom-btn" aria-hidden="true">
                    <ZoomInIcon fontSize="small" />
                  </span>
                </Box>

                {/* Image counter */}
                {images.length > 1 && (
                  <Box className="pc-img-counter">
                    {activeThumb + 1} / {images.length}
                  </Box>
                )}
              </Box>

              {/* Thumbnails */}
              {images.length > 1 && (
                <Box className="pc-thumbs">
                  {images.map((img, i) => (
                    <Box
                      key={i}
                      className={`pc-thumb ${activeThumb === i ? "active" : ""}`}
                      onClick={() => {
                        setActiveImage(img);
                        setActiveThumb(i);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setActiveImage(img);
                          setActiveThumb(i);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`View product image ${i + 1}`}
                    >
                      <img
                        src={img}
                        alt={`${product.productName}, view ${i + 1}`}
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = "/img/product-placeholder.svg";
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Grid>

          {/* ── RIGHT: DETAILS ── */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box className="pc-details">

              {/* Category pill + views */}
              <Box className="pc-meta-row">
                <Chip
                  label={product.productCollection}
                  className="pc-cat-pill"
                />
                <Box className="pc-views-pill">
                  <VisibilityIcon sx={{ fontSize: 13 }} />
                  <span>{product.productViews} views</span>
                </Box>
              </Box>

              {/* Product Name */}
              <Typography component="h1" className="pc-product-name">
                {product.productName}
              </Typography>

              {/* Rating row */}
              <Box className="pc-rating-row">
                <Rating
                  value={averageRating}
                  readOnly
                  precision={0.5}
                  size="small"
                  icon={<StarIcon sx={{ fontSize: 16, color: "var(--pc-gold)" }} />}
                  emptyIcon={<StarIcon sx={{ fontSize: 16, opacity: 0.25 }} />}
                />
                <Typography className="pc-rating-count">
                  {averageRating.toFixed(1)} · {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                </Typography>
                <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: "var(--pc-border)" }} />
                <Typography className="pc-stock-status">
                  {product.productStock > 0 ? `✓ ${product.productStock} in stock` : "Out of stock"}
                </Typography>
              </Box>

              {/* Price block */}
              <Box className="pc-price-block">
                {hasProductSale && (
                  <Box className="pc-price-sale-row">
                    <span className="pc-price-sale-badge">{productSalePercent}% off</span>
                    <span className="pc-price-old">${originalTotalPrice.toLocaleString()}</span>
                  </Box>
                )}
                <Typography className="pc-price-main">
                  ${totalPrice.toLocaleString()}
                </Typography>
                {quantity > 1 && (
                  <Typography className="pc-price-unit">
                    ${product.productPrice.toLocaleString()} / each
                  </Typography>
                )}
              </Box>

              <Divider className="pc-divider" />

              {/* Description */}
              <Typography className="pc-desc">
                {product.productDesc ||
                  "Premium quality product crafted with exceptional materials for lasting performance and elegance."}
              </Typography>

              {/* Seller */}
              <Box
                className="pc-seller-row"
                onClick={handleSellerProfile}
                sx={{ cursor: sellerProfileId ? "pointer" : "default" }}
                onKeyDown={(event) => {
                  if (sellerProfileId && (event.key === "Enter" || event.key === " ")) {
                    event.preventDefault();
                    handleSellerProfile();
                  }
                }}
                role={sellerProfileId ? "link" : undefined}
                tabIndex={sellerProfileId ? 0 : undefined}
              >
                <Avatar
                  src={seller?.userImage ? `${serverApi}/${seller.userImage}` : undefined}
                  className="pc-seller-avatar"
                >
                  {(seller?.userNick || "F").charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography className="pc-seller-label">Sold by</Typography>
                  <Typography className="pc-seller-name">
                    {seller?.userNick || "Fenzo Store"}
                  </Typography>
                </Box>
                {sellerProfileId && <ArrowForwardRoundedIcon className="pc-verified-icon" fontSize="small" />}
              </Box>

              <Divider className="pc-divider" />

              {/* Quantity */}
              <Box className="pc-qty-section">
                <Typography className="pc-qty-label">Quantity</Typography>
                <Box className="pc-qty-control">
                  <IconButton
                    className="pc-qty-btn"
                    aria-label="Decrease quantity"
                    onClick={() => handleQuantity("dec")}
                    disabled={quantity <= 1}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <Typography className="pc-qty-value">{quantity}</Typography>
                  <IconButton
                    className="pc-qty-btn"
                    aria-label="Increase quantity"
                    onClick={() => handleQuantity("inc")}
                    disabled={!inStock || quantity >= availableStock}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box className="pc-actions">
                <Button
                  className={`pc-btn-cart ${addedToCart ? "added" : ""}`}
                  startIcon={<ShoppingCartIcon />}
                  fullWidth
                  disabled={!inStock}
                  onClick={handleAddToCart}
                >
                  {addedToCart ? "Added!" : inStock ? "Add to Cart" : "Out of stock"}
                </Button>

                <Button
                  className="pc-btn-buy"
                  fullWidth
                  disabled={buyNowLoading || !inStock}
                  onClick={() => handleBuyNow(product as any, quantity)}
                >
                  {buyNowLoading ? "Processing…" : "Buy Now"}
                </Button>

                <Tooltip
                  title={
                    isInWishlist(product._id)
                      ? "Remove from wishlist"
                      : "Add to wishlist"
                  }
                >
                  <IconButton
                    className={`pc-btn-wish ${isInWishlist(product._id) ? "active" : ""}`}
                    aria-label={isInWishlist(product._id) ? `Remove ${product.productName} from wishlist` : `Add ${product.productName} to wishlist`}
                    onClick={() => {
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
                    {isInWishlist(product._id) ? (
                      <FavoriteIcon />
                    ) : (
                      <FavoriteBorderIcon />
                    )}
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Perks */}
              <Box className="pc-perks">
                <Box className="pc-perk-item">
                  <LocalShippingOutlinedIcon className="pc-perk-icon" />
                  <Box>
                    <Typography className="pc-perk-title">
                      Free Delivery
                    </Typography>
                    <Typography className="pc-perk-sub">
                      Orders over $100
                    </Typography>
                  </Box>
                </Box>
                <Box className="pc-perk-item">
                  <VerifiedOutlinedIcon className="pc-perk-icon" />
                  <Box>
                    <Typography className="pc-perk-title">
                      Seller details
                    </Typography>
                    <Typography className="pc-perk-sub">
                      Product information supplied
                    </Typography>
                  </Box>
                </Box>
                <Box className="pc-perk-item">
                  <LoopOutlinedIcon className="pc-perk-icon" />
                  <Box>
                    <Typography className="pc-perk-title">
                      Live availability
                    </Typography>
                    <Typography className="pc-perk-sub">
                      Based on current stock
                    </Typography>
                  </Box>
                </Box>
              </Box>

            </Box>
          </Grid>
        </Grid>

        {/* ── REVIEWS ── */}
        <Box className="pc-reviews" id="reviews">
          <Box className="pc-section-heading">
            <Box>
              <Typography className="pc-section-eyebrow">Community feedback</Typography>
              <Typography className="pc-section-title">Ratings & reviews</Typography>
              <Typography className="pc-section-subtitle">
                Honest feedback from people who discovered this product on FENZO.
              </Typography>
            </Box>
            <RateReviewOutlinedIcon className="pc-section-icon" />
          </Box>

          <Grid container spacing={3} className="pc-review-overview">
            <Grid size={{ xs: 12, md: 5 }}>
              <Box className="pc-rating-summary-card">
                <Box className="pc-rating-score-wrap">
                  <Typography className="pc-rating-score">{averageRating.toFixed(1)}</Typography>
                  <Box>
                    <Rating value={averageRating} precision={0.1} readOnly />
                    <Typography className="pc-rating-total">
                      Based on {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                    </Typography>
                  </Box>
                </Box>

                <Box className="pc-rating-bars">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const amount = reviewSummary.distribution?.[star] ?? 0;
                    const width = reviewCount > 0 ? (amount / reviewCount) * 100 : 0;
                    return (
                      <Box className="pc-rating-bar-row" key={star}>
                        <span>{star}</span>
                        <StarIcon />
                        <Box className="pc-rating-bar-track">
                          <span style={{ width: `${width}%` }} />
                        </Box>
                        <small>{amount}</small>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
              <Box className="pc-review-form-card">
                <Typography className="pc-review-form-title">
                  {authUser ? "Share your experience" : "Sign in to leave a review"}
                </Typography>
                <Typography className="pc-review-form-sub">
                  Your review helps other shoppers make a confident choice.
                </Typography>

                <Box className="pc-review-rating-input">
                  <span>Your rating</span>
                  <Rating
                    value={reviewRating}
                    onChange={(_event, value) => setReviewRating(value)}
                    size="large"
                    disabled={!authUser || reviewSubmitting}
                  />
                </Box>

                <TextField
                  className="pc-review-field"
                  value={reviewComment}
                  onChange={(event) => setReviewComment(event.target.value.slice(0, 1000))}
                  multiline
                  minRows={3}
                  fullWidth
                  disabled={!authUser || reviewSubmitting}
                  placeholder={authUser ? "What did you like about this product?" : "Log in to share your thoughts"}
                  helperText={`${reviewComment.length}/1000`}
                />

                {reviewError && <Alert severity="error" className="pc-review-alert">{reviewError}</Alert>}
                {reviewSuccess && <Alert severity="success" className="pc-review-alert">{reviewSuccess}</Alert>}

                {authUser ? (
                  <Button
                    className="pc-review-submit"
                    endIcon={reviewSubmitting ? <CircularProgress size={16} color="inherit" /> : <SendRoundedIcon />}
                    disabled={reviewSubmitting}
                    onClick={handleReviewSubmit}
                  >
                    {reviewSubmitting ? "Publishing…" : "Publish review"}
                  </Button>
                ) : (
                  <Button
                    className="pc-review-login"
                    endIcon={<ArrowForwardRoundedIcon />}
                    onClick={() => history.push("/login")}
                  >
                    Log in to continue
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>

          <Box className="pc-review-list">
            {reviewsLoading ? (
              <Box className="pc-review-list-state">
                <CircularProgress size={28} />
                <Typography>Loading reviews…</Typography>
              </Box>
            ) : reviews.length === 0 ? (
              <Box className="pc-review-empty">
                <RateReviewOutlinedIcon />
                <Typography className="pc-review-empty-title">No reviews yet</Typography>
                <Typography>Be the first person to share an experience with this product.</Typography>
              </Box>
            ) : (
              reviews.map((review) => {
                const reviewUser = typeof review.userId === "object" ? review.userId : null;
                const avatar = reviewUser?.userImage ? `${serverApi}/${reviewUser.userImage}` : undefined;
                return (
                  <Box className="pc-review-item" key={review._id}>
                    <Avatar src={avatar} className="pc-review-avatar">
                      {(reviewUser?.userNick || "F").charAt(0).toUpperCase()}
                    </Avatar>
                    <Box className="pc-review-body">
                      <Box className="pc-review-meta">
                        <Box>
                          <Typography className="pc-review-author">
                            {reviewUser?.userNick || "FENZO shopper"}
                          </Typography>
                          <Typography className="pc-review-date">
                            {new Intl.DateTimeFormat("en", {
                              year: "numeric", month: "short", day: "numeric",
                            }).format(new Date(review.updatedAt))}
                          </Typography>
                        </Box>
                        <Rating value={review.rating} readOnly size="small" />
                      </Box>
                      <Typography className="pc-review-comment">{review.comment}</Typography>
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>
        </Box>

        {/* ── RELATED PRODUCTS ── */}
        <Box className="pc-related">
            <Box className="pc-related-header">
              <Box>
                <Typography className="pc-section-eyebrow">Continue exploring</Typography>
                <Typography className="pc-related-title">You may also like</Typography>
                <Typography className="pc-section-subtitle">
                  More curated finds from {product.productCollection.toLowerCase()}.
                </Typography>
              </Box>
              <Button
                className="pc-related-see-all"
                onClick={() =>
                  history.push(
                    `/products/${product.productCollection}`
                  )
                }
              >
                See all →
              </Button>
            </Box>

            {relatedLoading ? (
              <Box className="pc-related-state">
                <CircularProgress size={28} />
                <Typography>Finding similar products…</Typography>
              </Box>
            ) : related.length === 0 ? (
              <Box className="pc-related-state">
                <Typography>More products in this category are coming soon.</Typography>
              </Box>
            ) : (
            <Grid container spacing={2.5}>
              {related.map((rp) => {
                const imgPath =
                  rp.productImages && rp.productImages.length > 0
                    ? `${serverApi}/${rp.productImages[0]}`
                    : "/img/product-placeholder.svg";
                const wished = isInWishlist(rp._id);
                const relatedRating = Math.min(
                  Math.max(Number(rp.productRating ?? 0) || 0, 0),
                  5,
                );
                const relatedInStock = Number(rp.productStock ?? 0) > 0;
                const relatedListPrice = Number(rp.productDiscountPrice ?? 0);
                const hasRelatedListPrice = relatedListPrice > rp.productPrice;
                const relatedDiscountPercent = hasRelatedListPrice
                  ? Math.round(((relatedListPrice - rp.productPrice) / relatedListPrice) * 100)
                  : 0;

                return (
                  <Grid size={{ xs: 6, sm: 4, md: 3 }} key={rp._id}>
                    <Box
                      className="pc-rcard"
                      onClick={() =>
                        history.push(`/products/detail/${rp._id}`)
                      }
                      onKeyDown={(event) => {
                        if (event.target !== event.currentTarget) return;
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          history.push(`/products/detail/${rp._id}`);
                        }
                      }}
                      role="link"
                      tabIndex={0}
                      aria-label={`View ${rp.productName}`}
                    >
                      {/* Image */}
                      <Box className="pc-rcard-img-wrap">
                        {hasRelatedListPrice && (
                          <span className="pc-rcard-deal-badge">
                            {relatedDiscountPercent}% off
                          </span>
                        )}
                        <img
                          src={imgPath}
                          alt={rp.productName}
                          className="pc-rcard-img"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = "/img/product-placeholder.svg";
                          }}
                        />
                        <IconButton
                          className={`pc-rcard-wish ${wished ? "active" : ""}`}
                          aria-label={wished ? `Remove ${rp.productName} from wishlist` : `Add ${rp.productName} to wishlist`}
                          onClick={(e) => {
                            e.stopPropagation();
                            const item: WishlistItem = {
                              _id: rp._id,
                              name: rp.productName,
                              price: rp.productPrice,
                              image: rp.productImages?.[0] ?? "",
                              collection: String(rp.productCollection),
                            };
                            toggleWishlist(item);
                          }}
                        >
                          {wished ? (
                            <FavoriteIcon sx={{ fontSize: 16 }} />
                          ) : (
                            <FavoriteBorderIcon sx={{ fontSize: 16 }} />
                          )}
                        </IconButton>
                      </Box>

                      {/* Info */}
                      <Box className="pc-rcard-info">
                        <Typography className="pc-rcard-name" title={rp.productName}>
                          {rp.productName}
                        </Typography>

                        <Box className="pc-rcard-rating-row">
                          <Rating
                            value={relatedRating}
                            readOnly
                            precision={0.5}
                            size="small"
                            icon={
                              <StarIcon
                                sx={{ fontSize: 13, color: "var(--pc-gold)" }}
                              />
                            }
                            emptyIcon={
                              <StarIcon
                                sx={{ fontSize: 13, opacity: 0.2 }}
                              />
                            }
                          />
                          <Typography className="pc-rcard-reviews">
                            {relatedRating.toFixed(1)}
                          </Typography>
                        </Box>

                        <Box className="pc-rcard-bottom">
                          <Box className="pc-rcard-price-stack">
                            <Typography className="pc-rcard-price">
                              ${rp.productPrice.toLocaleString()}
                            </Typography>
                            {hasRelatedListPrice && (
                              <Typography className="pc-rcard-list-price">
                                ${relatedListPrice.toLocaleString()}
                              </Typography>
                            )}
                            <Typography className="pc-rcard-delivery">
                              <strong>FENZO Fast</strong>
                              <span>Get it soon</span>
                            </Typography>
                          </Box>
                          <Button
                            className="pc-rcard-cart-btn"
                            disabled={!relatedInStock}
                            aria-label={relatedInStock ? `Add ${rp.productName} to cart` : `${rp.productName} is out of stock`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!relatedInStock) return;
                              const cartItem: CartItem = {
                                _id: rp._id,
                                name: rp.productName,
                                price: rp.productPrice,
                                quantity: 1,
                                image: rp.productImages?.[0] ?? "",
                                collection: String(rp.productCollection),
                              };
                              addToCart(cartItem);
                            }}
                          >
                            <ShoppingCartIcon sx={{ fontSize: 15 }} />
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
            )}
        </Box>
      </Container>
    </div>
  );
}
