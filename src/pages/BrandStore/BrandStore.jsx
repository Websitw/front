import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./BrandStore.css";
import BrandHeroVideo from './BrandHeroVideo/BrandHeroVideo';
import BrandTape from "./BrandTape/BrandTape";
import BrandStoreSlider from "./BrandStoreSlider/BrandStoreSlider";
import BrandMediaRail from "./BrandMediaRail";
import BrandFavoriteSection from "./BrandFavoriteSection";
import BrandCompactRailSection from "./BrandCompactRailSection";
import BrandDealsSection from "./BrandDealsSection";
import BrandAllBrandsSection from "./BrandAllBrandsSection";
import SectionTitle from './SectionTitle/SectionTitle';
import HeroGuideOverlay from '../../components/HeroSection/HeroGuideOverlay/HeroGuideOverlay'
import video1 from "../../assets/videos/HeroSection.mp4";
import video2 from "../../assets/videos/video_2.mp4";
import BackToTop from '../../components/BackToTop/BackToTop'
import axios from 'axios';
import { environment } from '../../environments/environment'
import useLocalStorage from "../../hooks/useLocalStorage";
import { hasPromoOffer } from "./brandStoreContent";
const videos = [video1, video2];
const TOP_BRAND_SECTION_SIZE = 8;
const SHOWCASE_SECTION_SIZE = 8;
const ALL_BRAND_DISPLAY_GROUPS = [
    { key: "jewelry_accessories", name_i18n: { en: "Jewelry & Accessories", ar: "المجوهرات والإكسسوارات" } },
    { key: "women_fashion", name_i18n: { en: "Women Fashion", ar: "أزياء نسائية" } },
];

const compareBrands = (left, right) => (
    Number(right?.rating || 0) - Number(left?.rating || 0)
    || Number(right?.ratingCount || 0) - Number(left?.ratingCount || 0)
    || String(left?.brandName || "").localeCompare(String(right?.brandName || ""))
);

const takeUniqueBrands = (items = [], limit = Infinity) => {
    const seen = new Set();
    const result = [];

    for (const item of items) {
        if (!item?.id || seen.has(item.id)) {
            continue;
        }

        seen.add(item.id);
        result.push(item);

        if (result.length >= limit) {
            break;
        }
    }

    return result;
};

const fillBrandRail = (primary = [], fallback = [], limit = Infinity) => (
    takeUniqueBrands([...primary, ...fallback], limit)
);

const prioritizeByLanding = (landingById) => (left, right) => (
    Number(Boolean(landingById[right?.id])) - Number(Boolean(landingById[left?.id]))
    || compareBrands(left, right)
);

