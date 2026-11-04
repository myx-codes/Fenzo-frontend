import CheckroomOutlinedIcon from "@mui/icons-material/CheckroomOutlined";
import SpaOutlinedIcon from "@mui/icons-material/SpaOutlined";
import DevicesOutlinedIcon from "@mui/icons-material/DevicesOutlined";
import ShoppingBasketOutlinedIcon from "@mui/icons-material/ShoppingBasketOutlined";
import { ProductCollection } from "../../../lib/enums/product.enums";

// Shared by desktop, tablet and mobile. Keep collection IDs as the route source.
export const categoryGroups = [
  {
    id: "style", label: "Fashion & style", Icon: CheckroomOutlinedIcon,
    items: [
      { label: "Fashion", collection: ProductCollection.FASHION },
      { label: "Women’s Clothing", collection: ProductCollection.WOMEN_CLOTHING },
      { label: "Men’s Clothing", collection: ProductCollection.MEN_CLOTHING },
      { label: "Shoes", collection: ProductCollection.SHOES },
      { label: "Bags & Accessories", collection: ProductCollection.BAGS_ACCESSORIES },
      { label: "Clothing", collection: ProductCollection.CLOTHING },
    ],
  },
  {
    id: "care", label: "Beauty & wellness", Icon: SpaOutlinedIcon,
    items: [
      { label: "Beauty", collection: ProductCollection.BEAUTY },
      { label: "Skin Care", collection: ProductCollection.SKIN_CARE },
      { label: "Makeup", collection: ProductCollection.MAKEUP },
      { label: "Perfume", collection: ProductCollection.PARFUM },
      { label: "Cosmetics", collection: ProductCollection.COSMETICS },
      { label: "Body Care", collection: ProductCollection.BODY_CARE },
      { label: "Health", collection: ProductCollection.HEALTH },
      { label: "Vitamins", collection: ProductCollection.VITAMINS },
    ],
  },
  {
    id: "home", label: "Tech & home", Icon: DevicesOutlinedIcon,
    items: [
      { label: "Electronics", collection: ProductCollection.ELECTRONICS },
      { label: "Computers", collection: ProductCollection.COMPUTERS },
      { label: "Mobile Accessories", collection: ProductCollection.MOBILE_ACCESSORIES },
      { label: "Home & Kitchen", collection: ProductCollection.HOME_KITCHEN },
      { label: "Living", collection: ProductCollection.LIVING },
      { label: "Automotive", collection: ProductCollection.AUTOMOTIVE },
    ],
  },
  {
    id: "everyday", label: "Everyday & family", Icon: ShoppingBasketOutlinedIcon,
    items: [
      { label: "Food & Grocery", collection: ProductCollection.FOOD },
      { label: "Daily Essentials", collection: ProductCollection.DAILY_ESSENTIALS },
      { label: "Kids", collection: ProductCollection.KIDS },
      { label: "Baby", collection: ProductCollection.BABY },
      { label: "Toys", collection: ProductCollection.TOYS },
      { label: "Sports & Outdoors", collection: ProductCollection.SPORTS_OUTDOORS },
      { label: "Pet Supplies", collection: ProductCollection.PET_SUPPLIES },
      { label: "Books & Stationery", collection: ProductCollection.BOOKS_STATIONERY },
    ],
  },
];

export const quickCategories = [
  { label: "Fashion", collection: ProductCollection.FASHION },
  { label: "Electronics", collection: ProductCollection.ELECTRONICS },
  { label: "Beauty", collection: ProductCollection.BEAUTY },
  { label: "Home & Kitchen", collection: ProductCollection.HOME_KITCHEN },
  { label: "Food", collection: ProductCollection.FOOD },
];
