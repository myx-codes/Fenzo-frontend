import React from "react";
import { Container, Typography, Avatar, Button } from "@mui/material";
import { Link } from "react-router-dom";
import { createSelector } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { retrieveTopSellers } from "./selector";
import { serverApi } from "../../../lib/config";
import { User } from "../../../lib/types/user";
import { useDeviceType } from "../../hooks/useDeviceType";

const topSellerRetriever = createSelector(
  retrieveTopSellers,
  (topSellers) => ({ topSellers })
);

export function TopSellers() {
  const { topSellers } = useSelector(topSellerRetriever);
  const { isTouchLayout } = useDeviceType();
  const list = Array.isArray(topSellers) ? topSellers : [];

  return (
    <div className="sellers-section">
      <Container maxWidth="xl">
        <div className="lp-section-head">
          <div>
            <span className="lp-section-eyebrow">Meet the sellers</span>
            <Typography className="lp-section-title">Explore independent stores</Typography>
            <Typography className="lp-section-sub">
              Browse products from independent FENZO sellers.
            </Typography>
          </div>
        </div>

        <div className={isTouchLayout ? "sellers-scroll" : "sellers-grid"}>
          {list.map((seller: User) => {
            const imagePath = `${serverApi}/${seller.userImage}`;
            const sellerId = seller._id || (seller as any).userId;
            if (!sellerId) return null;
            return (
              <div key={String(sellerId)} className="seller-card">
                <div className="seller-avatar-wrap">
                  <Avatar
                    src={seller.userImage ? imagePath : undefined}
                    alt={seller.userNick}
                    className="seller-avatar"
                  >
                    {(seller.userNick || "F").charAt(0).toUpperCase()}
                  </Avatar>
                </div>
                <Typography className="seller-name">
                  {seller.userNick}
                </Typography>
                <Typography className="seller-caption">FENZO seller</Typography>
                <Button
                  component={Link}
                  to={`/user/seller/${sellerId}`}
                  className="visit-btn"
                >
                  Visit Store
                </Button>
              </div>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
