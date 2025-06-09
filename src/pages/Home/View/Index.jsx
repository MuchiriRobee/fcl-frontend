import React from "react";
import { Box } from "@mui/material";
import HeroSection from "../HeroSection";
{/* import Offer1 from "../Offer1"; // Adjust the import path as necessary  */}
import ProductCategories from "../ProductCategories";
import SupplierQuoteRequest from "../SupplierQuoteRequest";
import NewsletterSubscription from "../../../components/NewsLetter";

function HomePage() {

return (
    <Box>
        <HeroSection />
       {/* <Offer1 /> */}
        <ProductCategories header={'Featured Products'}/>
        {/* <SupplierQuoteRequest /> */}
       {/* <Offer1 /> */}
        <ProductCategories header={'Office Products'}/>
        <NewsletterSubscription />
    </Box>
);
};
export default HomePage;