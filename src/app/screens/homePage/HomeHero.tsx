import React from "react";
import { NavLink } from "react-router-dom";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

export default function HomeHero() {
  return <section className="signal-hero" aria-labelledby="home-hero-title">
    <div className="signal-hero-copy">
      <p className="signal-eyebrow">The everyday edit</p>
      <h1 id="home-hero-title">Good finds.<br />Better everyday.</h1>
      <p className="signal-hero-description">Search fast, compare clearly, and shop trusted sellers across fashion, electronics, beauty, home, and food.</p>
      <div className="signal-hero-actions">
        <NavLink to="/products" className="signal-primary-link">Explore products <ArrowForwardRoundedIcon /></NavLink>
        <NavLink to="/products/FASHION" className="signal-text-link">Shop fashion</NavLink>
      </div>
    </div>
    <NavLink to="/products/ELECTRONICS" className="signal-hero-image" aria-label="Explore electronics and everyday essentials">
      <img src="/img/signal-campaign.webp" alt="An editorial collection of everyday technology, fragrance, and style essentials" />
    </NavLink>
  </section>;
}
