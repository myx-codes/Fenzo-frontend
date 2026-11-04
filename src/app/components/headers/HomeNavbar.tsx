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
import { Brand } from "./Brand";
import { CategoryNavigation } from "./CategoryNavigation";

type DesktopNavbarProps = {
  sticky?: boolean;
};

export function DesktopNavbar({ sticky = false }: DesktopNavbarProps) {
  const history = useHistory();
  const { authUser, logout, language, setLanguage, t } = useGlobals();
  const { wishlistItems } = useWishlistContext();
  const [searchValue, setSearchValue] = useState("");
  const [accountAnchor, setAccountAnchor] = useState<null | HTMLElement>(null);

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
    <header className={`site-header fz-header ${sticky ? "site-header--sticky" : ""}`}>
      <Container maxWidth="xl" className="site-header-container">
        <Box className="site-header-main">
          <Brand />

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

        <CategoryNavigation />
      </Container>
    </header>
  );
}

export function HomeNavbar() {
  return <DesktopNavbar />;
}
