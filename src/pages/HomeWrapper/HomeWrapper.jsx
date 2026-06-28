import { useState, useEffect } from "react";

import HeroSection from "../../components/HeroSection/HeroSection";
import CategoriesSlider from "../../components/CategoriesSlider/CategoriesSlider";
import BrandSlider from "../../components/BrandSlider/BrandSlider";
import SawaSlider from "../../components/SawaSlider/SawaSlider";
import RecommendedSlider from "../../components/RecommendedSlider/RecommendedSlider";
import TopSection from "../../components/SawaSlider/TopSection";
import ShopLess from "../../components/ShopLess/ShopLess";
import Advertisement from "../../components/Advertisement/Advertisement";
import Laptop from "../../assets/image/Laptop.png";
import Swaw from "../../assets/image/Swaw.png";
import SAWADealsSlider from "../../components/SawaDealsSlider/SawaDealsSlider";
import PromoCard from "../../components/PromoCard/PromoCard";
import SawaDeails from "../../assets/image/DealsBackGround.png";
import { StillLifeJackets } from "../../assets/image";
import HeroGuideOverlay from "../../components/HeroSection/HeroGuideOverlay/HeroGuideOverlay";
import BackToTop from "../../components/BackToTop/BackToTop";
import axios from "axios";
import { environment } from "../../environments/environment";
import { useDispatch, useSelector } from "react-redux";
import { getGenralSegments } from "../../store/slices/genralStoresSlice";
import { useGetBestSellersProductsQuery } from "../../store/slices/productsSlice";
import useCart from "../../hooks/useCart";
import { useWishlist } from "../../hooks/useWishlist";
import { useViewProduct } from "../../context/ViewProductContext";
import "./HomeWrapper.css";
import { setSidebarOpen } from "../../store/slices/userSidebar";
import { useNavigate } from "react-router-dom";

const HomeWrapper = () => {
  const { addNewItemToCart } = useCart();
  const { getWishlist } = useWishlist();
  const { openViewProduct } = useViewProduct();
  const navigate = useNavigate();
  const backgroundColor = "#000";
  const textColor = "#FFF";

  const [newestProducts, setNewestProducts] = useState([]);
  const [topRateItems, setTopRateItems] = useState([]);
  const [topBrand, setTopBrand] = useState([]);

  const PromoCardDeails = {
    title: "SAWA",
    subtitle: "Today's Deals",
    tagline: "Sale on Everything",
    buttonText: "Shop Now",
    timerText: "12:32:00",
    backgroundColor: "rgb(234, 116, 118)",
    backgroundImage: SawaDeails,
  };

  const DealCards = [
    {
      id: 1,
      image: Swaw,
      imageAlt: "Home Accents",
      title: "Home Accents",
      description:
        "Redefine your home this year. Discover elegance in every detail",
      footerColor: "#E57373",
    },
    {
      id: 2,
      image: StillLifeJackets,
      imageAlt: "Fashion Collection",
      title: "Fashion Collection",
      description:
        "Start your year with a fresh look. Discover our latest premium fashion",
      footerColor: "#E57373",
    },
    {
      id: 3,
      image: Swaw,
      imageAlt: "Electronics",
      title: "Electronics",
      description: "Upgrade your tech game with the latest gadgets and devices",
      footerColor: "#E57373",
    },
  ];

  const dispatch = useDispatch();

  const { generalSegments = [] } = useSelector((state) => state.generalStores);

  const { data: bestSellers } = useGetBestSellersProductsQuery();

  useEffect(() => {
    dispatch(getGenralSegments());
  }, [dispatch]);

  useEffect(() => {
    getWishlist();
  }, []);

  const getNewestProducts = async () => {
    try {
      const response = await axios.get(
        `${environment.serverOrigin}products/skus?sort=timestamp&desc=true`,
        {
          headers: {
            Authorization: `Anonymous=${environment.appid}`,
          },
        },
      );
      setNewestProducts(response.data.items);
    } catch (err) {
      console.log("error when get the Newest Products:", err);
    }
  };

  const getTopRatedProduct = async () => {
    try {
      const response = await axios.get(
        `${environment.serverOrigin}products/skus?sort=properties.rating&desc=true`,
        {
          headers: {
            Authorization: `Anonymous=${environment.appid}`,
          },
        },
      );
      setTopRateItems(response.data.items);
    } catch (err) {
      console.log("error when get the Top Rated Products:", err);
    }
  };

  const getBrand = async () => {
    try {
      const response = await axios.get(
        `${environment.serverOrigin}brands?sort=properties.rating&desc=true`,
        {
          headers: {
            Authorization: `Anonymous=${environment.appid}`,
          },
        },
      );

      setTopBrand(response.data.items);
    } catch (err) {
      console.log("error when get the Top Brand:", err);
    }
  };

  useEffect(() => {
    getTopRatedProduct();
    getNewestProducts();
    getBrand();
  }, []);


  const FilterSegmentID = ()=>{
    console.log("goToSearch called with categoryId:", categoryId);
    const params = new URLSearchParams();
    if (categoryId) params.append("categoryId", categoryId);
    navigate(`/search?${params.toString()}`);

    setTimeout(() => {
      dispatch(setSidebarOpen(true));
    }, 500);
  }

  const goToSearch = (segmentId) => {
    const params = new URLSearchParams();
    if (segmentId) params.append("segmentId", segmentId);
    navigate(`/search?${params.toString()}`);

    setTimeout(() => {
      dispatch(setSidebarOpen(true));
    }, 500);
  };

  return (
    <div className="home-wrapper-segment-screen">
      <HeroGuideOverlay />
      <div className="home-container">
        <HeroSection />
        <CategoriesSlider
        goToSearch={goToSearch}
          categories={generalSegments}
          title="Sawa Categories"
        />
        <TopSection title="Best Seller" />
        <SawaSlider
          onAddToCart={addNewItemToCart}
          handleOpenViewProduct={openViewProduct}
          products={bestSellers}
          title="Best Seller"
        />
        <RecommendedSlider
          handleAddtoCart={addNewItemToCart}
          products={topRateItems}
          handleOpenViewProduct={openViewProduct}
        />
        <Advertisement  />
        <BrandSlider categories={topBrand} title="Top Brand" />
        <TopSection title="SAWA Deals" />
        <div className="sawa-deails-container">
          <PromoCard
            title={PromoCardDeails.title}
            subtitle={PromoCardDeails.subtitle}
            tagline={PromoCardDeails.tagline}
            buttonText={PromoCardDeails.buttonText}
            timerText={PromoCardDeails.timerText}
            backgroundColor={PromoCardDeails.backgroundColor}
            backgroundImage={PromoCardDeails.backgroundImage}
          />
          <SAWADealsSlider
            onPromoClick={() => console.log("Promo Card Clicked")}
            onDealClick={() => console.log(`Clicked`)}
            dealCards={DealCards}
          />
        </div>
        <ShopLess
          handleAddtoCart={addNewItemToCart}
          handleOpenViewProduct={openViewProduct}
          products={newestProducts}
          productsTwo={topRateItems}
        />
      </div>

      <BackToTop backgroundColor={backgroundColor} textColor={textColor} />
    </div>
  );
};

export default HomeWrapper;
