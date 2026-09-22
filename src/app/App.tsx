import React, { useEffect, useLayoutEffect } from "react";
import { Route, Switch, useLocation } from "react-router-dom";
import HomePage from "./screens/homePage";
import { ProductsPage } from "./screens/productsPage";
import { OrdersPage } from "./screens/ordersPage";
import { HelpPage } from "./screens/helpPage";
import { MyPage } from "./screens/myPage";
import CheckoutPage from "./screens/checkoutPage/CheckoutPage";
import { Login, Signup } from "./components/Auth";
import { HomeNavbar } from "./components/headers/HomeNavbar";
import { OtherNavbar } from "./components/headers/OtherNavbar";
import { MobileHeader } from "./components/headers/MobileHeader";
import { MobileBottomNav } from "./components/headers/MobileBottomNav";
import { Footer } from "./components/footer";
import ContextProvider from "./context/ProviderContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { SellerPage } from "./screens/sellerPage/SellerPage";
import { SocketProvider } from "./context/SocketContext";
import { useDeviceType } from "./hooks/useDeviceType";
import { Seo } from "./components/Seo";
import { NotFoundPage } from "./screens/notFoundPage";
import "../css/app.css";
import "../css/navbar.css";
import "../css/footer.css";
import "../css/home.css";
import "../css/products.css";
import "../css/mypage.css";
import "../css/basket.css";
import "../css/seller.css";
import "../css/order.css";
import "../css/mobile-layout.css";
import "../css/help.css";
import "../css/check-out.css";
import "../css/coupang.css";

function App() {
  const location = useLocation();
  const { isTouchLayout } = useDeviceType();
  const normalizedPath = location.pathname.length > 1
    ? location.pathname.replace(/\/+$/, "")
    : location.pathname;

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.key, location.pathname, location.search, location.hash]);

  const isAuthRoute = normalizedPath === "/login" || normalizedPath === "/signup";
  const showMobileShell = isTouchLayout && !isAuthRoute;
  const showMobileBottomNav = isTouchLayout && !isAuthRoute;
  const showFooter = !isTouchLayout && !isAuthRoute;

  const seoConfig = getSeoConfig(normalizedPath);

  return (
    <ContextProvider>
      <CartProvider>
        <SocketProvider>
        <WishlistProvider>
        <Seo {...seoConfig} />
        {isAuthRoute ? null : showMobileShell ? (
          <MobileHeader />
        ) : (
          normalizedPath === "/" ? <HomeNavbar /> : <OtherNavbar />
        )}

        <div className={`${showMobileShell ? "mobile-layout-content" : ""} app-route-content ${isAuthRoute ? "auth-route-content" : ""}`.trim()}>
          <Switch>
            <Route path="/products" component={ProductsPage} />
            <Route exact path="/orders" component={OrdersPage} />
            <Route exact path="/help" component={HelpPage} />
            <Route exact path="/profile" component={MyPage} />
            <Route exact path="/checkout" component={CheckoutPage} />
            <Route exact path="/user/seller/:id" component={SellerPage} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/signup" component={Signup} />
            <Route exact path="/" component={HomePage} />
            <Route component={NotFoundPage} />
          </Switch>
        </div>

        {showFooter && <Footer />}
        {showMobileBottomNav && <MobileBottomNav />}
        </WishlistProvider>
        </SocketProvider>
      </CartProvider>
    </ContextProvider>
  );
}

export default App;

function getSeoConfig(pathname: string) {
  const siteName = "FENZO";
  const baseDescription =
    "FENZO is an online shopping platform for electronics, fashion, beauty, home essentials, and daily shopping.";

  if (pathname === "/") {
    return {
      title: `${siteName} | Online Market`,
      description: baseDescription,
    };
  }

  if (pathname.startsWith("/products")) {
    return {
      title: `${siteName} | Products`,
      description: "Browse FENZO products by category.",
    };
  }

  if (pathname === "/orders") {
    return {
      title: `${siteName} | Orders`,
      description: "View your order history, delivery status, and purchase details on FENZO.",
      noIndex: true,
    };
  }

  if (pathname === "/help") {
    return {
      title: `${siteName} | Help Center`,
      description: "Find answers to common questions or contact FENZO support.",
    };
  }

  if (pathname === "/profile") {
    return {
      title: `${siteName} | My Profile`,
      description: "Manage your account details, addresses, and preferences on FENZO.",
      noIndex: true,
    };
  }

  if (pathname === "/checkout") {
    return {
      title: `${siteName} | Checkout`,
      description: "Complete your purchase securely with FENZO checkout.",
      noIndex: true,
    };
  }

  if (pathname.startsWith("/user/seller/")) {
    return {
      title: `${siteName} | Seller Profile`,
      description: "Explore seller information and products available on FENZO.",
    };
  }

  if (pathname === "/login") {
    return {
      title: `${siteName} | Login`,
      description: "Sign in to your FENZO account.",
      noIndex: true,
    };
  }

  if (pathname === "/signup") {
    return {
      title: `${siteName} | Sign Up`,
      description: "Create your FENZO account to start shopping.",
      noIndex: true,
    };
  }

  return {
    title: siteName,
    description: baseDescription,
  };
}
