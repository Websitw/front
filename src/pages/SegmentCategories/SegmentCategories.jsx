import React, { useState, useEffect } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import { environment } from '../../environments/environment'
import "swiper/css";
import "swiper/css/free-mode";
import { useNavigate } from "react-router-dom";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import "./SegmentCategories.css";
import { imageUrl } from "../../helper/helper";
import { useDispatch } from "react-redux";
import BANNERIMAGE from '../../assets/Banner/CategoryBannderScreen.png'
import IMAGENOTFOUND from '../../assets/icons/imageNotFound.png'

import {
  setSidebarOpen,
} from '../../store/slices/userSidebar'


const dedupeById = (arr = []) => {
  const seen = new Set();
  return arr.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

const normaliseNode = (node) => ({
  ...node,
  children: dedupeById(node.children ?? []).map(normaliseNode),
});

const fetchSegments = async () => {
  const { data } = await axios.get(
    `${environment.serverOrigin}catalog/segments?enrich=true`,
    {
      headers: {
        Authorization: `Anonymous=${environment.appid}`,
      },
    }
  );

  const raw = Array.isArray(data)
    ? data
    : data?.items ?? data?.data ?? [];

  return raw.map(normaliseNode);
};

const SegmentCategories = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedSegment, setSelectedSegment] = useState("all");
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSegments();
        setSegments(data);
        const firstCat = data?.[0]?.children?.[0] ?? null;
        setActiveCategory(firstCat);
      } catch (err) {
        setError(err?.response?.data?.message ?? "Failed to load categories");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const visibleSegments =
    selectedSegment === "all"
      ? segments
      : segments.filter((seg) => seg.id === selectedSegment);

  if (loading) {
    return (
      <div className="categories-page">
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "32px" }}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ animation: "spin 1s linear infinite" }}
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <p>Loading categories...</p>
        </div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="categories-page">
        <div className="header-banner">
          <h1>Categories</h1>
        </div>
        <div style={{ padding: "32px" }}>
          <p>Failed to load categories.</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  const goToSearch = (value, { brandId, categoryId } = {}) => {
    const params = new URLSearchParams();
    if (value) params.set("q", value);
    if (brandId) params.set("brandId", brandId);
    if (categoryId) params.set("categoryId", categoryId);

    navigate(`/search?${params.toString()}`);

    setTimeout(() => {
      dispatch(setSidebarOpen(true));
    }, 500);
  };

  return (
    <div className="categories-page">
      <div
        className="header-banner"
        style={{ backgroundImage: `url(${BANNERIMAGE})` }}
      >
        <div className="header-banner__content">
          <h1>Categories</h1>
          <p>
            Find what you need across beauty, fashion, electronics and more
          </p>
        </div>
      </div>

      <div className="nav-row">
        <div className="left">
          <span onClick={() => navigate("/")} className="back">
            ← Back
          </span>
          <h3>Categories</h3>
        </div>

        <div className="right">
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <Select
              value={selectedSegment}
              onChange={(e) => {
                setSelectedSegment(e.target.value);
                const seg =
                  e.target.value === "all"
                    ? segments[0]
                    : segments.find((s) => s.id === e.target.value);
                setActiveCategory(seg?.children?.[0] ?? null);
              }}
              IconComponent={KeyboardArrowDownIcon}
              displayEmpty
            >
              <MenuItem value="all">All Categories</MenuItem>
              {segments.map((seg) => (
                <MenuItem key={seg.id} value={seg.id}>
                  {seg.segmentName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>

      <hr />

      {visibleSegments.map((segment) => {
        const categories = dedupeById(segment.children ?? []);
        const activeCat =
          activeCategory &&
            categories.some((c) => c.id === activeCategory.id)
            ? activeCategory
            : categories[0] ?? null;

        const subCategories = dedupeById(activeCat?.children ?? []);

        return (
          <div key={segment.id} className="segment-container">
            <h2 className="segment-title">{segment.segmentName}</h2>

            {categories.length === 0 && (
              <p>No data Found</p>
            )}

            <Swiper
              slidesPerView="auto"
              spaceBetween={16}
              freeMode={true}
              modules={[FreeMode]}
              className="segment-swiper"
            >
              {categories.map((cat) => (
                <SwiperSlide key={cat.id} className="segment-slide">
                  <div
                    className={`segment-card ${activeCat?.id === cat.id ? "active" : ""}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    <img
                      src={cat?.imageId ? `${imageUrl}${cat.imageId}` : IMAGENOTFOUND}
                      alt={cat?.categoryName || "No data Found"}
                      onError={(e) => {
                        e.target.src = IMAGENOTFOUND;
                      }}
                    />
                    <p>{cat?.categoryName || "No data Found"}</p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {subCategories.length > 0 ? (
              <div className="subcategories">
                <h3>{activeCat?.categoryName || "No data Found"}</h3>

                <div className="sub-list">
                  {subCategories.map((sub) => (
                    <div
                      className="sub-item"
                      key={sub.id}
                      onClick={() =>
                        navigate("/SegmentCategories", {
                          state: { categoryId: sub.id, categoryKey: sub.key },
                        })
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <img
                        src={sub?.imageId ? `${imageUrl}${sub.imageId}` : IMAGENOTFOUND}
                        alt={sub?.categoryName || "No data Found"}
                        onError={(e) => {
                          e.stopPropagation();
                          e.target.src = IMAGENOTFOUND;
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          goToSearch("", { categoryId: sub.id });
                        }}
                      />
                      <p>{sub?.categoryName || "No data Found"}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ padding: "16px 0" }}>No data Found</p>
            )}

          </div>
        );
      })}
    </div>
  );
};

export default SegmentCategories;