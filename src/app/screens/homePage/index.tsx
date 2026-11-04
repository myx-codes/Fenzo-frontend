import Statistics from "./Statistics";
import { FeaturedProducts } from "./FeaturedProducts";
import { TopBrands} from "./TopBrands";
import Advertisement from "./Advertisement";
import { TopSellers } from "./TopSellers";
import { BigSales } from "./BigSales";
import React , { useEffect } from "react";
import { BestProducts } from "./BestProducts";
import HomeHero from "./HomeHero";

import { useDispatch} from "react-redux";
import { setBestProducts, setFeaturedProducts, setTopSellers } from "./slice";
import { Product } from "../../../lib/types/product";
import ProductService from "../../services/ProductService";
import UserService from "../../services/UserService";
import { User } from "../../../lib/types/user";


export default function HomePage() {
  const dispatch = useDispatch();
  

  // selector: store => data
  
  useEffect(() => {
    // backend server data fetch => data
    const product = new ProductService();
    product.getProducts({
      page:1,
      limit:12,
      order: "createdAt",
    })
    .then((data: Product[]) => { dispatch(setFeaturedProducts(data)); })
    .catch((err) => console.log("error", err));

    product.getProducts({
    page:1,
    limit:12,
    order: "productViews",
    })
    .then((data: Product[]) => { dispatch(setBestProducts(data)); })
    .catch((err) => console.log("error", err))

    const user = new UserService();
    user
    .getTopSellers()
    .then((data: User[]) => { dispatch(setTopSellers(data)); })
    .catch((err) => console.log(err))

  }, [dispatch])



  return <div className="homepage">
    <HomeHero/>
    <Statistics/>
    <FeaturedProducts/>
    <Advertisement/>
    <TopBrands/>
    <BestProducts />
    <TopSellers/>
    <BigSales/>
  </div>;
}
