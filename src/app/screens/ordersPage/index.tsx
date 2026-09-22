import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useHistory } from "react-router-dom";

import OrderService from "../../services/OrderService";
import { Order } from "../../../lib/types/order";
import { useGlobals } from "../../hooks/useGlobals";
import { serverApi } from "../../../lib/config";

const orderService = new OrderService();

const ORDER_STATUSES = ["ALL", "PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

function getOrderStatus(order: Order): string {
  return String(order.status || order.orderStatus || "PENDING").toUpperCase();
}

function getOrderTotal(order: Order): number {
  return Number(order.total ?? order.orderTotal ?? 0);
}

export function OrdersPage() {
  const history = useHistory();
  const { authUser, locale, t } = useGlobals();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    setError(null);
    orderService
      .getMyOrders({ page: 1, limit: 50 })
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => {
        setOrders([]);
        setError("We couldn't load your orders. Check your connection and try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (authUser === null) {
      history.replace("/login");
      return;
    }
    fetchOrders();
  }, [authUser, fetchOrders, history]);

  const visibleOrders = useMemo(() => {
    const sorted = [...orders].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    if (statusFilter === "ALL") return sorted;
    return sorted.filter((order) => getOrderStatus(order) === statusFilter);
  }, [orders, statusFilter]);

  const handleCancelOrder = (orderId: string) => {
    const id = String(orderId);
    setCancellingOrderId(id);
    setError(null);
    orderService
      .updateOrder(id, "CANCELLED")
      .then(fetchOrders)
      .catch(() => setError("This order could not be cancelled. Please try again or contact support."))
      .finally(() => setCancellingOrderId(null));
  };

  return (
    <main className="orders-page">
      <Container maxWidth="lg" className="orders-container">
        <section className="orders-hero">
          <Box className="orders-hero-copy">
            <Typography className="orders-eyebrow">
              <Inventory2OutlinedIcon /> Order center
            </Typography>
            <Typography component="h1" className="orders-title">{t("myOrdersTitle")}</Typography>
            <Typography className="orders-subtitle">{t("myOrdersSubtitle")}</Typography>
          </Box>

          <Box className="orders-hero-tools">
            <Box className="orders-count-card" aria-label={`${orders.length} orders`}>
              <span>{orders.length}</span>
              <small>{orders.length === 1 ? "order" : "orders"}</small>
            </Box>
            <FormControl size="small" className="orders-filter">
              <InputLabel>{t("status")}</InputLabel>
              <Select
                label={t("status")}
                value={statusFilter}
                onChange={(e) => setStatusFilter(String(e.target.value))}
              >
                {ORDER_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status === "ALL" ? "All orders" : status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </section>

        {error && orders.length > 0 && (
          <Box className="orders-inline-error" role="alert">
            <span>{error}</span>
            <Button startIcon={<RefreshRoundedIcon />} onClick={fetchOrders}>Retry</Button>
          </Box>
        )}

        {loading ? (
          <section className="orders-state-card" aria-live="polite">
            <Box className="orders-state-icon orders-state-icon--loading">
              <CircularProgress size={28} thickness={4} />
            </Box>
            <Typography className="orders-state-title">Loading your orders</Typography>
            <Typography className="orders-state-text">Your latest order details are on the way.</Typography>
          </section>
        ) : error && orders.length === 0 ? (
          <section className="orders-state-card" role="alert">
            <Box className="orders-state-icon orders-state-icon--error">
              <RefreshRoundedIcon />
            </Box>
            <Typography className="orders-state-title">Orders are unavailable</Typography>
            <Typography className="orders-state-text">{error}</Typography>
            <Button className="orders-state-primary" startIcon={<RefreshRoundedIcon />} onClick={fetchOrders}>
              Try again
            </Button>
          </section>
        ) : visibleOrders.length === 0 ? (
          <section className="orders-state-card">
            <Box className="orders-state-icon">
              <ShoppingBagOutlinedIcon />
            </Box>
            <Typography className="orders-state-title">
              {orders.length === 0 ? t("noOrdersYet") : "No matching orders"}
            </Typography>
            <Typography className="orders-state-text">{t("noOrdersForFilter")}</Typography>
            <Button
              className="orders-state-primary"
              endIcon={<ArrowForwardRoundedIcon />}
              onClick={() => history.push("/products")}
            >
              {t("startShopping")}
            </Button>
          </section>
        ) : (
          <section className="orders-list" aria-live="polite">
            {visibleOrders.map((order) => {
              const status = getOrderStatus(order);
              const canCancel = ["PENDING", "PAID", "PROCESSING"].includes(status);
              const total = getOrderTotal(order);
              const items = order.orderItems || [];

              return (
                <article key={order._id} className="order-card">
                  <header className="order-card-header">
                    <Box className="order-id-box">
                      <Typography component="span" className="order-overline">{t("order")}</Typography>
                      <Typography component="h2" className="order-id">#{order._id.slice(-8).toUpperCase()}</Typography>
                      <Typography component="time" className="order-date">
                        {new Date(order.createdAt).toLocaleString(locale, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Typography>
                    </Box>
                    <Chip
                      label={status}
                      className={`status-badge status-${status}`}
                      icon={<span className="status-dot" />}
                    />
                  </header>

                  <Box className="order-item-list">
                    {items.length > 0 ? items.map((item) => {
                      const unitPrice = Number(item.itemPrice);
                      const lineTotal = unitPrice * Number(item.itemQuantity);
                      return (
                        <Box key={`${order._id}-${item.productId}`} className="order-item-row">
                          <img
                            src={item.productImage ? `${serverApi}/${item.productImage}` : "/img/product-placeholder.svg"}
                            alt={item.productName || "Product"}
                            className="order-item-img"
                            onError={(event) => {
                              event.currentTarget.src = "/img/product-placeholder.svg";
                            }}
                          />
                          <Box className="order-item-details">
                            <Typography className="order-item-name">
                              {item.productName || `Product ${item.productId.slice(-5)}`}
                            </Typography>
                            <Typography className="order-item-meta">
                              {t("qty")}: {item.itemQuantity} · ${unitPrice.toFixed(2)} each
                            </Typography>
                          </Box>
                          <Typography className="order-item-price">${lineTotal.toFixed(2)}</Typography>
                        </Box>
                      );
                    }) : (
                      <Typography className="order-items-empty">Item details are unavailable for this order.</Typography>
                    )}
                  </Box>

                  <footer className="order-card-footer">
                    <Box className="total-price-box">
                      <Typography component="span" className="total-label">{t("total")}</Typography>
                      <Typography component="span" className="total-amount">${total.toFixed(2)}</Typography>
                    </Box>

                    <Box className="order-actions">
                      <Button
                        className="btn-order-outline"
                        startIcon={<LocalShippingIcon />}
                        onClick={() => history.push("/help")}
                      >
                        {t("support")}
                      </Button>
                      {canCancel && (
                        <Button
                          className="btn-order-filled"
                          startIcon={cancellingOrderId === order._id ? <CircularProgress size={16} /> : <ReceiptLongIcon />}
                          disabled={cancellingOrderId === order._id}
                          onClick={() => handleCancelOrder(order._id)}
                        >
                          {cancellingOrderId === order._id ? t("cancelling") : t("cancel")}
                        </Button>
                      )}
                    </Box>
                  </footer>
                </article>
              );
            })}
          </section>
        )}
      </Container>
    </main>
  );
}
