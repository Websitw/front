import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { environment } from "../../environments/environment";

export const productsApi = createApi({
  reducerPath: "productsApi",
  tagTypes: ["ProductDetails"],
  baseQuery: fetchBaseQuery({
    baseUrl: environment.serverOrigin,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getBestSellersProducts: builder.query({
      query: () => ({
        url: "products/skus",
        params: { sort: "properties.orderCount", desc: true },
        headers: {
          Authorization: `Anonymous=${environment.appid}`,
        },
        responseHandler: async (response) => {
          const data = await response.json();
          return data?.items;
        },
      }),
    }),
    getProductDetails: builder.query({
      query: (id) => ({
        url: `products/${id}`,
        params: {
          countryCode: "JO",
          userId: localStorage.getItem("userId") || "",
        },
        headers: {
          Authorization: `Anonymous=${environment.appid}`,
        },
      }),
      providesTags: (result, error, id) => [{ type: "ProductDetails", id }],
      keepUnusedDataFor: 0,
    }),
  }),
});

export const { useGetBestSellersProductsQuery, useGetProductDetailsQuery } =
  productsApi;