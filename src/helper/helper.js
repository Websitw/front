import axios from "axios";
import { environment } from "../environments/environment";

const baseURL = environment.uploadeFileUrl;

// Function to upload an image file to the server
export const uploadImage = async (file) => {
  console.log("Uploading image file:", file);
  const token = localStorage.getItem("token");

  try {
    const response = await axios.post(`${baseURL}`, file, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": file?.type,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message || "Failed to upload image");
  }
};

export const imageUrl = `${environment.serverOrigin}_xfilestore/mada/`;

export const ITEMS_PER_PAGE = 8;

export const getOrCreateSessionId = () => {
  let sessionId = localStorage.getItem("sessionId");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("sessionId", sessionId);
  }
  return sessionId;
};

export const formatDate = (timestamp, includeTime = false) => {
  const date = new Date(timestamp);

  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();

  let result = `${dd}/${mm}/${yyyy}`;

  if (includeTime) {
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    result += ` ${hh}:${min}`;
  }

  return result;
};

export const formatDateTwo = (
  dateString,
  options = { day: "numeric", month: "short" },
) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", options);
};

export const getItemPrice = (item) => {
  const priceJO = item?.price?.JO;
  const now = Date.now();

  const isOnSale =
    priceJO?.salePrice > 0 &&
    now >= priceJO?.saleStart &&
    now <= priceJO?.saleEnd;

  return {
    isOnSale,
    displayPrice: isOnSale ? priceJO?.salePrice : priceJO?.listPrice,
    originalPrice: isOnSale ? priceJO?.listPrice : null,
  };
};
export const getItemSkuPrice = (sku) => {
  const priceJO = sku;
  const now = Date.now();

  const isOnSale =
    priceJO?.salePrice > 0 &&
    now >= priceJO?.saleStart &&
    now <= priceJO?.saleEnd;

  return {
    isOnSale,
    displayPrice: isOnSale ? priceJO.salePrice : priceJO?.listPrice,
    originalPrice: isOnSale ? priceJO.listPrice : null,
  };
};

export const checkWholeSalePrice = (item) =>{
  const priceJO = item?.sku?.price?.JO;
  const isOnSale = priceJO?.hasWholesalePrice || false;

  return {
    isOnSale,
    displayPrice: isOnSale ? priceJO?.salePrice : priceJO?.listPrice,
    originalPrice: isOnSale ? priceJO.listPrice : null,
  }
}

export const getItemPriceTwo = (item) => {
  const priceJO = item?.price?.JO;
  const now = Date.now();

  const isOnSale =
    priceJO?.salePrice > 0 &&
    now >= priceJO?.saleStart &&
    now <= priceJO?.saleEnd;

  return {
    isOnSale,
    displayPrice: isOnSale ? priceJO.salePrice : priceJO?.listPrice,
    originalPrice: isOnSale ? priceJO.listPrice : null,
  };
};