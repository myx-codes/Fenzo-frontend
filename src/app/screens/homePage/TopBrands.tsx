import React from "react";
import { Container, Typography } from "@mui/material";

const brands = [
  "Adidas",
  "Nike",
  "Reebok",
  "Fila",
  "Zara",
  "H&M",
  "Uniqlo",
  "Calvin Klein",
  "Gucci",
  "Chanel",
  "Prada",
  "Dior",
];

export function TopBrands() {
  const brandLoop = [...brands, ...brands, ...brands];

  return (
    <section className="brands-section" aria-label="Featured brands">
      <Container maxWidth="xl">
        <div className="brands-intro">
          <span className="lp-section-eyebrow">Names you know</span>
          <Typography className="lp-section-title">Iconic brands, one destination</Typography>
        </div>
      </Container>

      <div className="brands-track-wrap">
        <div className="brands-track">
          {brandLoop.map((brand, index) => (
            <div key={`${brand}-${index}`} className="brand-slide">
              <span>{brand}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
