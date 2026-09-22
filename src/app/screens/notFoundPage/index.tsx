import React from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import ExploreRoundedIcon from "@mui/icons-material/ExploreRounded";
import { useHistory } from "react-router-dom";

export function NotFoundPage() {
  const history = useHistory();

  return (
    <main className="not-found-page">
      <Container maxWidth="md" className="not-found-container">
        <Box className="not-found-visual" aria-hidden="true">
          <span>4</span>
          <Box className="not-found-orbit"><ExploreRoundedIcon /></Box>
          <span>4</span>
        </Box>
        <Typography className="not-found-kicker">Lost between products?</Typography>
        <Typography component="h1" className="not-found-title">
          This page is out of stock.
        </Typography>
        <Typography className="not-found-copy">
          The link may be outdated, or the page may have moved. Let’s get you back to something worth discovering.
        </Typography>
        <Box className="not-found-actions">
          <Button
            variant="contained"
            startIcon={<StorefrontRoundedIcon />}
            onClick={() => history.push("/products")}
          >
            Explore products
          </Button>
          <Button
            variant="outlined"
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => history.goBack()}
          >
            Go back
          </Button>
        </Box>
      </Container>
    </main>
  );
}
