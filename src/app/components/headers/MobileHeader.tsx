import React, { useState } from "react";
import { AppBar, Badge, Box, Button, IconButton, MenuItem, Select, Toolbar } from "@mui/material";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { NavLink, useHistory } from "react-router-dom";
import { languageCodes, languageOptions, SupportedLanguage } from "../../i18n/translations";
import { useWishlistContext } from "../../context/WishlistContext";
import { useGlobals } from "../../hooks/useGlobals";
import Basket from "./Basket";

export function MobileHeader() {
  const history = useHistory();
  const { wishlistItems } = useWishlistContext();
  const { authUser, language, setLanguage, t } = useGlobals();
  const [searchValue, setSearchValue] = useState("");

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchValue.trim();
    history.push(query ? `/products?q=${encodeURIComponent(query)}` : "/products");
  };

  return (
    <AppBar position="sticky" className="mobile-appbar" elevation={0} component="header">
      <Toolbar className="mobile-toolbar">
        <Box className="mobile-logo-wrap" component={NavLink} to="/" aria-label="FENZO home">
          <img src="/icons/logo2.png" alt="FENZO" className="mobile-logo" />
        </Box>

        <Box className="mobile-actions">
          <Box className="mobile-language-control">
            <LanguageRoundedIcon className="mobile-language-icon" aria-hidden="true" />
            <Select
              value={language}
              onChange={(event) => setLanguage(event.target.value as SupportedLanguage)}
              renderValue={(selected) => languageCodes[selected as SupportedLanguage]}
              size="small"
              className="mobile-lang-select"
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
              className="mobile-icon-button"
              component={NavLink}
              to="/profile?tab=wishlist"
              aria-label={`Wishlist with ${wishlistItems.length} items`}
            >
              <Badge badgeContent={wishlistItems.length} color="error">
                <FavoriteBorderRoundedIcon />
              </Badge>
            </IconButton>
          )}
          <Basket iconButtonClassName="mobile-icon-button" />

          {authUser ? null : (
            <Box className="mobile-auth-actions">
              <Button component={NavLink} to="/login" className="mobile-auth-btn mobile-login-btn">
                {t("login")}
              </Button>
              <Button component={NavLink} to="/signup" className="mobile-auth-btn mobile-signup-btn">
                {t("signUp")}
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>

      <Box component="form" role="search" className="mobile-search" onSubmit={submitSearch}>
        <SearchRoundedIcon className="mobile-search-icon" aria-hidden="true" />
        <input
          type="search"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Search products"
          aria-label="Search products"
          className="mobile-search-input"
        />
        <button type="submit" className="mobile-search-submit" aria-label="Search">
          <SearchRoundedIcon />
        </button>
      </Box>
    </AppBar>
  );
}
