import React, { useState, useMemo, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Paper,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Divider,
  CircularProgress,
  Stack,
  IconButton,
} from "@mui/material";
import { useHistory, useLocation } from "react-router-dom";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PaymentIcon from "@mui/icons-material/Payment";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import { useCart } from "../../context/CartContext";
import { useGlobals } from "../../hooks/useGlobals";
import OrderService from "../../services/OrderService";
import { serverApi } from "../../../lib/config";
import { sweetAlert } from "../../../lib/sweetalert";
import { CartItem } from "../../../lib/types/cart";
import { CreateOrderInput, BuyNowItem } from "../../../lib/types/order";

const steps = ["Cart", "Delivery", "Payment", "Confirm"];
const orderService = new OrderService();
const FREE_DELIVERY_THRESHOLD = 100;
const DELIVERY_FEE = 5;

type CardType = "visa" | "mastercard" | "amex" | "unionpay" | "unknown";

function getCardType(num: string): CardType {
  const n = num.replace(/\D/g, "").slice(0, 4);
  if (/^4/.test(n)) return "visa";
  if (/^5[1-5]/.test(n) || /^2(22[1-9]|2[3-9]\d|[3-6]\d{2}|7[01]\d|720)/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  if (/^62|^88/.test(n)) return "unionpay";
  return "unknown";
}

function formatCardNumber(value: string): string {
  const v = value.replace(/\D/g, "").slice(0, 16);
  return v.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function formatExpiry(value: string): string {
  const v = value.replace(/\D/g, "").slice(0, 4);
  if (v.length >= 2) return `${v.slice(0, 2)}/${v.slice(2)}`;
  return v;
}

function CheckoutPage() {
  const history = useHistory();
  const location = useLocation<{ buyNow?: BuyNowItem }>();
  const { cartItems, onDelete, onDeleteAll } = useCart();
  const { authUser } = useGlobals();

  const buyNow = location.state?.buyNow;

  const [activeStep, setActiveStep] = useState(0);
  const [delivery, setDelivery] = useState({
    address: "",
    city: "",
    zip: "",
    phone: "",
    note: "",
  });
  const [buyNowRemoved, setBuyNowRemoved] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"delivery" | "card">("delivery");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cardType = getCardType(cardNumber);
  const cardNumberRaw = cardNumber.replace(/\D/g, "");
  const cardValid =
    cardNumberRaw.length >= 16 &&
    cardExpiry.replace(/\D/g, "").length === 4 &&
    cardCvv.replace(/\D/g, "").length >= 3 &&
    cardName.trim().length >= 2;

  const canGoNextFromPayment = paymentMethod === "delivery" || (paymentMethod === "card" && cardValid);

  useEffect(() => {
    if (authUser) {
      setDelivery((current) => ({
        ...current,
        address: current.address || authUser.userAddress || "",
        phone: current.phone || authUser.userPhone || "",
      }));
    }
  }, [authUser]);

  useEffect(() => {
    if (authUser === null) {
      sweetAlert
        .warning("Please sign up first.", "Register to purchase a product.")
        .then(() => history.push("/signup"));
    }
  }, [authUser, history]);

  const canGoNextFromDelivery = delivery.address.trim() !== "";

  const orderItems = useMemo(() => {
    if (buyNow && !buyNowRemoved) {
      return [{
        productId: buyNow.productId,
        quantity: buyNow.quantity,
        price: buyNow.price,
        name: buyNow.name,
        image: buyNow.image,
      }];
    }

    if (buyNow && buyNowRemoved) return [];

    return cartItems.map((item: CartItem) => ({
      productId: item._id,
      quantity: item.quantity,
      price: item.price,
      name: item.name,
      image: item.image,
    }));
  }, [buyNow, buyNowRemoved, cartItems]);

  const handleRemoveItem = (item: {
    productId: string;
    quantity: number;
    price: number;
    name?: string;
    image?: string;
  }) => {
    if (buyNow) {
      setBuyNowRemoved(true);
      return;
    }

    const cartItem = cartItems.find((cartEntry) => cartEntry._id === item.productId);
    if (cartItem) onDelete(cartItem);
  };

  const subtotal = useMemo(
    () => orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [orderItems]
  );
  const deliveryFee = subtotal > 0 && subtotal < FREE_DELIVERY_THRESHOLD ? DELIVERY_FEE : 0;
  const orderTotal = subtotal + deliveryFee;
  const freeDeliveryRemaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const isEmpty = orderItems.length === 0;

  const handleNext = () => {
    if (activeStep === steps.length - 1) return;
    if (activeStep === 1 && !canGoNextFromDelivery) return;
    if (activeStep === 2 && !canGoNextFromPayment) return;

    setActiveStep((step) => step + 1);
    setError(null);
  };

  const handleBack = () => {
    setActiveStep((step) => step - 1);
    setError(null);
  };

  const handlePlaceOrder = () => {
    setError(null);
    setPlacing(true);

    const body: CreateOrderInput = {
      items: orderItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
      note:
        [delivery.address, delivery.city, delivery.zip, delivery.phone, delivery.note]
          .filter(Boolean)
          .join(" | ") || undefined,
    };

    orderService
      .createOrder(body)
      .then(() => {
        if (!buyNow) onDeleteAll();
        history.replace("/profile?tab=orders");
      })
      .catch((err: any) => {
        setError(err?.response?.data?.message || err?.message || "Failed to place order.");
      })
      .finally(() => setPlacing(false));
  };

  if (isEmpty) {
    return (
      <main className="checkout-page checkout-page--empty">
        <Container maxWidth="sm">
          <Paper elevation={0} className="checkout-empty-card">
            <Box className="checkout-empty-icon"><LocalMallIcon /></Box>
            <Typography component="h1" className="checkout-empty-title">Your cart is empty</Typography>
            <Typography className="checkout-empty-text">
              Discover something you love, then come back here to complete your order.
            </Typography>
            <Button className="checkout-primary-btn" onClick={() => history.push("/products")}>
              Explore products
            </Button>
          </Paper>
        </Container>
      </main>
    );
  }

  if (authUser === null) {
    return (
      <Box className="checkout-loading">
        <Box className="checkout-loading-icon"><CircularProgress size={30} /></Box>
        <Typography>Preparing secure checkout…</Typography>
      </Box>
    );
  }

  return (
    <main className="checkout-page">
      <Container maxWidth="lg" className="checkout-container">
        <Button className="checkout-back-btn" startIcon={<ArrowBackIcon />} onClick={() => history.goBack()}>
          Back to shopping
        </Button>

        <header className="checkout-header">
          <Box>
            <Typography className="checkout-kicker">Simple · secure · clear</Typography>
            <Typography component="h1" className="checkout-title">Complete your order</Typography>
            <Typography className="checkout-subtitle">
              Review your items, add delivery details and confirm when you are ready.
            </Typography>
          </Box>
          <Box className="checkout-header-note">
            <LockRoundedIcon />
            <span>Protected checkout</span>
          </Box>
        </header>

        <Stepper activeStep={activeStep} className="checkout-stepper" alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box className="checkout-layout">
          <Paper elevation={0} className="checkout-card checkout-main-card">
            {activeStep === 0 && (
              <Box>
                <Box className="checkout-section-head">
                  <Box className="checkout-section-icon"><LocalMallIcon /></Box>
                  <Box>
                    <Typography className="checkout-section-title">Review items</Typography>
                    <Typography className="checkout-section-copy">Make sure everything looks right before continuing.</Typography>
                  </Box>
                </Box>

                <Box component="ul" className="checkout-items-list">
                  {orderItems.map((item) => (
                    <Box component="li" key={item.productId} className="checkout-item-row">
                      <img
                        src={item.image ? `${serverApi}/${item.image}` : "/img/product-placeholder.svg"}
                        alt={item.name || "Item"}
                        onClick={() => history.push(`/products/detail/${item.productId}`)}
                        onError={(event) => {
                          event.currentTarget.src = "/img/product-placeholder.svg";
                        }}
                        className="checkout-item-img"
                      />

                      <Box className="checkout-item-info">
                        <Typography className="checkout-item-name">
                          {item.name || `Product ${item.productId.slice(-6)}`}
                        </Typography>
                        <Typography className="checkout-item-meta">
                          ${item.price.toFixed(2)} × {item.quantity}
                        </Typography>
                      </Box>

                      <Typography className="checkout-item-price">
                        ${(item.price * item.quantity).toFixed(2)}
                      </Typography>

                      <IconButton
                        className="checkout-delete-btn"
                        size="small"
                        onClick={() => handleRemoveItem(item)}
                        aria-label={`Remove ${item.name || "item"}`}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {activeStep === 1 && (
              <Box>
                <Box className="checkout-section-head">
                  <Box className="checkout-section-icon"><LocalShippingIcon /></Box>
                  <Box>
                    <Typography className="checkout-section-title">Delivery details</Typography>
                    <Typography className="checkout-section-copy">Tell us where this order should arrive.</Typography>
                  </Box>
                </Box>

                <Stack spacing={2} className="checkout-form">
                  <TextField
                    fullWidth
                    label="Street address"
                    value={delivery.address}
                    onChange={(event) => setDelivery((current) => ({ ...current, address: event.target.value }))}
                    placeholder="123 Main St"
                    required
                  />

                  <Box className="checkout-address-row">
                    <TextField
                      fullWidth
                      label="City (optional)"
                      value={delivery.city}
                      onChange={(event) => setDelivery((current) => ({ ...current, city: event.target.value }))}
                    />
                    <TextField
                      fullWidth
                      label="ZIP code (optional)"
                      value={delivery.zip}
                      onChange={(event) => setDelivery((current) => ({ ...current, zip: event.target.value }))}
                    />
                  </Box>

                  <TextField
                    fullWidth
                    type="tel"
                    label="Phone"
                    value={delivery.phone}
                    onChange={(event) => setDelivery((current) => ({ ...current, phone: event.target.value }))}
                    placeholder="+1 234 567 8900"
                  />

                  <TextField
                    fullWidth
                    label="Delivery note (optional)"
                    value={delivery.note}
                    onChange={(event) => setDelivery((current) => ({ ...current, note: event.target.value }))}
                    placeholder="Gate code, leave at door, etc."
                    multiline
                    rows={3}
                  />
                </Stack>
              </Box>
            )}

            {activeStep === 2 && (
              <Box>
                <Box className="checkout-section-head">
                  <Box className="checkout-section-icon"><PaymentIcon /></Box>
                  <Box>
                    <Typography className="checkout-section-title">Payment method</Typography>
                    <Typography className="checkout-section-copy">Choose how you would like to complete this order.</Typography>
                  </Box>
                </Box>

                <FormControl component="fieldset" fullWidth className="checkout-payment-method">
                  <RadioGroup
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value as "delivery" | "card")}
                  >
                    <FormControlLabel
                      value="delivery"
                      control={<Radio />}
                      label={
                        <Box className="checkout-payment-label">
                          <strong>Pay on delivery</strong>
                          <span>Pay with cash or card when your order arrives.</span>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="card"
                      control={<Radio />}
                      label={
                        <Box className="checkout-payment-label">
                          <strong>Card details preview</strong>
                          <span>Validate card details before placing the order.</span>
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>

                {paymentMethod === "card" && (
                  <Paper variant="outlined" className="checkout-card-form">
                    <Box className="checkout-payment-notice">
                      <InfoOutlinedIcon />
                      <Typography>
                        Online charging is not connected yet. These details stay on this screen and are not sent with the order.
                      </Typography>
                    </Box>

                    <Box className="checkout-card-tags">
                      <Typography>Card preview</Typography>
                      <Box>
                        <span>Visa</span><span>MC</span><span>Amex</span><span>UnionPay</span>
                      </Box>
                    </Box>

                    <Stack spacing={2}>
                      <TextField
                        fullWidth
                        label="Card number"
                        value={cardNumber}
                        onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
                        placeholder="4242 4242 4242 4242"
                        inputProps={{ maxLength: 19, inputMode: "numeric" }}
                        InputProps={{
                          startAdornment: cardType !== "unknown" && (
                            <Box component="span" className="checkout-card-type">
                              {cardType === "visa" ? "Visa" : cardType === "mastercard" ? "MC" : cardType === "amex" ? "Amex" : "UnionPay"}
                            </Box>
                          ),
                        }}
                      />

                      <Box className="checkout-card-row">
                        <TextField
                          label="Expiry (MM/YY)"
                          value={cardExpiry}
                          onChange={(event) => setCardExpiry(formatExpiry(event.target.value))}
                          placeholder="MM/YY"
                          inputProps={{ maxLength: 5, inputMode: "numeric" }}
                        />
                        <TextField
                          label="CVV"
                          value={cardCvv}
                          onChange={(event) => setCardCvv(event.target.value.replace(/\D/g, "").slice(0, 4))}
                          placeholder={cardType === "amex" ? "4 digits" : "123"}
                          inputProps={{ maxLength: 4, inputMode: "numeric" }}
                        />
                      </Box>

                      <TextField
                        fullWidth
                        label="Name on card"
                        value={cardName}
                        onChange={(event) => setCardName(event.target.value.slice(0, 40))}
                        placeholder="John Doe"
                      />
                    </Stack>
                  </Paper>
                )}
              </Box>
            )}

            {activeStep === 3 && (
              <Box>
                <Box className="checkout-section-head">
                  <Box className="checkout-section-icon checkout-section-icon--success"><AssignmentIcon /></Box>
                  <Box>
                    <Typography className="checkout-section-title">Ready to order</Typography>
                    <Typography className="checkout-section-copy">One final check, then your order will be created.</Typography>
                  </Box>
                </Box>

                <Box className="checkout-confirm-card">
                  <Box className="checkout-confirm-row">
                    <Box className="checkout-confirm-icon"><LocalShippingIcon /></Box>
                    <Box>
                      <Typography component="strong">Delivery</Typography>
                      <Typography>
                        {[delivery.address, delivery.city, delivery.zip].filter(Boolean).join(", ") || "—"}
                      </Typography>
                    </Box>
                  </Box>
                  <Box className="checkout-confirm-row">
                    <Box className="checkout-confirm-icon"><PaymentIcon /></Box>
                    <Box>
                      <Typography component="strong">Payment</Typography>
                      <Typography>
                        {paymentMethod === "delivery"
                          ? "Pay on delivery"
                          : `Card preview (${cardType !== "unknown" ? cardType.charAt(0).toUpperCase() + cardType.slice(1) : "Card"} •••• ${cardNumberRaw.slice(-4) || "----"})`}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box className="checkout-summary-list checkout-summary-list--confirm">
                  {orderItems.map((item) => (
                    <Box key={item.productId} className="checkout-summary-row">
                      <Typography>{item.name || `Product ${item.productId.slice(-6)}`} × {item.quantity}</Typography>
                      <Typography>${(item.price * item.quantity).toFixed(2)}</Typography>
                    </Box>
                  ))}
                </Box>

                <Divider className="checkout-divider" />
                <Box className="checkout-summary-row"><Typography>Subtotal</Typography><Typography>${subtotal.toFixed(2)}</Typography></Box>
                <Box className="checkout-summary-row"><Typography>Delivery fee</Typography><Typography>{deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}</Typography></Box>
                <Box className="checkout-total-row"><Typography>Total</Typography><Typography>${orderTotal.toFixed(2)}</Typography></Box>

                {error && <Typography className="checkout-error" role="alert">{error}</Typography>}
              </Box>
            )}

            <Box className="checkout-actions">
              <Button className="checkout-secondary-btn" disabled={activeStep === 0} onClick={handleBack}>
                Back
              </Button>
              <Box className="checkout-spacer" />
              {activeStep === steps.length - 1 ? (
                <Button className="checkout-primary-btn" onClick={handlePlaceOrder} disabled={placing}>
                  {placing ? <CircularProgress size={21} /> : "Place order"}
                </Button>
              ) : (
                <Button
                  className="checkout-primary-btn"
                  onClick={handleNext}
                  disabled={(activeStep === 1 && !canGoNextFromDelivery) || (activeStep === 2 && !canGoNextFromPayment)}
                >
                  Continue
                </Button>
              )}
            </Box>
          </Paper>

          <Paper component="aside" elevation={0} className="checkout-summary-panel">
            <Box className="checkout-summary-head">
              <Box>
                <Typography className="checkout-summary-eyebrow">Your basket</Typography>
                <Typography className="checkout-summary-title">Order summary</Typography>
              </Box>
              <Box className="checkout-summary-count">{orderItems.length}</Box>
            </Box>

            <Box className="checkout-summary-products">
              {orderItems.map((item) => (
                <Box key={`summary-${item.productId}`} className="checkout-summary-product">
                  <Box className="checkout-summary-img-wrap">
                    <img
                      src={item.image ? `${serverApi}/${item.image}` : "/img/product-placeholder.svg"}
                      alt=""
                      onError={(event) => {
                        event.currentTarget.src = "/img/product-placeholder.svg";
                      }}
                    />
                    <span>{item.quantity}</span>
                  </Box>
                  <Box className="checkout-summary-product-copy">
                    <Typography>{item.name || `Product ${item.productId.slice(-6)}`}</Typography>
                    <small>${item.price.toFixed(2)} each</small>
                  </Box>
                  <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                </Box>
              ))}
            </Box>

            <Divider className="checkout-divider" />
            <Box className="checkout-price-lines">
              <Box><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></Box>
              <Box><span>Delivery</span><strong className={deliveryFee === 0 ? "is-free" : ""}>{deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}</strong></Box>
            </Box>

            {freeDeliveryRemaining > 0 ? (
              <Box className="checkout-delivery-progress">
                <Box><span>Add ${freeDeliveryRemaining.toFixed(2)} for free delivery</span><strong>${FREE_DELIVERY_THRESHOLD}</strong></Box>
                <Box className="checkout-progress-track"><span style={{ width: `${Math.min(100, subtotal)}%` }} /></Box>
              </Box>
            ) : (
              <Box className="checkout-free-delivery"><CheckCircleRoundedIcon /> Free delivery unlocked</Box>
            )}

            <Box className="checkout-summary-total"><span>Total</span><strong>${orderTotal.toFixed(2)}</strong></Box>
            <Box className="checkout-trust-note"><LockRoundedIcon /><span>Prices are verified by the server when your order is placed.</span></Box>
          </Paper>
        </Box>
      </Container>
    </main>
  );
}

export default CheckoutPage;
