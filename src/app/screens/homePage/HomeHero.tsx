import React from "react";
import { Box, Button, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { useHistory } from "react-router-dom";

export default function HomeHero() {
  const history = useHistory();

  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <div className="hero-shell">
        <Box className="hero-copy">
          <div className="hero-kicker">
            <AutoAwesomeRoundedIcon />
            FENZO market
          </div>

          <Typography component="h1" id="home-hero-title" className="hero-title">
            Curated products,
            <span> easy shopping.</span>
          </Typography>

          <Typography component="p" className="hero-subtitle">
            Search fast, compare clearly, and shop trusted sellers across
            fashion, electronics, beauty, health, kids, and daily essentials.
          </Typography>

          <Box className="hero-actions">
            <Button
              className="hero-btn"
              endIcon={<ArrowForwardRoundedIcon />}
              onClick={() => history.push("/products/FASHION")}
            >
              Shop fashion
            </Button>
            <Button
              className="hero-btn-secondary"
              onClick={() => history.push("/products/FASHION")}
            >
              Fashion
            </Button>
          </Box>

          <div className="hero-proof" aria-label="Shopping benefits">
            <span><CheckCircleRoundedIcon /> Fast local delivery</span>
            <span><CheckCircleRoundedIcon /> Secure checkout</span>
            <span><CheckCircleRoundedIcon /> Real shopper reviews</span>
          </div>
        </Box>

        <div className="hero-visual" aria-label="Season sale collection">
          <div className="hero-visual-main">
            <img src="/img/sale.jpg" alt="Season sale shopping bags" />
            <div className="hero-visual-gradient" />
            <div className="hero-sale-badge">
              <span>Season edit</span>
              <strong>Up to 70% off</strong>
            </div>
          </div>

          <button
            type="button"
            className="hero-floating-card hero-floating-card--top"
            onClick={() => history.push("/products/ELECTRONICS")}
          >
            <img src="/img/bannerImage.jpg" alt="Electronics collection" />
            <span>
              <small>Daily deal</small>
              Smart essentials
            </span>
            <ArrowForwardRoundedIcon />
          </button>

          <div className="hero-floating-card hero-floating-card--bottom">
            <span className="hero-rating">4.9</span>
            <span>
              <strong>Trusted market</strong>
              <small>Clear prices, quick checkout</small>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
