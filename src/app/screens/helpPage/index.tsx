import React, { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useHistory } from "react-router-dom";

const faqData = [
  {
    id: "orders",
    question: "Where can I see my orders?",
    answer:
      "Sign in and open My Orders from your account or the mobile navigation. Each order shows its products, total, date, and current status.",
  },
  {
    id: "cancel",
    question: "Can I cancel an order?",
    answer:
      "If an order is still eligible for cancellation, a Cancel button appears beside it. Completed, shipped, or already cancelled orders cannot be changed from the account page.",
  },
  {
    id: "discover",
    question: "How do I find a specific product?",
    answer:
      "Use the search field in the header or browse by category. Product filters and sorting can help narrow the catalog further.",
  },
  {
    id: "wishlist",
    question: "How does the wishlist work?",
    answer:
      "When you are signed in, select the heart on any product. Your saved products appear in the Wishlist tab of your account.",
  },
  {
    id: "reviews",
    question: "Who can leave a product review?",
    answer:
      "Signed-in shoppers can rate a product from one to five stars and add a comment on its detail page. Submitting again updates your existing review.",
  },
  {
    id: "profile",
    question: "How do I update my profile or address?",
    answer:
      "Open Personal Info or Address in My Account. You can update your details, password, description, delivery address, and profile photo there.",
  },
];

const topics = [
  { icon: <ShoppingBagOutlinedIcon />, title: "Shopping", copy: "Search, categories, product details" },
  { icon: <ReceiptLongOutlinedIcon />, title: "Orders", copy: "Status, items, and cancellation" },
  { icon: <FavoriteBorderRoundedIcon />, title: "Your account", copy: "Wishlist, profile, and address" },
  { icon: <RateReviewOutlinedIcon />, title: "Reviews", copy: "Ratings and product feedback" },
];

export function HelpPage() {
  const history = useHistory();
  const [expanded, setExpanded] = useState<string | false>(false);
  const [searchTerm, setSearchTerm] = useState("");

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredFaqs = faqData.filter(
    (faq) =>
      !normalizedSearch ||
      faq.question.toLowerCase().includes(normalizedSearch) ||
      faq.answer.toLowerCase().includes(normalizedSearch),
  );

  return (
    <main className="help-page">
      <Container maxWidth="xl" className="help-container">
        <Box className="help-hero">
          <Stack spacing={2} alignItems="center">
            <Typography className="help-kicker">FENZO Help Center</Typography>
            <Typography component="h1" className="help-title">
              How can we help?
            </Typography>
            <Typography className="help-subtitle">
              Find clear answers about shopping, orders, your account, and product reviews.
            </Typography>
            <TextField
              fullWidth
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search the help center"
              className="help-search"
              inputProps={{ "aria-label": "Search help articles" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon className="help-search-icon" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm ? (
                  <InputAdornment position="end">
                    <IconButton aria-label="Clear search" size="small" onClick={() => setSearchTerm("")}>
                      <CloseRoundedIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              }}
            />
          </Stack>
        </Box>

        <Grid container spacing={2} className="help-topic-grid">
          {topics.map((topic) => (
            <Grid key={topic.title} size={{ xs: 6, md: 3 }}>
              <Paper className="help-topic-card" elevation={0}>
                <Box className="help-topic-icon">{topic.icon}</Box>
                <Typography className="help-topic-title">{topic.title}</Typography>
                <Typography className="help-topic-copy">{topic.copy}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box className="help-faq-section">
          <Box className="help-section-head">
            <Box>
              <Typography className="help-section-eyebrow">Quick answers</Typography>
              <Typography className="help-section-title">Frequently asked questions</Typography>
            </Box>
            <Typography className="help-result-count">
              {filteredFaqs.length} {filteredFaqs.length === 1 ? "answer" : "answers"}
            </Typography>
          </Box>

          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => (
              <Accordion
                key={faq.id}
                expanded={expanded === faq.id}
                onChange={(_event, isExpanded) => setExpanded(isExpanded ? faq.id : false)}
                className="help-accordion"
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreRoundedIcon className="help-expand-icon" />}
                  aria-controls={`${faq.id}-content`}
                  id={`${faq.id}-header`}
                  className="help-accordion-summary"
                >
                  <Typography className="help-question-index">{String(index + 1).padStart(2, "0")}</Typography>
                  <Typography className="help-question">{faq.question}</Typography>
                </AccordionSummary>
                <AccordionDetails className="help-accordion-details">
                  <Typography className="help-answer">{faq.answer}</Typography>
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Box className="help-no-result">
              <SearchRoundedIcon />
              <Typography className="help-no-result-title">No matching answers</Typography>
              <Typography>Try a shorter keyword or contact our support team below.</Typography>
              <Button onClick={() => setSearchTerm("")}>Clear search</Button>
            </Box>
          )}
        </Box>

        <Box className="help-contact-section">
          <Box className="help-contact-copy">
            <Typography className="help-section-eyebrow">Human support</Typography>
            <Typography className="help-section-title">Still need a hand?</Typography>
            <Typography>
              Reach us directly, or open your order history for the fastest route to the right details.
            </Typography>
          </Box>
          <Grid container spacing={2.5} className="help-contact-grid">
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper className="help-card" elevation={0}>
                <SupportAgentRoundedIcon className="help-card-icon" />
                <Typography className="help-card-title">Call support</Typography>
                <Typography className="help-card-text">Available for account and order questions.</Typography>
                <Button component="a" href="tel:+821047799495" className="help-card-btn" fullWidth>
                  +82 10 4779 9495
                </Button>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper className="help-card" elevation={0}>
                <EmailOutlinedIcon className="help-card-icon" />
                <Typography className="help-card-title">Email us</Typography>
                <Typography className="help-card-text">Send details and we’ll respond as soon as possible.</Typography>
                <Button component="a" href="mailto:support@fenzo.uz" className="help-card-btn" fullWidth>
                  support@fenzo.uz
                </Button>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper className="help-card help-card--accent" elevation={0}>
                <ReceiptLongOutlinedIcon className="help-card-icon" />
                <Typography className="help-card-title">Your orders</Typography>
                <Typography className="help-card-text">Review product details and the latest order status.</Typography>
                <Button
                  className="help-main-btn"
                  endIcon={<ArrowForwardRoundedIcon />}
                  onClick={() => history.push("/orders")}
                  fullWidth
                >
                  Open orders
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </main>
  );
}