const BrandStore = () => {

    const [brand, setBrand] = useState([]);
    const [brandLandingById, setBrandLandingById] = useState({});
    const [brandDiscoveryCategories, setBrandDiscoveryCategories] = useState([]);
    const [userData] = useLocalStorage("userData", null);
    const [activeIndex, setActiveIndex] = useState(0);

    const getBrands = useCallback(async () => {
        try {
            const params = new URLSearchParams();

            if (userData?.id) {
                params.set("userId", userData.id);
            }

            const brandsUrl = `${environment.serverOrigin}brands${params.toString() ? `?${params.toString()}` : ""}`;
            const [brandsResponse, brandLandingResponse, brandCategoryResponse] = await Promise.all([
                axios.get(brandsUrl, {
                    headers: {
                        Authorization: `Anonymous=${environment.appid}`,
                    },
                }),
                axios.get(`${environment.serverOrigin}brand-landing?limit=100`, {
                    headers: {
                        Authorization: `Anonymous=${environment.appid}`,
                    },
                }),
                axios.get(`${environment.serverOrigin}brands/discovery-categories?limit=50&view=brand-result`, {
                    headers: {
                        Authorization: `Anonymous=${environment.appid}`,
                    },
                }),
            ]);

            const brandItems = Array.isArray(brandsResponse?.data?.items)
                ? brandsResponse.data.items
                : [];
            const brandLandingItems = Array.isArray(brandLandingResponse?.data?.items)
                ? brandLandingResponse.data.items
                : [];
            const brandCategoryItems = Array.isArray(brandCategoryResponse?.data?.items)
                ? brandCategoryResponse.data.items
                : [];

            setBrand(brandItems);
            setBrandDiscoveryCategories(brandCategoryItems);
            setBrandLandingById(
                brandLandingItems.reduce((accumulator, item) => {
                    if (item?.brandId) {
                        accumulator[item.brandId] = item;
                    }
                    return accumulator;
                }, {}),
            );
        } catch (err) {
            console.log('error when get the  Brands ,', err);

        }
    }, [userData?.id]);

    useEffect(() => {
        getBrands()

    }, [getBrands])

    useEffect(() => {
        if (!brand.length || activeIndex < brand.length) {
            return;
        }

        setActiveIndex(0);
    }, [activeIndex, brand.length]);

    const backgroundColor = "#FFF"
    const textColor = "#000"

    const handleVideoEnd = useCallback(() => {
        if (brand.length <= 1) {
            return;
        }

        setActiveIndex((prev) => (prev + 1) % brand.length);
    }, [brand.length]);

    const currentBrand = useMemo(
        () => brand[activeIndex] ?? brand[0] ?? null,
        [activeIndex, brand],
    );

    const prioritizedBrands = useMemo(
        () => [...brand].sort(prioritizeByLanding(brandLandingById)),
        [brand, brandLandingById],
    );

    const topBrandStores = useMemo(
        () => takeUniqueBrands(prioritizedBrands, TOP_BRAND_SECTION_SIZE),
        [prioritizedBrands],
    );

    const brandById = useMemo(
        () => brand.reduce((accumulator, item) => {
            accumulator[item.id] = item;
            return accumulator;
        }, {}),
        [brand],
    );

    const allBrandGroups = useMemo(
        () => brandDiscoveryCategories.map((category) => ({
            ...category,
            brands: (category.brands || [])
                .map((categoryBrand) => brandById[categoryBrand.id] || categoryBrand)
                .filter(Boolean),
        })).filter((category) => category.brands?.length),
        [brandById, brandDiscoveryCategories],
    );

    const favoriteStores = useMemo(() => {
        const favorites = brand.filter((item) => item?.isFavorite);

        if (favorites.length) {
            return fillBrandRail(
                favorites.sort(compareBrands),
                prioritizedBrands,
                SHOWCASE_SECTION_SIZE,
            );
        }

        return fillBrandRail(
            [...brand].sort((left, right) => (
                Number(Boolean(brandLandingById[right?.id])) - Number(Boolean(brandLandingById[left?.id]))
                || Number(right?.ratingCount || 0) - Number(left?.ratingCount || 0)
                || compareBrands(left, right)
            )),
            prioritizedBrands,
            SHOWCASE_SECTION_SIZE,
        );
    }, [brand, brandLandingById, prioritizedBrands]);

    const recommendedStores = useMemo(() => {
        return takeUniqueBrands(
            [...brand].sort((left, right) => (
                Number(Boolean(brandLandingById[right?.id]?.promoBanner)) - Number(Boolean(brandLandingById[left?.id]?.promoBanner))
                || Number(Boolean(brandLandingById[right?.id])) - Number(Boolean(brandLandingById[left?.id]))
                || Number(right?.ratingCount || 0) - Number(left?.ratingCount || 0)
                || compareBrands(left, right)
            )),
            SHOWCASE_SECTION_SIZE,
        );
    }, [brand, brandLandingById]);

    const dealStores = useMemo(() => {
        const liveDeals = brand
            .filter((item) => hasPromoOffer(brandLandingById[item.id]))
            .sort(prioritizeByLanding(brandLandingById));

        const promoBannerBrands = brand
            .filter((item) => brandLandingById[item.id]?.promoBanner)
            .sort(prioritizeByLanding(brandLandingById));

        if (liveDeals.length) {
            return fillBrandRail(
                liveDeals,
                promoBannerBrands,
                SHOWCASE_SECTION_SIZE,
            );
        }

        return fillBrandRail(
            promoBannerBrands,
            prioritizedBrands,
            SHOWCASE_SECTION_SIZE,
        );
    }, [brand, brandLandingById, prioritizedBrands]);

    const brandVideo = currentBrand?.mediaList?.find(media => media.type === "VIDEO");
    const fallbackVideo = videos[activeIndex % videos.length];
    const handleSelectBrand = useCallback((selectedBrand) => {
        const selectedIndex = brand.findIndex((item) => item.id === selectedBrand.id);
        if (selectedIndex >= 0) {
            setActiveIndex(selectedIndex);
        }
    }, [brand]);

    return (
        <>
            <HeroGuideOverlay />
            <div className="brand-store-container">
                <div className="brand-store-stage">
                    <BrandHeroVideo
                     videoSrc={fallbackVideo}
                     onVideoEnd={handleVideoEnd}
                     rating={currentBrand?.rating || 0}
                     ratingCount={currentBrand?.ratingCount || 0}
                     brandDescription={currentBrand?.brandDescription_i18n?.en || currentBrand?.brandDescription}
                     brandName={currentBrand?.brandName}
                     brandId = {currentBrand?.id}
                     brandVideoId={brandVideo?.mediaId}
                     currentBrand={currentBrand}
                     getBrands={getBrands}
                    />

                    <BrandTape
                        brands={brand}
                        activeIndex={activeIndex}
                        setActiveIndex={setActiveIndex}
                    />
                </div>

                <section
                    className="brand-store-slider-section"
                    data-brand-section="whats-new"
                    aria-label="New registered brands"
                >
                    <SectionTitle title="What is a new" />
                    <BrandStoreSlider
                        brand={brand}
                        activeIndex={activeIndex}
                        setActiveIndex={setActiveIndex}
                    />
                </section>

                {topBrandStores.length ? (
                    <section
                        className="brand-store-merch-section"
                        data-brand-section="top-brand-store"
                        aria-label="Top Brand Store"
                    >
                        <div className="brand-store-section__header">
                            <h2 className="section-title">Top Brand Store</h2>
                        </div>
                        <BrandMediaRail
                            brands={topBrandStores}
                            landingById={brandLandingById}
                            activeBrandId={currentBrand?.id || ""}
                            onSelectBrand={handleSelectBrand}
                        />
                    </section>
                ) : null}

                <BrandFavoriteSection
                    sectionId="favorite-stores"
                    title="Your Favorite Stores"
                    brands={favoriteStores}
                    landingById={brandLandingById}
                    onSelectBrand={handleSelectBrand}
                />

                <BrandCompactRailSection
                    sectionId="recommended-stores"
                    title="Recommended for You"
                    brands={recommendedStores}
                    landingById={brandLandingById}
                    onSelectBrand={handleSelectBrand}
                />

                <BrandDealsSection
                    sectionId="todays-deals"
                    title="Brand store Today's Deals"
                    brands={dealStores}
                    landingById={brandLandingById}
                    onSelectBrand={handleSelectBrand}
                />

                <BrandAllBrandsSection
                    sectionId="all-brands"
                    title="All Brands"
                    categories={allBrandGroups}
                    landingById={brandLandingById}
                    onSelectBrand={handleSelectBrand}
                />
            </div>

            <BackToTop isDarkMode backgroundColor={backgroundColor} fontColor={textColor} />
        </>
    );
}
export default BrandStore;
