import React from "react";
import { Container, Box, Typography, Button } from "@mui/material";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import { useHistory } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const events = [
  { id: 1, title: "The Outerwear Edit", desc: "Layer-ready pieces for a polished everyday look.", label: "Up to 40% off", meta: "Seasonal edit", img: "/img/winter-coat.webp", path: "/products/FASHION" },
  { id: 2, title: "Sneaker Spotlight", desc: "Fresh silhouettes and street-ready essentials.", label: "Trending now", meta: "Limited selection", img: "/img/Nike-sneakers.avif", path: "/products/FASHION" },
  { id: 3, title: "Quiet Luxury", desc: "Refined accessories that make every outfit feel intentional.", label: "Editor’s picks", meta: "Premium finds", img: "/img/classic-bag.webp", path: "/products/FASHION" },
  { id: 4, title: "Denim, Reworked", desc: "Easy layers and versatile everyday staples.", label: "New arrivals", meta: "Fresh this week", img: "/img/jacket.webp", path: "/products/FASHION" },
];

export function BigSales() {
  const history = useHistory();

  return (
    <section className="events-section">
      <Container maxWidth="xl">
        <div className="lp-section-head">
          <div>
            <span className="lp-section-eyebrow">Limited collections</span>
            <Typography className="lp-section-title">Stories worth exploring</Typography>
            <Typography className="lp-section-sub">
              Seasonal edits, standout pieces, and timely inspiration.
            </Typography>
          </div>
        </div>

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={3}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 4500, disableOnInteraction: false }}
          breakpoints={{
            0: { slidesPerView: 1.08, spaceBetween: 14 },
            680: { slidesPerView: 2 },
            1100: { slidesPerView: 3 },
          }}
          className="events-swiper"
        >
          {events.map((event) => (
            <SwiperSlide key={event.id}>
              <Box className="event-card" onClick={() => history.push(event.path)}>
                <div className="event-img-wrap">
                  <img src={event.img} alt={event.title} className="event-img" />
                  <span className="event-badge">{event.label}</span>
                  <span className="event-arrow"><ArrowOutwardRoundedIcon /></span>
                </div>
                <div className="event-body">
                  <Typography className="event-meta">{event.meta}</Typography>
                  <Typography className="event-title">{event.title}</Typography>
                  <Typography className="event-desc">{event.desc}</Typography>
                  <Button className="event-explore-btn" endIcon={<ArrowOutwardRoundedIcon />}>
                    Explore collection
                  </Button>
                </div>
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      </Container>
    </section>
  );
}
