import { Route, Switch, useRouteMatch } from "react-router-dom";
import { Products } from "./Products";
import { ProductCard } from "./ProductCard";
import { NotFoundPage } from "../notFoundPage";

export function ProductsPage() {
  const products = useRouteMatch();

  return (
    <div className="productpage">
      <Switch>
        <Route exact path={`${products.path}/detail/:productId`}>
          <ProductCard />
        </Route>
        <Route exact path={products.path}>
          <Products />
        </Route>
        <Route exact path={`${products.path}/:collection`}>
          <Products />
        </Route>
        <Route component={NotFoundPage} />
      </Switch>
    </div>
  );
}
