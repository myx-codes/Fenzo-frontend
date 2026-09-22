import React, { useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { NavLink, useHistory } from "react-router-dom";
import { languageCodes, languageOptions, SupportedLanguage } from "../../i18n/translations";
import { useWishlistContext } from "../../context/WishlistContext";
import { useGlobals } from "../../hooks/useGlobals";
import { serverApi } from "../../../lib/config";
import Basket from "./Basket";

type DesktopNavbarProps = {
  sticky?: boolean;
};

export function DesktopNavbar({ sticky = false }: DesktopNavbarProps) {
  const history = useHistory();
  const { authUser, logout, language, setLanguage, t } = useGlobals();
  const { wishlistItems } = useWishlistContext();
  const [searchValue, setSearchValue] = useState("");
  const [accountAnchor, setAccountAnchor] = useState<null | HTMLElement>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const menuItems = [
    { label: t("home"), path: "/", exact: true },
    { label: t("products"), path: "/products", exact: true },
  ];

  const quickCategoryItems = [
    { label: "Fashion", path: "/products/FASHION" },
    { label: "Electronics", path: "/products/ELECTRONICS" },
    { label: "Beauty", path: "/products/BEAUTY" },
    { label: "Home & Kitchen", path: "/products/HOME_KITCHEN" },
    { label: "Food", path: "/products/FOOD" },
  ];

  const utilityItems = [
    { label: t("help"), path: "/help" },
  ];

  const categoryItems = [
    { label: "All products", path: "/products", icon: "A", desc: "Browse everything" },
    { label: "Fashion", path: "/products/FASHION", icon: "◇", desc: "Clothing, shoes, bags" },
    { label: "Women’s Clothing", path: "/products/WOMEN_CLOTHING", icon: "W", desc: "Dresses, tops, daily wear" },
    { label: "Men’s Clothing", path: "/products/MEN_CLOTHING", icon: "M", desc: "Outerwear, shirts, basics" },
    { label: "Shoes", path: "/products/SHOES", icon: "S", desc: "Sneakers and footwear" },
    { label: "Beauty", path: "/products/BEAUTY", icon: "✿", desc: "Makeup and care" },
    { label: "Skin Care", path: "/products/SKIN_CARE", icon: "S", desc: "Routine essentials" },
    { label: "Health", path: "/products/HEALTH", icon: "✚", desc: "Wellness products" },
    { label: "Electronics", path: "/products/ELECTRONICS", icon: "⌁", desc: "Devices and accessories" },
    { label: "Computers", path: "/products/COMPUTERS", icon: "C", desc: "Laptops and gear" },
    { label: "Home & Kitchen", path: "/products/HOME_KITCHEN", icon: "H", desc: "Home essentials" },
    { label: "Food & Grocery", path: "/products/FOOD", icon: "F", desc: "Daily groceries" },
    { label: "Kids", path: "/products/KIDS", icon: "K", desc: "Family picks" },
    { label: "Sports & Outdoors", path: "/products/SPORTS_OUTDOORS", icon: "S", desc: "Active lifestyle" },
    { label: "Pet Supplies", path: "/products/PET_SUPPLIES", icon: "P", desc: "For pets" },
    { label: "Books & Stationery", path: "/products/BOOKS_STATIONERY", icon: "B", desc: "Reading and office" },
  ];

  const closeAccountMenu = () => setAccountAnchor(null);

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchValue.trim();
    history.push(query ? `/products?q=${encodeURIComponent(query)}` : "/products");
  };

  const handleLogout = () => {
    closeAccountMenu();
    logout();
  };

  return (
    <header className={`site-header ${sticky ? "site-header--sticky" : ""}`}>
      <Container maxWidth="xl" className="site-header-container">
        <Box className="site-header-main">
          <NavLink to="/" className="site-brand" aria-label="FENZO home">
            <img src="/icons/logo2.png" alt="FENZO" className="site-brand-logo" />
          </NavLink>

          <Box component="form" role="search" className="site-search" onSubmit={submitSearch}>
            <SearchRoundedIcon className="site-search-leading" aria-hidden="true" />
            <input
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="site-search-input"
              aria-label="Search products"
              placeholder="Search products, categories, and brands"
            />
            <IconButton type="submit" className="site-search-submit" aria-label="Search">
              <SearchRoundedIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box className="site-header-actions">
            <Box className="site-language">
              <LanguageRoundedIcon className="site-language-icon" aria-hidden="true" />
              <Select
                className="site-language-select"
                value={language}
                onChange={(event) => setLanguage(event.target.value as SupportedLanguage)}
                renderValue={(selected) => languageCodes[selected as SupportedLanguage]}
                size="small"
                inputProps={{ "aria-label": t("language") }}
              >
                {languageOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            {authUser && (
              <IconButton
                className="site-action-button"
                component={NavLink}
                to="/profile?tab=wishlist"
                aria-label={`Wishlist with ${wishlistItems.length} items`}
              >
                <Badge badgeContent={wishlistItems.length} color="error">
                  <FavoriteBorderRoundedIcon />
                </Badge>
              </IconButton>
            )}
            <Basket iconButtonClassName="site-action-button" />

            {authUser ? (
              <>
                <button
                  type="button"
                  className="site-account-trigger"
                  onClick={(event) => setAccountAnchor(event.currentTarget)}
                  aria-controls={accountAnchor ? "desktop-account-menu" : undefined}
                  aria-haspopup="menu"
                  aria-expanded={accountAnchor ? "true" : undefined}
                >
                  <Avatar
                    alt={authUser.userNick}
                    src={authUser.userImage ? `${serverApi}/${authUser.userImage}` : undefined}
                    className="site-account-avatar"
                  >
                    {(authUser.userNick || "U").charAt(0).toUpperCase()}
                  </Avatar>
                  <span className="site-account-copy">
                    <small>{t("profile")}</small>
                    <strong>{authUser.userNick}</strong>
                  </span>
                </button>
                <Menu
                  id="desktop-account-menu"
                  anchorEl={accountAnchor}
                  open={Boolean(accountAnchor)}
                  onClose={closeAccountMenu}
                  PaperProps={{ elevation: 0, className: "profile-menu-paper" }}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                >
                  <Box className="profile-menu-summary">
                    <Avatar
                      className="menu-avatar"
                      src={authUser.userImage ? `${serverApi}/${authUser.userImage}` : undefined}
                    >
                      {(authUser.userNick || "U").charAt(0).toUpperCase()}
                    </Avatar>
                    <Box className="profile-menu-copy">
                      <Typography className="menu-username">{authUser.userNick}</Typography>
                      <Typography className="menu-email">{authUser.userPhone}</Typography>
                    </Box>
                  </Box>
                  <Divider className="menu-divider" />
                  <MenuItem
                    className="menu-item"
                    onClick={() => {
                      closeAccountMenu();
                      history.push("/profile");
                    }}
                  >
                    <ListItemIcon><PersonOutlineRoundedIcon fontSize="small" /></ListItemIcon>
                    {t("profile")}
                  </MenuItem>
                  <MenuItem onClick={handleLogout} className="menu-item logout-item">
                    <ListItemIcon><LogoutRoundedIcon fontSize="small" /></ListItemIcon>
                    {t("logout")}
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box className="site-auth-actions">
                <Button component={NavLink} to="/login" className="site-login-button">
                  {t("login")}
                </Button>
                <Button component={NavLink} to="/signup" className="site-signup-button">
                  {t("signUp")}
                </Button>
              </Box>
            )}
          </Box>
        </Box>

        <nav
          className="site-category-nav"
          aria-label="Primary navigation"
          onMouseLeave={() => setCategoryOpen(false)}
        >
          <button
            type="button"
            className={`site-category-trigger ${categoryOpen ? "is-open" : ""}`}
            onClick={() => setCategoryOpen((current) => !current)}
            aria-expanded={categoryOpen}
            aria-controls="desktop-category-panel"
          >
            <CategoryRoundedIcon fontSize="small" />
            <span>Category</span>
            <KeyboardArrowDownRoundedIcon className="site-category-trigger-arrow" fontSize="small" />
          </button>

          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              exact={item.exact}
              className="site-category-link"
              activeClassName="is-active"
            >
              {item.label}
            </NavLink>
          ))}

          {quickCategoryItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="site-category-link site-category-link--quick"
              activeClassName="is-active"
            >
              {item.label}
            </NavLink>
          ))}

          {utilityItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="site-category-link"
              activeClassName="is-active"
            >
              {item.label}
            </NavLink>
          ))}

          {categoryOpen && (
            <Box
              id="desktop-category-panel"
              className="site-category-panel"
              role="menu"
              aria-label="Product categories"
            >
              <Box className="site-category-panel-list">
                {categoryItems.map((category) => (
                  <NavLink
                    key={category.path}
                    to={category.path}
                    className="site-category-panel-item"
                    activeClassName="is-active"
                    role="menuitem"
                    onClick={() => setCategoryOpen(false)}
                  >
                    <span className="site-category-panel-icon" aria-hidden="true">{category.icon}</span>
                    <span className="site-category-panel-copy">
                      <strong>{category.label}</strong>
                      <small>{category.desc}</small>
                    </span>
                  </NavLink>
                ))}
              </Box>
            </Box>
          )}
        </nav>
      </Container>
    </header>
  );
}

export function HomeNavbar() {
  return <DesktopNavbar />;
}
