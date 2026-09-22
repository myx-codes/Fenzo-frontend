import React, { useState } from "react";
import { Badge, Box, Button, Drawer, IconButton, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import { useHistory } from "react-router-dom";
import { CartItem } from "../../../lib/types/cart";
import { serverApi } from "../../../lib/config";
import { useCart } from "../../context/CartContext";

export interface BasketProps {
  iconButtonClassName?: string;
}

const FREE_SHIPPING_THRESHOLD = 100;

export default function Basket({ iconButtonClassName }: BasketProps = {}) {
  const history = useHistory();
  const { cartItems, onAdd, onRemove, onDelete, onDeleteAll } = useCart();
  const [open, setOpen] = useState(false);

  const subtotal = cartItems.reduce(
    (sum: number, item: CartItem) => sum + item.quantity * Number(item.price || 0),
    0,
  );
  const shipping = subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD ? 5 : 0;
  const total = subtotal + shipping;
  const totalUnits = cartItems.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
  const amountUntilFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);

  const closeDrawer = () => setOpen(false);

  const goToProduct = (productId: string) => {
    closeDrawer();
    history.push(`/products/detail/${productId}`);
  };

  const goToProducts = () => {
    closeDrawer();
    history.push("/products");
  };

  const goToCheckout = () => {
    closeDrawer();
    history.push("/checkout");
  };

  return (
    <Box className="basket-root">
      <IconButton
        className={iconButtonClassName || "basket-trigger"}
        onClick={() => setOpen(true)}
        aria-label={`Open cart with ${totalUnits} ${totalUnits === 1 ? "item" : "items"}`}
        aria-haspopup="dialog"
      >
        <Badge badgeContent={totalUnits} color="error" className="basket-badge">
          <ShoppingCartRoundedIcon className="basket-trigger-icon" />
        </Badge>
      </IconButton>

      <Drawer
        anchor="right"
        open={open}
        onClose={closeDrawer}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ className: "basket-drawer-paper" }}
      >
        <Box className="basket-drawer" role="dialog" aria-modal="true" aria-labelledby="basket-title">
          <Box className="basket-header">
            <Box>
              <Typography component="p" className="basket-eyebrow">Your selection</Typography>
              <Typography component="h2" id="basket-title" className="basket-title">
                Shopping cart
                <span>{totalUnits}</span>
              </Typography>
            </Box>
            <IconButton onClick={closeDrawer} className="basket-close" aria-label="Close cart">
              <CloseRoundedIcon />
            </IconButton>
          </Box>

          {cartItems.length > 0 && (
            <Box className="basket-shipping-note">
              <LocalShippingOutlinedIcon aria-hidden="true" />
              <Box>
                <strong>
                  {amountUntilFreeShipping > 0
                    ? `$${amountUntilFreeShipping.toFixed(2)} away from free delivery`
                    : "You unlocked free delivery"}
                </strong>
                <span>Fast, tracked delivery on every order.</span>
              </Box>
            </Box>
          )}

          <Box className="basket-items-list">
            {cartItems.length === 0 ? (
              <Box className="basket-empty">
                <span className="basket-empty-icon-wrap">
                  <ShoppingBagOutlinedIcon className="basket-empty-icon" />
                </span>
                <Typography className="basket-empty-title">Your cart is ready for something new</Typography>
                <Typography className="basket-empty-text">
                  Explore curated essentials and add your favorites here.
                </Typography>
                <Button className="basket-browse-button" endIcon={<ArrowForwardRoundedIcon />} onClick={goToProducts}>
                  Explore products
                </Button>
              </Box>
            ) : (
              cartItems.map((item: CartItem) => {
                const imagePath = item.image ? `${serverApi}/${item.image}` : "/img/product-placeholder.svg";
                return (
                  <article key={item._id} className="basket-item">
                    <button
                      type="button"
                      className="basket-item-image-button"
                      onClick={() => goToProduct(item._id)}
                      aria-label={`View ${item.name}`}
                    >
                      <img
                        src={imagePath}
                        alt={item.name}
                        className="basket-item-img"
                        onError={(event) => {
                          (event.currentTarget as HTMLImageElement).src = "/img/product-placeholder.svg";
                        }}
                      />
                    </button>

                    <Box className="basket-item-details">
                      <button type="button" className="basket-item-name" onClick={() => goToProduct(item._id)}>
                        {item.name}
                      </button>
                      <Typography className="basket-item-price">
                        ${Number(item.price || 0).toFixed(2)}
                      </Typography>
                      <Box className="basket-qty-controls" aria-label={`Quantity for ${item.name}`}>
                        <IconButton
                          size="small"
                          onClick={() => onRemove(item)}
                          className="basket-qty-btn"
                          aria-label={`Decrease ${item.name} quantity`}
                        >
                          <RemoveRoundedIcon />
                        </IconButton>
                        <span className="basket-qty-value" aria-live="polite">{item.quantity}</span>
                        <IconButton
                          size="small"
                          onClick={() => onAdd(item)}
                          className="basket-qty-btn"
                          aria-label={`Increase ${item.name} quantity`}
                        >
                          <AddRoundedIcon />
                        </IconButton>
                      </Box>
                    </Box>

                    <IconButton
                      size="small"
                      onClick={() => onDelete(item)}
                      className="basket-item-delete"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <DeleteOutlineRoundedIcon />
                    </IconButton>
                  </article>
                );
              })
            )}
          </Box>

          {cartItems.length > 0 && (
            <Box className="basket-footer">
              <button type="button" className="basket-clear-button" onClick={onDeleteAll}>
                Clear cart
              </button>
              <Box className="basket-summary">
                <Box className="basket-summary-row">
                  <span>Subtotal</span>
                  <strong>${subtotal.toFixed(2)}</strong>
                </Box>
                <Box className="basket-summary-row">
                  <span>Delivery</span>
                  <strong>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</strong>
                </Box>
                <Box className="basket-summary-row basket-summary-total">
                  <span>Total</span>
                  <strong>${total.toFixed(2)}</strong>
                </Box>
              </Box>
              <Button fullWidth className="basket-checkout-button" endIcon={<ArrowForwardRoundedIcon />} onClick={goToCheckout}>
                Continue to checkout
              </Button>
              <Typography className="basket-secure-note">
                <LockOutlinedIcon /> Secure checkout
              </Typography>
            </Box>
          )}
        </Box>
      </Drawer>
    </Box>
  );
}
