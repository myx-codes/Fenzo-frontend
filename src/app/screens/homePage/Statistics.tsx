import React from "react";
import { Container, Box, Typography } from "@mui/material";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import TravelExploreOutlinedIcon from "@mui/icons-material/TravelExploreOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";

const benefits = [
  {
    title: "Trusted stores",
    desc: "Shop from verified FENZO sellers",
    icon: <VerifiedUserOutlinedIcon />,
  },
  {
    title: "Fast discovery",
    desc: "Find the right product without the clutter",
    icon: <BoltOutlinedIcon />,
  },
  {
    title: "Curated variety",
    desc: "Fresh picks across every lifestyle category",
    icon: <TravelExploreOutlinedIcon />,
  },
  {
    title: "Here to help",
    desc: "Simple support whenever you need it",
    icon: <SupportAgentOutlinedIcon />,
  },
];

export default function Statistics() {
  return (
    <section className="stats-section" aria-label="Why shop with FENZO">
      <Container maxWidth="xl">
        <div className="stats-grid">
          {benefits.map((benefit) => (
            <Box key={benefit.title} className="stat-card">
              <div className="stat-icon-wrap">{benefit.icon}</div>
              <div>
                <Typography className="stat-label">{benefit.title}</Typography>
                <Typography className="stat-desc">{benefit.desc}</Typography>
              </div>
            </Box>
          ))}
        </div>
      </Container>
    </section>
  );
}
