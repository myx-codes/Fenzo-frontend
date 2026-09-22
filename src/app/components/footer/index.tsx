import React from "react";
import { Box, Container, Typography } from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import { NavLink } from "react-router-dom";
import { useGlobals } from "../../hooks/useGlobals";

export function Footer() {
  const { t } = useGlobals();

  return (
    <footer className="site-footer">
      <Container maxWidth="xl" className="site-footer-container">
        <Box className="footer-main">
          <Box className="footer-brand-column">
            <NavLink to="/" className="footer-brand" aria-label="FENZO home">FENZO</NavLink>
            <Typography className="footer-description">
              {t("bestQualityBestPrices")} Curated finds from trusted sellers.
            </Typography>
            <span className="footer-trust-pill">Secure shopping · Verified stores</span>
          </Box>

          <Box className="footer-link-column">
            <Typography component="h3" className="footer-heading">{t("quickLinks")}</Typography>
            <NavLink to="/" exact className="footer-link">{t("home")}</NavLink>
            <NavLink to="/products" className="footer-link">{t("products")}</NavLink>
            <NavLink to="/products/ELECTRONICS" className="footer-link">{t("electronics")}</NavLink>
            <NavLink to="/products/FASHION" className="footer-link">{t("fashion")}</NavLink>
            <NavLink to="/products/BEAUTY" className="footer-link">{t("beautyHealth")}</NavLink>
          </Box>

          <Box className="footer-link-column">
            <Typography component="h3" className="footer-heading">{t("customerCare")}</Typography>
            <NavLink to="/profile" className="footer-link">{t("myAccount")}</NavLink>
            <NavLink to="/orders" className="footer-link">{t("orderHistory")}</NavLink>
            <NavLink to="/help" className="footer-link">{t("help")}</NavLink>
          </Box>

          <Box className="footer-contact-column">
            <Typography component="h3" className="footer-heading">{t("contactUs")}</Typography>
            <a className="footer-contact" href="mailto:support@fenzo.uz">
              <EmailOutlinedIcon aria-hidden="true" />
              <span><small>Email</small>support@fenzo.uz</span>
            </a>
            <a className="footer-contact" href="tel:+821047799495">
              <PhoneOutlinedIcon aria-hidden="true" />
              <span><small>Phone</small>+82 10-4779-9495</span>
            </a>
            <div className="footer-contact">
              <LocationOnOutlinedIcon aria-hidden="true" />
              <span><small>Location</small>Seoul, South Korea</span>
            </div>
          </Box>
        </Box>

        <Box className="footer-bottom">
          <Typography>© {new Date().getFullYear()} FENZO. {t("allRightsReserved")}</Typography>
          <Box className="footer-bottom-meta" aria-label="Shopping benefits">
            <span>Secure checkout</span>
            <span>Curated picks</span>
            <span>Customer support</span>
          </Box>
        </Box>
      </Container>
    </footer>
  );
}
