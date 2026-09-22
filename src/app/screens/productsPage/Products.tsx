import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  Rating,
  Tooltip,
  Typography,
} from "@mui/material";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import SearchOffRoundedIcon from "@mui/icons-material/SearchOffRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import ViewListRoundedIcon from "@mui/icons-material/ViewListRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { CartItem } from "../../../lib/types/cart";
import { Product } from "../../../lib/types/product";
import { WishlistItem } from "../../../lib/types/wishlist";
import { serverApi } from "../../../lib/config";
import { useCart } from "../../context/CartContext";
import { useWishlistContext } from "../../context/WishlistContext";
import { useCreateOrder } from "../../hooks/useCreateOrder";
import { useGlobals } from "../../hooks/useGlobals";
import ProductService from "../../services/ProductService";
import { setProducts } from "./slice";

const categories: Array<{ name: string; label: string; icon: string; group?: string }> = [
  { name: "FASHION", label: "Fashion", icon: "◇", group: "Fashion" },
  { name: "WOMEN_CLOTHING", label: "Women's Clothing", icon: "W", group: "Fashion" },
  { name: "MEN_CLOTHING", label: "Men's Clothing", icon: "M", group: "Fashion" },
  { name: "SHOES", label: "Shoes", icon: "S", group: "Fashion" },
  { name: "BAGS_ACCESSORIES", label: "Bags & Accessories", icon: "B", group: "Fashion" },
  { name: "BEAUTY", label: "Beauty", icon: "✿", group: "Beauty & Health" },
  { name: "SKIN_CARE", label: "Skin Care", icon: "S", group: "Beauty & Health" },
  { name: "MAKEUP", label: "Makeup", icon: "M", group: "Beauty & Health" },
  { name: "PARFUM", label: "Perfume", icon: "P", group: "Beauty & Health" },
  { name: "HEALTH", label: "Health", icon: "✚", group: "Beauty & Health" },
  { name: "VITAMINS", label: "Vitamins", icon: "V", group: "Beauty & Health" },
  { name: "ELECTRONICS", label: "Electronics", icon: "⌁", group: "Electronics" },
  { name: "MOBILE_ACCESSORIES", label: "Mobile Accessories", icon: "M", group: "Electronics" },
  { name: "COMPUTERS", label: "Computers & Laptops", icon: "C", group: "Electronics" },
  { name: "HOME_KITCHEN", label: "Home & Kitchen", icon: "H", group: "Home & Daily" },
  { name: "LIVING", label: "Living", icon: "L", group: "Home & Daily" },
  { name: "FOOD", label: "Food & Grocery", icon: "F", group: "Home & Daily" },
  { name: "PET_SUPPLIES", label: "Pet Supplies", icon: "P", group: "Home & Daily" },
  { name: "DAILY_ESSENTIALS", label: "Daily Essentials", icon: "D", group: "Home & Daily" },
  { name: "KIDS", label: "Kids", icon: "K", group: "Family & Hobby" },
  { name: "BABY", label: "Baby", icon: "B", group: "Family & Hobby" },
  { name: "TOYS", label: "Toys", icon: "T", group: "Family & Hobby" },
  { name: "SPORTS_OUTDOORS", label: "Sports & Outdoors", icon: "S", group: "Family & Hobby" },
  { name: "BOOKS_STATIONERY", label: "Books & Stationery", icon: "B", group: "Family & Hobby" },
  { name: "AUTOMOTIVE", label: "Automotive", icon: "A", group: "Family & Hobby" },
];

const normalizeCategory = (value?: string): string | null => {
  if (!value) return null;
  const normalized = value?.toUpperCase();
  return categories.some((category) => category.name === normalized)
    ? normalized!
    : null;
};

const AI_PAGE_LIMIT = 20;

