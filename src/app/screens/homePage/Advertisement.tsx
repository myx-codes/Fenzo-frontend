import React from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useHistory } from "react-router-dom";

export default function Advertisement() {
  const history = useHistory();

  return (
    <section className="ad-section">
      <Container maxWidth="xl">
        <div className="ad-frame">
          <video className="ad-video" autoPlay loop muted playsInline>
            <source src="/video/apple-watch-h264.mp4" type="video/mp4" />
          </video>
          <div className="ad-overlay" />

          <Box className="ad-content">
            <span className="ad-eyebrow">The tech edit</span>
            <Typography component="h2" className="ad-title">
              Smarter essentials.
              <br />Made for every day.
            </Typography>
            <Typography className="ad-subtitle">
              Discover refined devices and practical accessories selected for
              the way you live now.
            </Typography>
            <Box className="ad-actions">
              <Button
                className="ad-btn-primary"
                endIcon={<ArrowForwardRoundedIcon />}
                onClick={() => history.push("/products/ELECTRONICS")}
              >
                Explore electronics
              </Button>
            </Box>
          </Box>

          <div className="ad-note">
            <span>Curated by FENZO</span>
            <strong>Design. Utility. Value.</strong>
          </div>
        </div>
      </Container>
    </section>
  );
}
