import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useHistory } from "react-router-dom";
import {
  Container,
  Box,
  Stack,
  Typography,
  Avatar,
  Button,
  Tab,
  Tabs,
  Card,
  Chip,
  Divider,
  TextField,
  CircularProgress,
  IconButton,
  Pagination,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import PersonIcon from "@mui/icons-material/Person";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FavoriteIcon from "@mui/icons-material/Favorite";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import EditIcon from "@mui/icons-material/Edit";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import { useGlobals } from "../../hooks/useGlobals";
import { useWishlistContext } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { serverApi } from "../../../lib/config";
import UserService from "../../services/UserService";
import OrderService from "../../services/OrderService";
import { UserUpdateInput } from "../../../lib/types/user";
import { Order } from "../../../lib/types/order";
import { Messages } from "../../../lib/config";
import { sweetAlert } from "../../../lib/sweetalert";

const userService = new UserService();
const orderService = new OrderService();

export function MyPage() {
  const history = useHistory();
  const location = useLocation();
  const { authUser, setAuthUser, logout } = useGlobals();
  const { wishlistItems, removeFromWishlist, refreshWishlist } = useWishlistContext();
  const { onAdd: addToCart } = useCart();

  const tabFromUrl = new URLSearchParams(location.search).get("tab");
  const [tabValue, setTabValue] = useState(
    tabFromUrl === "wishlist" ? "wishlist" : 
    tabFromUrl === "info" ? "info" : 
    tabFromUrl === "address" ? "address" : "orders"
  );

  // --- Pagination States (Wishlist) ---
  const [wishlistPage, setWishlistPage] = useState(1);
  const wishlistItemsPerPage = 8; // Bitta sahifada 8 ta (2 qator, 4 ustun)
  
  const wishlistTotalPages = Math.ceil(wishlistItems.length / wishlistItemsPerPage);
  const currentWishlistItems = wishlistItems.slice(
    (wishlistPage - 1) * wishlistItemsPerPage,
    wishlistPage * wishlistItemsPerPage
  );

  useEffect(() => {
    if (wishlistPage > wishlistTotalPages && wishlistTotalPages > 0) {
      setWishlistPage(wishlistTotalPages);
    }
  }, [wishlistItems.length, wishlistTotalPages, wishlistPage]);

  // Wishlist tab ochilganda serverdan narx/rasm yangilab oladi (seller o'zgartirsa yangi ma'lumot chiqadi)
  useEffect(() => {
    if (tabValue === "wishlist") refreshWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabValue]);

  // Edit Mode States
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Form states
  const [infoNick, setInfoNick] = useState("");
  const [infoPhone, setInfoPhone] = useState("");
  const [infoAddress, setInfoAddress] = useState("");
  const [infoDesc, setInfoDesc] = useState("");
  const [infoPassword, setInfoPassword] = useState("");
  const [infoPasswordConfirm, setInfoPasswordConfirm] = useState("");
  
  // Image Upload states
  const [previewImage, setPreviewImage] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [infoSaving, setInfoSaving] = useState(false);
  const [infoError, setInfoError] = useState("");

  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("ALL");
  const [ordersPage, setOrdersPage] = useState(1);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const ORDER_STATUSES = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"] as const;
  const ORDERS_PER_PAGE = 6;

  const sortedOrders = useMemo(() => {
    let list = [...myOrders];
    if (orderStatusFilter !== "ALL") {
      list = list.filter((o) => (o.status || o.orderStatus || "").toUpperCase() === orderStatusFilter);
    }
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }, [myOrders, orderStatusFilter]);

  const ordersTotalPages = Math.max(1, Math.ceil(sortedOrders.length / ORDERS_PER_PAGE));
  const paginatedOrders = useMemo(
    () => sortedOrders.slice((ordersPage - 1) * ORDERS_PER_PAGE, ordersPage * ORDERS_PER_PAGE),
    [sortedOrders, ordersPage]
  );

  useEffect(() => {
    if (ordersPage > ordersTotalPages && ordersTotalPages > 0) setOrdersPage(1);
  }, [ordersTotalPages, ordersPage]);

  useEffect(() => {
    setOrdersPage(1);
  }, [orderStatusFilter]);

  useEffect(() => {
    if (tabFromUrl === "wishlist") setTabValue("wishlist");
    else if (tabFromUrl === "info") setTabValue("info");
    else if (tabFromUrl === "address") setTabValue("address");
    else setTabValue("orders");
  }, [tabFromUrl]);

  const fetchMyOrders = () => {
    setOrdersLoading(true);
    setOrdersError("");
    orderService
      .getMyOrders({ page: 1, limit: 50 })
      .then(setMyOrders)
      .catch((err) => {
        setMyOrders([]);
        setOrdersError(
          err?.response?.data?.message || "We couldn't load your orders. Please try again."
        );
      })
      .finally(() => setOrdersLoading(false));
  };

  useEffect(() => {
    if (tabValue === "orders") fetchMyOrders();
  }, [tabValue]);

  const handleCancelOrder = (orderId: string) => {
    const id = typeof orderId === "string" ? orderId : String((orderId as any)?._id ?? orderId);
    setCancellingOrderId(id);
    orderService
      .updateOrder(id, "CANCELLED")
      .then(() => {
        setOrdersError("");
        fetchMyOrders();
      })
      .catch((err) => {
        console.error("Cancel order failed", err?.response?.data ?? err);
        setOrdersError(
          err?.response?.data?.message || "We couldn't cancel this order. Please try again."
        );
      })
      .finally(() => setCancellingOrderId(null));
  };

  const populateUserData = () => {
    if (authUser) {
      setInfoNick(authUser.userNick || "");
      setInfoPhone(authUser.userPhone || "");
      setInfoAddress(authUser.userAddress || "");
      setInfoDesc(authUser.userDesc || "");
      
      setInfoPassword("");
      setInfoPasswordConfirm("");
      setSelectedFile(null);

      if (authUser.userImage) {
        setPreviewImage(`${serverApi}/${authUser.userImage}`);
      } else {
        setPreviewImage("");
      }
    }
  };

  useEffect(() => {
    populateUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  useEffect(() => {
    if (authUser === null) {
      history.replace("/login");
    }
  }, [authUser, history]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
    setIsEditingInfo(false);
    setIsEditingAddress(false);
    setInfoError("");
    populateUserData(); 
  };

  const handleLogout = () => {
    logout();
    history.push("/");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    }
  };

  const cancelEdit = () => {
    setIsEditingInfo(false);
    setIsEditingAddress(false);
    setInfoError("");
    populateUserData(); 
  };

  const handleSaveInfo = async () => {
    if (!authUser) return;
    setInfoError("");
    
    if (!infoNick.trim() || !infoPhone.trim()) {
      setInfoError(Messages.errorValidation);
      return;
    }
    if (infoPassword.trim() && infoPassword !== infoPasswordConfirm) {
      setInfoError(Messages.errorPasswordMatch);
      return;
    }
    
    setInfoSaving(true);
    setInfoError("");
    
    try {
      let updatedUser;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("userNick", infoNick.trim());
        formData.append("userPhone", infoPhone.trim());
        formData.append("userAddress", infoAddress.trim());
        formData.append("userDesc", infoDesc.trim());
        if (infoPassword.trim()) formData.append("userPassword", infoPassword);
        formData.append("userImage", selectedFile);

        updatedUser = await userService.updateUserWithImage(authUser._id, formData);
      } else {
        const input: UserUpdateInput = {
          userNick: infoNick.trim(),
          userPhone: infoPhone.trim(),
          userAddress: infoAddress.trim(),
          userDesc: infoDesc.trim(),
        };
        if (infoPassword.trim()) input.userPassword = infoPassword;

        updatedUser = await userService.updateUser(authUser._id, input);
      }

      const nextUser = { ...authUser, ...updatedUser };
      setAuthUser(nextUser);
      localStorage.setItem("userData", JSON.stringify(nextUser));
      
      setInfoPassword("");
      setInfoPasswordConfirm("");
      setSelectedFile(null);
      setIsEditingInfo(false);
      setIsEditingAddress(false);
      
      await sweetAlert.success("Profile updated", "Your changes have been saved successfully.");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "";
      const isUsedNickPhone = err?.response?.status === 400 && (msg.toLowerCase().includes("nick") || msg.toLowerCase().includes("phone") || msg.toLowerCase().includes("used"));
      const errorMessage = isUsedNickPhone ? Messages.usedNickPhone : msg || Messages.error1;
      setInfoError(errorMessage);
      await sweetAlert.error("Update failed", errorMessage);
    } finally {
      setInfoSaving(false);
    }
  };

  if (authUser === null) {
    return (
      <Box className="account-auth-loading">
        <CircularProgress sx={{ color: "#5b5bd6" }} />
      </Box>
    );
  }

  const user = authUser;
  const avatarSrc = previewImage || (user.userImage ? `${serverApi}/${user.userImage}` : undefined);
  const displayName = user.userNick || "User";

  const fenzoCardStyle = {
    p: { xs: 2.25, md: 3 },
    borderRadius: 3,
    boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.03)",
    border: "1px solid #eaeaea",
    bgcolor: "#ffffff"
  };

  return (
    <Box className="my-page" sx={{ bgcolor: "#f5f6fa", minHeight: "100vh", pt: 3, pb: 8 }}>
      <Container maxWidth="xl">
        <Box className="account-page-header">
          <Box>
            <Typography className="account-eyebrow">Account</Typography>
            <Typography variant="h4">My Account</Typography>
          </Box>
          <Box className="account-header-stats" aria-label="Account summary">
            <span><strong>{myOrders.length}</strong> Orders</span>
            <span><strong>{wishlistItems.length}</strong> Saved</span>
          </Box>
        </Box>

        <Grid className="account-layout" container spacing={2.5}>
          {/* --- LEFT SIDEBAR --- */}
          <Grid className="account-sidebar-column" size={{ xs: 12, md: 4, lg: 3 }}>
            <Card className="account-sidebar" sx={{ ...fenzoCardStyle, p: 0, overflow: "hidden" }}>
              <Box className="account-profile-summary" sx={{ p: 4, textAlign: "center", bgcolor: "#ffffff" }}>
                <Avatar 
                  className="account-main-avatar"
                  src={avatarSrc} 
                  alt={displayName} 
                  sx={{ width: 82, height: 82, fontSize: 32, mx: "auto", mb: 1.5, border: "4px solid #f0f4f8", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}
                >
                  {displayName.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#333" }}>{displayName}</Typography>
                <Typography variant="body2" sx={{ color: "#888", mt: 0.5 }}>{user.userPhone}</Typography>
                <Box className="account-profile-metrics">
                  <Box>
                    <strong>{myOrders.length}</strong>
                    <span>Orders</span>
                  </Box>
                  <Box>
                    <strong>{wishlistItems.length}</strong>
                    <span>Saved</span>
                  </Box>
                </Box>
              </Box>
              
              <Divider />
              
              <Box sx={{ p: 2 }}>
                <Tabs
                  className="account-tabs"
                  orientation="vertical"
                  value={tabValue}
                  onChange={handleTabChange}
                  TabIndicatorProps={{ style: { display: "none" } }}
                  sx={{
                    "& .MuiTab-root": {
                      justifyContent: "flex-start",
                      minHeight: 48,
                      borderRadius: 2,
                      mb: 0.5,
                      textTransform: "none",
                      fontWeight: 600,
                      color: "#555",
                      fontSize: "0.95rem",
                      "&:hover": { bgcolor: "#f0f0ff", color: "#5b5bd6" }
                    },
                    "& .Mui-selected": {
                      color: "#5b5bd6 !important",
                      bgcolor: "rgba(91,91,214,0.10)",
                    }
                  }}
                >
                  <Tab label="My Orders" value="orders" icon={<LocalMallIcon />} iconPosition="start" />
                  <Tab label="Wishlist" value="wishlist" icon={<FavoriteIcon />} iconPosition="start" />
                  <Tab label="Personal Info" value="info" icon={<PersonIcon />} iconPosition="start" />
                  <Tab label="Address" value="address" icon={<LocationOnIcon />} iconPosition="start" />
                </Tabs>
              </Box>

              <Divider />
              
              <Box sx={{ p: 2 }}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  color="error" 
                  startIcon={<LogoutIcon />} 
                  onClick={handleLogout}
                  sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, py: 1 }}
                >
                  Log Out
                </Button>
              </Box>
            </Card>
          </Grid>

          {/* --- RIGHT CONTENT --- */}
          <Grid className="account-content" size={{ xs: 12, md: 8, lg: 9 }}>
            
            {/* 1. ORDERS TAB */}
            {tabValue === "orders" && (
              <Stack className="account-panel" spacing={2}>
                <Box className="account-panel-heading">
                  <Box>
                    <Typography className="account-panel-kicker">Purchases</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#333" }}>My Orders</Typography>
                  </Box>
                </Box>
                {ordersError && (
                  <Alert
                    className="account-alert"
                    severity="error"
                    action={
                      <Button color="inherit" size="small" startIcon={<RefreshRoundedIcon />} onClick={fetchMyOrders}>
                        Retry
                      </Button>
                    }
                  >
                    {ordersError}
                  </Alert>
                )}
                {ordersLoading ? (
                  <Box className="account-loading-state" sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress sx={{ color: "#5b5bd6" }} />
                  </Box>
                ) : ordersError && myOrders.length === 0 ? null : myOrders.length === 0 ? (
                  <Card sx={{ ...fenzoCardStyle, textAlign: "center", py: 8 }}>
                    <Box sx={{ width: 80, height: 80, bgcolor: "#f4f7fb", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 3 }}>
                      <LocalMallIcon sx={{ fontSize: 40, color: "#a0b2c6" }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "#333", mb: 1 }}>No orders yet</Typography>
                    <Typography variant="body2" sx={{ color: "#777", mb: 4, maxWidth: 300, mx: "auto" }}>
                      When you click Buy Now on a product, your orders will appear here.
                    </Typography>
                    <Button 
                      variant="contained" 
                      onClick={() => history.push("/products")}
                      sx={{ bgcolor: "#5b5bd6", color: "white", borderRadius: 2, textTransform: "none", fontWeight: 600, px: 4, py: 1.2, boxShadow: "none" }}
                    >
                      Start Shopping
                    </Button>
                  </Card>
                ) : (
                  <Stack spacing={1.5}>
                    <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 0.5 }}>
                      <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel id="order-status-filter-label">Status</InputLabel>
                        <Select
                          labelId="order-status-filter-label"
                          value={orderStatusFilter}
                          label="Status"
                          onChange={(e) => setOrderStatusFilter(e.target.value)}
                        >
                          <MenuItem value="ALL">All</MenuItem>
                          {ORDER_STATUSES.map((s) => (
                            <MenuItem key={s} value={s}>{s}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                    {/* Table header — fixed column widths */}
                    <Box
                      className="account-order-table-header"
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "minmax(220px, 1.45fr) minmax(96px, 0.7fr) minmax(122px, 0.85fr) minmax(106px, 0.75fr) minmax(90px, 0.65fr) minmax(92px, auto)",
                        gap: 2,
                        alignItems: "center",
                        px: 2,
                        py: 1,
                        borderBottom: "2px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: 0.5 }}>Product</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: 0.5 }}>Order #</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: 0.5 }}>Date</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: 0.5 }}>Status</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: 0.5 }}>Total</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: 0.5, justifySelf: "end" }}>Action</Typography>
                    </Box>
                    {paginatedOrders.map((order) => {
                      const orderDate = typeof order.createdAt === "string" ? new Date(order.createdAt) : (order.createdAt as Date);
                      const orderIdShort = order._id.slice(-8).toUpperCase();
                      const items = order.orderItems ?? [];
                      const maxThumbs = 4;
                      const visibleItems = items.slice(0, maxThumbs);
                      const extraCount = items.length > maxThumbs ? items.length - maxThumbs : 0;
                      const isExpanded = expandedOrderId === order._id;
                      return (
                        <Card
                          className={`account-order-card${isExpanded ? " is-expanded" : ""}`}
                          key={order._id}
                          sx={{
                            ...fenzoCardStyle,
                            p: 0,
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            className="account-order-row"
                            onClick={() => setExpandedOrderId((id) => (id === order._id ? null : order._id))}
                            sx={{
                              display: "grid",
                              gridTemplateColumns: "minmax(220px, 1.45fr) minmax(96px, 0.7fr) minmax(122px, 0.85fr) minmax(106px, 0.75fr) minmax(90px, 0.65fr) minmax(92px, auto)",
                              gap: 2,
                              alignItems: "center",
                              px: 2,
                              py: 1.5,
                              cursor: "pointer",
                              "&:hover": { bgcolor: "action.hover" },
                            }}
                          >
                            <Box className="account-order-products" data-label="Product" sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                              {items.length > 0 ? (
                                <>
                                  {visibleItems.map((item) => (
                                    <Box key={item.productId} sx={{ position: "relative", flexShrink: 0 }}>
                                      <img
                                        src={item.productImage ? `${serverApi}/${item.productImage}` : "/img/product-placeholder.svg"}
                                        alt={item.productName || ""}
                                        style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8 }}
                                        onError={(e) => { (e.target as HTMLImageElement).src = "/img/product-placeholder.svg"; }}
                                      />
                                      <Typography
                                        component="span"
                                        sx={{
                                          position: "absolute",
                                          bottom: 0,
                                          right: 0,
                                          bgcolor: "rgba(0,0,0,0.75)",
                                          color: "#fff",
                                          fontSize: "0.65rem",
                                          fontWeight: 700,
                                          px: 0.4,
                                          borderRadius: 0.5,
                                          lineHeight: 1.2,
                                        }}
                                      >
                                        ×{item.itemQuantity}
                                      </Typography>
                                    </Box>
                                  ))}
                                  {extraCount > 0 && (
                                    <Box
                                      sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 8,
                                        bgcolor: "grey.200",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                      }}
                                    >
                                      <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                                        +{extraCount}
                                      </Typography>
                                    </Box>
                                  )}
                                </>
                              ) : (
                                <Box sx={{ width: 48, height: 48, bgcolor: "#f0f0f0", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <LocalMallIcon sx={{ fontSize: 24, color: "#999" }} />
                                </Box>
                              )}
                            </Box>
                            <Typography className="account-order-id" data-label="Order #" variant="body2" sx={{ fontWeight: 600, color: "#333" }}>
                              #{orderIdShort}
                            </Typography>
                            <Typography className="account-order-date" data-label="Date" variant="body2" sx={{ color: "#777" }}>
                              {orderDate.toLocaleDateString(undefined, { dateStyle: "medium" })}
                            </Typography>
                            <Chip data-label="Status" className={`account-order-status status-${String(order.status || order.orderStatus || "pending").toLowerCase()}`} label={order.status || "Pending"} size="small" color="primary" variant="outlined" sx={{ fontWeight: 600, height: 22, width: "fit-content" }} />
                            <Typography className="account-order-total" data-label="Total" variant="subtitle2" sx={{ fontWeight: 700, color: "#5b5bd6" }}>
                              ${Number(order.total).toLocaleString()}
                            </Typography>
                            <Box className="account-order-actions" data-label="Action" onClick={(e) => e.stopPropagation()} sx={{ justifySelf: "end", alignSelf: "start" }}>
                              {(order.status || order.orderStatus || "").toUpperCase() === "PENDING" && (
                                <Button
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                  disabled={cancellingOrderId === order._id}
                                  onClick={() => handleCancelOrder(String(order._id))}
                                  sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.75rem" }}
                                >
                                  {cancellingOrderId === order._id ? "..." : "Cancel"}
                                </Button>
                              )}
                              <IconButton
                                className={`account-expand-button${isExpanded ? " is-expanded" : ""}`}
                                size="small"
                                aria-label={isExpanded ? "Collapse order details" : "Expand order details"}
                                aria-expanded={isExpanded}
                                onClick={() => setExpandedOrderId((id) => (id === order._id ? null : order._id))}
                              >
                                <KeyboardArrowDownRoundedIcon />
                              </IconButton>
                            </Box>
                          </Box>
                          {isExpanded && items.length > 0 && (
                            <Box
                              className="account-order-expanded"
                              sx={{
                                borderTop: "1px solid",
                                borderColor: "divider",
                                bgcolor: "grey.50",
                                p: 2,
                              }}
                            >
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#666", mb: 1.5 }}>
                                All products in this order ({items.length})
                              </Typography>
                              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                {items.map((item) => {
                                  const name = item.productName || "Product";
                                  const shortName = name.length > 15 ? name.slice(0, 15) + "…" : name;
                                  return (
                                  <Box
                                    key={item.productId}
                                    sx={{
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      width: 100,
                                    }}
                                  >
                                    <img
                                      src={item.productImage ? `${serverApi}/${item.productImage}` : "/img/product-placeholder.svg"}
                                      alt={item.productName || ""}
                                      style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 10 }}
                                      onError={(e) => { (e.target as HTMLImageElement).src = "/img/product-placeholder.svg"; }}
                                    />
                                    <Typography variant="caption" sx={{ mt: 0.5, textAlign: "center", fontWeight: 600 }} noWrap title={name}>
                                      {shortName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      ×{item.itemQuantity} · ${Number(item.itemPrice).toFixed(2)}
                                    </Typography>
                                  </Box>
                                ); })}
                              </Box>
                            </Box>
                          )}
                        </Card>
                      );
                    })}
                    {ordersTotalPages > 1 && (
                      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                        <Pagination
                          count={ordersTotalPages}
                          page={ordersPage}
                          onChange={(_, page) => setOrdersPage(page)}
                          color="primary"
                          shape="rounded"
                        />
                      </Box>
                    )}
                  </Stack>
                )}
              </Stack>
            )}

            {/* 2. WISHLIST TAB */}
            {tabValue === "wishlist" && (
              <Stack className="account-panel" spacing={2}>
                <Box className="account-panel-heading">
                  <Box>
                    <Typography className="account-panel-kicker">Saved for later</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#333" }}>My Wishlist</Typography>
                  </Box>
                </Box>
                {wishlistItems.length === 0 ? (
                  <Card sx={{ ...fenzoCardStyle, textAlign: "center", py: 8 }}>
                    <Box sx={{ width: 80, height: 80, bgcolor: "#fdf0f0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 3 }}>
                      <FavoriteIcon sx={{ fontSize: 40, color: "#f28b82" }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "#333", mb: 1 }}>Your wishlist is empty</Typography>
                    <Button 
                      variant="contained" 
                      onClick={() => history.push("/products")}
                      sx={{ bgcolor: "#5b5bd6", color: "white", borderRadius: 2, mt: 2, textTransform: "none", fontWeight: 600 }}
                    >
                      Discover Products
                    </Button>
                  </Card>
                ) : (
                  <Box>
                    {/* Grid qismi: To'liq Grid2 size usuliga o'tkazildi (12 / 4 = 3) */}
                    <Grid container spacing={3}>
                      {currentWishlistItems.map((item) => (
                        <Grid key={item._id} size={{ xs: 6, sm: 6, lg: 3 }}>
                          <Card className="account-wishlist-card" sx={{ borderRadius: 3, boxShadow: "0 4px 15px rgba(0,0,0,0.04)", border: "1px solid #eaeaea", position: "relative", height: "100%" }}>
                            <Box className="account-wishlist-image" sx={{ position: "relative", overflow: "hidden", borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
                              <img src={item.image ? `${serverApi}/${item.image}` : "/img/product-placeholder.svg"} alt={item.name} onError={(event) => { (event.target as HTMLImageElement).src = "/img/product-placeholder.svg"; }} />
                              <IconButton aria-label={`Remove ${item.name} from wishlist`} sx={{ position: "absolute", top: 10, right: 10, bgcolor: "rgba(255,255,255,0.9)" }} onClick={() => removeFromWishlist(item._id)} size="small">
                                <DeleteOutlineIcon color="error" fontSize="small" />
                              </IconButton>
                            </Box>
                            <Box sx={{ p: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#333" }} noWrap>{item.name}</Typography>
                              <Typography variant="body1" sx={{ color: "#5b5bd6", fontWeight: 700, mt: 0.5 }}>${item.price.toLocaleString()}</Typography>
                              <Button fullWidth variant="outlined" endIcon={<ArrowForwardRoundedIcon />} size="small" sx={{ mt: 1.5, borderRadius: 2, textTransform: "none", fontWeight: 600 }} onClick={() => addToCart({...item, quantity: 1})}>
                                Add to cart
                              </Button>
                            </Box>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>

                    {wishlistTotalPages > 1 && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination 
                          count={wishlistTotalPages} 
                          page={wishlistPage} 
                          onChange={(_, page) => setWishlistPage(page)} 
                          color="primary" 
                          shape="rounded"
                        />
                      </Box>
                    )}
                  </Box>
                )}
              </Stack>
            )}

            {/* 3. PERSONAL INFO TAB */}
            {tabValue === "info" && (
              <Stack className="account-panel" spacing={2}>
                <Box className="account-panel-heading" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography className="account-panel-kicker">Profile details</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#333" }}>Personal Information</Typography>
                  </Box>
                  {!isEditingInfo && (
                    <Button 
                      variant="contained" 
                      startIcon={<EditIcon />} 
                      onClick={() => setIsEditingInfo(true)}
                      sx={{ bgcolor: "#5b5bd6", color: "white", borderRadius: 2, textTransform: "none", boxShadow: "none" }}
                    >
                      Edit Profile
                    </Button>
                  )}
                </Box>

                <Card sx={fenzoCardStyle}>
                  {/* --- VIEW MODE --- */}
                  {!isEditingInfo ? (
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 4 }}>
                        <Avatar src={avatarSrc} sx={{ width: 80, height: 80, fontSize: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                          {displayName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: "#333" }}>{user.userNick}</Typography>
                          <Typography variant="body1" sx={{ color: "#666", mt: 0.5 }}>{user.userPhone}</Typography>
                        </Box>
                      </Box>
                      
                      <Divider sx={{ mb: 3 }} />
                      
                      <Grid container spacing={4}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Typography variant="subtitle2" sx={{ color: "#888", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: 1, mb: 1 }}>
                            Short Biography
                          </Typography>
                          <Typography variant="body1" sx={{ color: "#333" }}>
                            {user.userDesc || "No biography provided yet."}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Typography variant="subtitle2" sx={{ color: "#888", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: 1, mb: 1 }}>
                            Password
                          </Typography>
                          <Typography variant="body1" sx={{ color: "#333" }}>
                            ••••••••••
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  ) : (
                    /* --- EDIT MODE --- */
                    <Stack spacing={4}>
                      <Box className="account-photo-editor" sx={{ display: "flex", alignItems: "center", gap: 3, p: 2, bgcolor: "#f9fbfd", borderRadius: 2, border: "1px solid #f0f0f0" }}>
                        <Avatar src={avatarSrc} sx={{ width: 70, height: 70, fontSize: 28, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                          {displayName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Profile Photo</Typography>
                          <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />
                          <Button variant="outlined" size="small" startIcon={<CloudUploadIcon />} onClick={() => fileInputRef.current?.click()} sx={{ borderRadius: 2, textTransform: "none" }}>
                            Upload new image
                          </Button>
                          {selectedFile && <Typography variant="caption" display="block" sx={{ mt: 1, color: "green" }}>Selected: {selectedFile.name}</Typography>}
                        </Box>
                      </Box>

                      <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField fullWidth label="Username / Nickname" value={infoNick} onChange={(e) => setInfoNick(e.target.value)} required sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField fullWidth label="Phone Number" value={infoPhone} onChange={(e) => setInfoPhone(e.target.value)} required placeholder="+998901234567" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <TextField fullWidth label="Short Bio (Optional)" value={infoDesc} onChange={(e) => setInfoDesc(e.target.value)} multiline rows={2} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                        </Grid>
                      </Grid>

                      <Divider />
                      
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#333", mb: 2 }}>Change Password</Typography>
                        <Grid container spacing={3}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth type="password" label="New Password" autoComplete="new-password" value={infoPassword} onChange={(e) => setInfoPassword(e.target.value)} placeholder="Leave blank to keep current" sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth type="password" label="Confirm New Password" autoComplete="new-password" value={infoPasswordConfirm} onChange={(e) => setInfoPasswordConfirm(e.target.value)} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }} />
                          </Grid>
                        </Grid>
                      </Box>

                      {infoError && <Typography color="error" sx={{ fontWeight: 500, fontSize: "0.9rem" }}>{infoError}</Typography>}
                      
                      <Box className="account-form-actions" sx={{ display: "flex", justifyContent: "flex-end", gap: 2, pt: 2 }}>
                        <Button variant="outlined" color="inherit" onClick={cancelEdit} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, px: 3 }}>
                          Cancel
                        </Button>
                        <Button variant="contained" onClick={handleSaveInfo} disabled={infoSaving} sx={{ bgcolor: "#5b5bd6", color: "white",borderRadius: 2, textTransform: "none", fontWeight: 600, px: 4, boxShadow: "none" }}>
                          {infoSaving ? "Saving..." : "Save Changes"}
                        </Button>
                      </Box>
                    </Stack>
                  )}
                </Card>
              </Stack>
            )}

            {/* 4. ADDRESS TAB */}
            {tabValue === "address" && (
              <Stack className="account-panel" spacing={2}>
                <Box className="account-panel-heading" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography className="account-panel-kicker">Delivery</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#333" }}>My Address</Typography>
                  </Box>
                  {!isEditingAddress && (
                    <Button 
                      variant="contained" 
                      startIcon={<EditIcon />} 
                      onClick={() => setIsEditingAddress(true)}
                      sx={{ bgcolor: "#5b5bd6", color: "white", borderRadius: 2, textTransform: "none", boxShadow: "none" }}
                    >
                      {user.userAddress ? "Edit Address" : "Add Address"}
                    </Button>
                  )}
                </Box>
                
                <Card sx={fenzoCardStyle}>
                  {/* --- VIEW MODE --- */}
                  {!isEditingAddress ? (
                    <Box className="account-address-card" sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                      <Box sx={{ mt: 0.5, p: 1.5, bgcolor: "#e7f0ff", borderRadius: 2 }}>
                        <LocationOnIcon sx={{ color: "#5b5bd6" }} />
                      </Box>
                      <Box sx={{ flex: 1, pt: 0.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#333", mb: 1 }}>
                          Default Delivery Address
                        </Typography>
                        {user.userAddress ? (
                          <Typography variant="body1" sx={{ color: "#555", lineHeight: 1.6 }}>
                            {user.userAddress}
                          </Typography>
                        ) : (
                          <Typography color="text.secondary" sx={{ fontStyle: "italic" }}>
                            You haven't set up a delivery address yet. Click the button above to add one.
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ) : (
                    /* --- EDIT MODE --- */
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#333", mb: 2 }}>
                        Update Delivery Address
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="Enter your full address (e.g. Tashkent city, Yunusabad district, street...)"
                        value={infoAddress}
                        onChange={(e) => setInfoAddress(e.target.value)}
                        multiline
                        rows={3}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                      />

                      {infoError && (
                        <Alert severity="error" className="account-alert" sx={{ mt: 2 }}>
                          {infoError}
                        </Alert>
                      )}
                      
                      <Box className="account-form-actions" sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
                        <Button variant="outlined" color="inherit" onClick={cancelEdit} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, px: 3 }}>
                          Cancel
                        </Button>
                        <Button variant="contained" onClick={handleSaveInfo} disabled={infoSaving} sx={{ bgcolor: "#5b5bd6", color: "white",borderRadius: 2, textTransform: "none", fontWeight: 600, px: 4, boxShadow: "none" }}>
                          {infoSaving ? "Saving..." : "Save Address"}
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Card>
              </Stack>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