export function Products() {
  const { t } = useGlobals();
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const { collection } = useParams<{ collection: string }>();
  const { onAdd: addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlistContext();
  const { handleBuyNow, loading: buyNowLoading } = useCreateOrder();

  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("q") ?? queryParams.get("search") ?? "";

  const [selectedCategory, setSelectedCategory] = useState(normalizeCategory(collection));
  const [products, setProductsState] = useState<Product[]>([]);
  const [reviewCounts, setReviewCounts] = useState<Record<string, number>>({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const latestRequestId = useRef(0);
  const activeCategory = categories.find((category) => category.name === selectedCategory);

  const handleProductCard = (id: string) => history.push(`/products/detail/${id}`);

  const clearSelectedCategory = () => {
    const querySuffix = searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : "";
    history.push(`/products${querySuffix}`);
  };

  const handleAddToCart = (event: React.MouseEvent, product: Product) => {
    event.stopPropagation();
    if (Number(product.productStock) <= 0) return;

    const cartItem: CartItem = {
      _id: product._id,
      name: product.productName,
      price: product.productPrice,
      quantity: 1,
      image: product.productImages?.[0] ?? "",
      collection: String(product.productCollection),
    };
    addToCart(cartItem);
    setAddedIds((current) => new Set(current).add(product._id));
    window.setTimeout(() => {
      setAddedIds((current) => {
        const next = new Set(current);
        next.delete(product._id);
        return next;
      });
    }, 2000);
  };

  const buildAiQuery = useCallback(
    (baseQuery: string) => {
      const parts: string[] = [];
      const trimmed = baseQuery.trim();
      if (trimmed) parts.push(trimmed);
      if (selectedCategory) parts.push(selectedCategory.replace(/[_-]/g, " ").toLowerCase());
      return parts.join(" ").replace(/\s+/g, " ").trim();
    },
    [selectedCategory],
  );

  const fetchReviewCounts = useCallback(async (items: Product[]) => {
    const ids = [...new Set(items.map((item) => item._id).filter(Boolean))];
    if (!ids.length) return;

    const service = new ProductService();
    const nextCounts = await Promise.all(
      ids.map(async (id) => {
        try {
          const response = await service.getProductReviews(id);
          return [id, response.summary.total ?? 0] as const;
        } catch {
          return [id, 0] as const;
        }
      }),
    );

    setReviewCounts((current) => ({
      ...current,
      ...Object.fromEntries(nextCounts),
    }));
  }, []);

  const fetchAiProducts = useCallback(
    async (targetPage: number, mode: "replace" | "append") => {
      const requestId = ++latestRequestId.current;
      setLoading(true);
      setError(null);
      const service = new ProductService();

      try {
        const data = await service.aiSearchProducts({
          query: buildAiQuery(searchQuery),
          page: targetPage,
          limit: AI_PAGE_LIMIT,
        });
        if (requestId !== latestRequestId.current) return;

        if (mode === "append") {
          setProductsState((current) => {
            const next = [...current, ...data];
            dispatch(setProducts(next));
            return next;
          });
        } else {
          setProductsState(data);
          dispatch(setProducts(data));
        }
        setHasMore(data.length === AI_PAGE_LIMIT);
        setPage(targetPage);
        await fetchReviewCounts(data);
      } catch {
        if (requestId !== latestRequestId.current) return;
        setError("We could not load the collection. Please try again.");
        setHasMore(false);
      } finally {
        if (requestId === latestRequestId.current) setLoading(false);
      }
    },
    [buildAiQuery, dispatch, fetchReviewCounts, searchQuery],
  );

  useEffect(() => {
    const normalized = normalizeCategory(collection);
    setSelectedCategory(normalized);

    if (collection && !normalized) {
      history.replace(`/products${location.search}`);
    }
  }, [collection, history, location.search]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchAiProducts(1, "replace");
  }, [fetchAiProducts]);

  const handleLoadMore = () => {
    if (!loading && hasMore) fetchAiProducts(page + 1, "append");
  };

  return (
    <main className="pp-page">
      <Container maxWidth="xl" className="pp-container">
        <Grid container spacing={3.5} className="pp-layout">
          <Grid size={{ xs: 12 }} className="pp-results-column">
            <Box className="pp-results-toolbar">
              <Box className="pp-active-filters">
                {activeCategory ? (
                  <Chip
                    label={activeCategory.label}
                    onDelete={clearSelectedCategory}
                    className="pp-filter-chip"
                    size="small"
                    aria-label={`Selected category: ${activeCategory.label}`}
                  />
                ) : (
                  <Chip
                    label="All products"
                    className="pp-filter-chip pp-filter-chip--all"
                    size="small"
                    aria-label="Showing all products"
                  />
                )}
                {searchQuery && (
                  <Chip
                    label={`“${searchQuery}”`}
                    onDelete={() => history.push(selectedCategory ? `/products/${selectedCategory}` : "/products")}
                    className="pp-filter-chip"
                    size="small"
                  />
                )}
              </Box>

              <Box className="pp-view-toggle" aria-label="Product layout">
                <Tooltip title="Grid view">
                  <IconButton
                    className={`pp-view-btn ${viewMode === "grid" ? "active" : ""}`}
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid view"
                    aria-pressed={viewMode === "grid"}
                  >
                    <GridViewRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="List view">
                  <IconButton
                    className={`pp-view-btn ${viewMode === "list" ? "active" : ""}`}
                    onClick={() => setViewMode("list")}
                    aria-label="List view"
                    aria-pressed={viewMode === "list"}
                  >
                    <ViewListRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Box className={`pp-grid ${viewMode === "list" ? "pp-grid--list" : ""}`}>
              {products.length > 0 ? (
                products.map((product) => {
                  const imagePath = product.productImages?.length
                    ? `${serverApi}/${product.productImages[0]}`
                    : "/img/product-placeholder.svg";
                  const ratingValue = Number(product.productRating ?? 0);
                  const safeRating = Number.isFinite(ratingValue)
                    ? Math.min(Math.max(ratingValue, 0), 5)
                    : 0;
                  const wished = isInWishlist(product._id);
                  const justAdded = addedIds.has(product._id);
                  const inStock = Number(product.productStock) > 0;
                  const collectionLabel = String(product.productCollection ?? "").replace(/-/g, " ");
                  const listPrice = Number(product.productDiscountPrice ?? 0);
                  const hasListPrice = listPrice > product.productPrice;
                  const discountPercent = hasListPrice
                    ? Math.round(((listPrice - product.productPrice) / listPrice) * 100)
                    : 0;

                  return (
                    <article key={product._id} className="pp-card">
                      <Box className="pp-card-img-wrap">
                        {hasListPrice && (
                          <span className="pp-card-deal-badge">
                            {discountPercent}% off
                          </span>
                        )}
                        <button
                          type="button"
                          className="pp-card-media-link"
                          onClick={() => handleProductCard(product._id)}
                          aria-label={`View ${product.productName}`}
                        >
                          <img
                            src={imagePath}
                            alt={product.productName}
                            className="pp-card-img"
                            loading="lazy"
                            onError={(event) => {
                              (event.currentTarget as HTMLImageElement).src = "/img/product-placeholder.svg";
                            }}
                          />
                        </button>

                        <IconButton
                          className={`pp-card-wish ${wished ? "active" : ""}`}
                          aria-label={wished ? `Remove ${product.productName} from wishlist` : `Add ${product.productName} to wishlist`}
                          onClick={(event) => {
                            event.stopPropagation();
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
                          {wished ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
                        </IconButton>

                      </Box>

                      <Box className="pp-card-info">
                        <Box className="pp-card-kicker-row">
                          <Typography className="pp-card-collection">{collectionLabel}</Typography>
                          <Typography className={`pp-card-stock ${inStock ? "" : "is-out"}`}>
                            {inStock ? "Available" : "Sold out"}
                          </Typography>
                        </Box>

                        <button
                          type="button"
                          className="pp-card-name"
                          title={product.productName}
                          onClick={() => handleProductCard(product._id)}
                        >
                          {product.productName}
                        </button>

                        <Box className="pp-card-rating-row">
                          <Rating
                            value={safeRating}
                            precision={0.5}
                            readOnly
                            size="small"
                            aria-label={`${safeRating.toFixed(1)} out of 5 stars`}
                            icon={<StarRoundedIcon />}
                            emptyIcon={<StarRoundedIcon />}
                          />
                          <Typography className="pp-card-review-count">
                            {safeRating.toFixed(1)}
                            {reviewCounts[product._id] ? ` · ${reviewCounts[product._id]} ${reviewCounts[product._id] === 1 ? "review" : "reviews"}` : ""}
                          </Typography>
                          <Box className="pp-card-views" title={`${product.productViews} views`}>
                            <VisibilityOutlinedIcon />
                            <span>{product.productViews}</span>
                          </Box>
                        </Box>

                        <Box className="pp-card-bottom">
                          <Box className="pp-card-price-stack">
                            <Typography className="pp-card-price">
                              ${product.productPrice.toLocaleString()}
                            </Typography>
                            {hasListPrice && (
                              <Typography className="pp-card-list-price">
                                ${listPrice.toLocaleString()}
                              </Typography>
                            )}
                            <Typography className="pp-card-delivery">
                              <strong>FENZO Fast</strong>
                              <span>Get it soon</span>
                            </Typography>
                          </Box>
                          <Box className="pp-card-actions">
                            <Tooltip title={inStock ? "Add to cart" : "Out of stock"}>
                              <span>
                                <IconButton
                                  className={`pp-card-cart-btn ${justAdded ? "added" : ""}`}
                                  disabled={!inStock}
                                  aria-label={`Add ${product.productName} to cart`}
                                  onClick={(event) => handleAddToCart(event, product)}
                                >
                                  <ShoppingCartRoundedIcon />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Button
                              className="pp-card-buy-btn"
                              disabled={buyNowLoading || !inStock}
                              onClick={() => handleBuyNow(product, 1)}
                            >
                              {t("buyNow")}
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                    </article>
                  );
                })
              ) : loading ? (
                <Box className="pp-loading-grid" role="status" aria-label="Loading products">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <Box key={index} className="pp-skeleton" aria-hidden="true" />
                  ))}
                </Box>
              ) : error ? (
                <Box className="pp-empty" role="alert">
                  <span className="pp-empty-icon"><SearchOffRoundedIcon /></span>
                  <Typography className="pp-empty-title">Something interrupted the search</Typography>
                  <Typography className="pp-empty-sub">{error}</Typography>
                  <Button className="pp-empty-btn" onClick={() => fetchAiProducts(1, "replace")}>Try again</Button>
                </Box>
              ) : (
                <Box className="pp-empty">
                  <span className="pp-empty-icon"><SearchOffRoundedIcon /></span>
                  <Typography className="pp-empty-title">{t("noProductsFound")}</Typography>
                  <Typography className="pp-empty-sub">Try a broader search term.</Typography>
                </Box>
              )}
            </Box>

            {hasMore && products.length > 0 && (
              <Box className="pp-load-more-wrap">
                <Button
                  className="pp-load-more-btn"
                  disabled={loading}
                  onClick={handleLoadMore}
                  startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
                >
                  {loading ? "Loading…" : "Load more products"}
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </main>
  );
}
