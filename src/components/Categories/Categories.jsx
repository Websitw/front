
import React, { useState, useEffect } from 'react';
import './Categories.css';
import axios from 'axios';
import { environment } from '../../environments/environment';
import CircularProgress from '@mui/material/CircularProgress';

import { GridViewOutlined } from "@mui/icons-material";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useLocation, useNavigate } from 'react-router-dom';

import {
  Eye,
  Pencil,
  Palette,
  SprayCan,
  Droplets,
  Smile,
  Hand,
  Sparkles,
  Scissors,
  CircleDot,
} from "lucide-react";


const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const baseUrl = environment.serverOrigin;

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${baseUrl}details/shopCategoriesTab?q=properties.categoryType:"sub-sub"`,
        {
          headers: {
            Authorization: `Anonymous=${environment.appid}`,
          },
        }
      );
      console.log('response?.data?.items', response?.data?.items);
      setCategories(response?.data?.items || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const defaultCategory = {
    name: "All Categories",
    hasDropdown: true,
  };


  const staticCategories = [
    { id: 1, name: "Mascara", icon: <Eye size={24} /> },
    { id: 2, name: "Eyeliners", icon: <Pencil size={24} /> },
    { id: 3, name: "Eyeshadow", icon: <Palette size={24} /> },
    { id: 4, name: "Lipsticks", icon: <SprayCan size={24} /> },
    { id: 5, name: "Hair Care", icon: <Scissors size={24} /> },
    { id: 6, name: "Body Care", icon: <Sparkles size={24} /> },
    { id: 7, name: "Soaps", icon: <Droplets size={24} /> },
    { id: 8, name: "Facial Care", icon: <Smile size={24} /> },
    { id: 9, name: "Perfumes", icon: <SprayCan size={24} /> },
    { id: 10, name: "Nail Care", icon: <Hand size={24} /> },
  ];

  if (loading) {
    return (
      <div className="category-menu">
        <button className="category-item" disabled>
          <GridViewOutlined className="category-icon" style={{ fontSize: "24px" }} />
          <span className="category-name">{defaultCategory.name}</span>
          <ChevronDown className="category-arrow dropdown" />
        </button>


        <CircularProgress size={14} style={{ color: '#6b4c9a' }} />
      </div>
    );
  }

  return (
    <>
      <div className="category-menu">
        <button className="category-item">
          <CircleDot size={24} />
          <span className="category-name">All Categories</span>
          <ChevronDown className="category-arrow dropdown" />
        </button>

        {staticCategories.map((category) => (
          <button
            key={category.id}
            className="category-item"
            onClick={() => navigate('/shop')}
          >
            {category.icon}
            <span className="category-name">{category.name}</span>
            <ChevronRight className="category-arrow" />
          </button>
        ))}
      </div>


      {/* <div className="category-menu">
        <button className="category-item">
          <GridViewOutlined className="category-icon" style={{ fontSize: "24px" }} />
          <span className="category-name">{defaultCategory.name}</span>
          <ChevronDown className="category-arrow dropdown" />
        </button>

        {categories.map((category, index) => (
          <button
            onClick={() => {
              navigate('/shop');
            }}
            key={category.id || index}
            className="category-item"
          >
            <GridViewOutlined className="category-icon" style={{ fontSize: '24px' }} />
         
            <span className="category-name">
              {category?.name || 'Unnamed Category'}
            </span>
            <ChevronRight className="category-arrow" />
          </button>
        ))}
      </div> */}
    </>
  );
};

export default Categories;

