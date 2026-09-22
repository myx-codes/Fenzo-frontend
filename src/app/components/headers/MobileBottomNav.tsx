import React from "react";
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import { useHistory, useLocation } from "react-router-dom";
import { useGlobals } from "../../hooks/useGlobals";
import { TranslationKey } from "../../i18n/translations";

const navItems: Array<{ labelKey: TranslationKey; value: string; icon: React.ReactNode }> = [
  { labelKey: "home", value: "/", icon: <HomeRoundedIcon /> },
  { labelKey: "products", value: "/products", icon: <StorefrontRoundedIcon /> },
  { labelKey: "orders", value: "/orders", icon: <ReceiptLongRoundedIcon /> },
  { labelKey: "profile", value: "/profile", icon: <PersonRoundedIcon /> },
  { labelKey: "help", value: "/help", icon: <HelpOutlineRoundedIcon /> },
];

function resolveCurrentPath(pathname: string): string {
  const found = navItems.find((item) => pathname === item.value || pathname.startsWith(item.value + "/"));
  if (found) return found.value;
  if (pathname.startsWith("/products")) return "/products";
  if (pathname.startsWith("/profile")) return "/profile";
  if (pathname.startsWith("/orders")) return "/orders";
  if (pathname.startsWith("/help")) return "/help";
  return "/";
}

export function MobileBottomNav() {
  const history = useHistory();
  const location = useLocation();
  const { t } = useGlobals();
  const current = resolveCurrentPath(location.pathname);

  return (
    <Paper
      component="nav"
      aria-label="Primary navigation"
      elevation={0}
      square
      className="mobile-bottom-nav-wrap"
    >
      <BottomNavigation
        showLabels
        value={current}
        onChange={(_e, value) => history.push(value)}
        className="mobile-bottom-nav"
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.value}
            label={t(item.labelKey)}
            value={item.value}
            icon={item.icon}
            aria-label={t(item.labelKey)}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
