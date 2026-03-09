// src/reducers/features/CarForm/carRequestApi.js
import { createApi } from "@reduxjs/toolkit/query/react";
import apiAuth from "../../../utils/apiAuth";

// ✅ mastersApi jaisa pattern — url sirf collection/path dega, baseQuery prefix lagaega
const dynamicBaseQuery = async (args, api, extraOptions) => {
  const { url, method = "GET", body } =
    typeof args === "string" ? { url: args } : args;

  // ✅ Agar url already /api/v1/ se start ho toh as-is lo, warna prefix lagao
  const endpoint = url.startsWith("/api/v1/") || url.startsWith("/internal/")
    ? url
    : `/api/v1/collection/${url}`;

  try {
    let response;

    switch (method.toUpperCase()) {
      case "POST":
        response = await apiAuth.post(endpoint, body || {});
        break;
      case "PUT":
        response = await apiAuth.put(endpoint, body || {});
        break;
      case "DELETE":
        response = await apiAuth.delete(endpoint);
        break;
      case "GET":
      default:
        response = await apiAuth.get(endpoint);
        break;
    }

    const data = await response.json();
    return { data };

  } catch (error) {
    console.error(`❌ ${method} ${endpoint} error →`, error);
    return {
      error: {
        status: error.status || "FETCH_ERROR",
        error: error.message,
      },
    };
  }
};

export const carRequestApi = createApi({
  reducerPath: "carRequestApi",
  baseQuery: dynamicBaseQuery,
  tagTypes: ["CarRequest", "CarItem"],
  endpoints: (builder) => ({

    // GET /api/v1/collection/car_request
    getCarRequests: builder.query({
      query: () => ({ url: "car_request", method: "GET" }),
      providesTags: ["CarRequest"],
      transformResponse: (response) => {
        console.log("✅ CAR Requests fetched:", response);
        return response.result || response;
      },
    }),

    // POST /api/v1/collection/car_request
    addCarRequest: builder.mutation({
      query: (body) => ({ url: "car_request", method: "POST", body }),
      invalidatesTags: ["CarRequest"],
      async onQueryStarted(arg, { queryFulfilled }) {
        console.group("📨 CAR Request - CREATE");
        console.log("Payload →", arg);
        try {
          const { data } = await queryFulfilled;
          console.log("✅ Created →", data);
        } catch (err) {
          console.error("❌ CREATE error →", err?.error || err);
        } finally { console.groupEnd(); }
      },
    }),

    // PUT /api/v1/collection/car_request/{id}
    updateCarRequest: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `car_request/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["CarRequest"],
      async onQueryStarted(arg, { queryFulfilled }) {
        console.group("✏️ CAR Request - UPDATE");
        console.log("Arg →", arg);
        try {
          const { data } = await queryFulfilled;
          console.log("✅ Updated →", data);
        } catch (err) {
          console.error("❌ UPDATE error →", err?.error || err);
        } finally { console.groupEnd(); }
      },
    }),

    // DELETE /api/v1/collection/car_request/{id}
    deleteCarRequest: builder.mutation({
      query: (id) => ({ url: `car_request/${id}`, method: "DELETE" }),
      invalidatesTags: ["CarRequest"],
    }),

    // GET /internal/car_number
    getCarNumber: builder.query({
      query: () => ({ url: "/internal/car_number", method: "GET" }),
    }),

    // POST /internal/car_number
    createCarItemId: builder.mutation({
      query: (car_no) => ({
        url: "/internal/car_number",
        method: "POST",
        body: { car_no },
      }),
      async onQueryStarted(car_no, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log(`🆔 Generated item ID → ${data?.car_item_id} for CAR: ${car_no}`);
        } catch (err) {
          console.error("❌ CAR item ID generation failed →", err?.error || err);
        }
      },
    }),

    // GET /api/v1/collection/car_item_type
    getCarItems: builder.query({
      query: () => ({ url: "car_item_type", method: "GET" }),
      providesTags: ["CarItem"],
      transformResponse: (response) => {
        console.log("✅ CAR Items fetched:", response);
        return response.objects || response.result || response;
      },
    }),

    // POST /api/v1/collection/car_item_type
    addCarItem: builder.mutation({
      query: (body) => ({ url: "car_item_type", method: "POST", body }),
      invalidatesTags: (result, error, arg) =>
        arg?.car_no ? [{ type: "CarItem", id: arg.car_no }] : ["CarItem"],
      async onQueryStarted(arg, { queryFulfilled }) {
        console.group("📦 CAR Item - CREATE");
        console.log("Payload →", arg);
        try {
          const { data } = await queryFulfilled;
          console.log("✅ Created item →", data);
        } catch (err) {
          console.error("❌ Error →", err?.error || err);
        } finally { console.groupEnd(); }
      },
    }),

    // PUT /api/v1/collection/car_item_type/{id}
    updateCarItem: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `car_item_type/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["CarItem"],
      async onQueryStarted(arg, { queryFulfilled }) {
        console.group("✏️ CAR Item - UPDATE");
        console.log("Arg →", arg);
        try {
          const { data } = await queryFulfilled;
          console.log("✅ Updated item →", data);
        } catch (err) {
          console.error("❌ Error →", err?.error || err);
        } finally { console.groupEnd(); }
      },
    }),

    // DELETE /api/v1/collection/car_item_type/{id}
    deleteCarItem: builder.mutation({
      query: (id) => ({ url: `car_item_type/${id}`, method: "DELETE" }),
      invalidatesTags: ["CarItem"],
    }),
  }),
});

export const {
  useGetCarRequestsQuery,
  useAddCarRequestMutation,
  useUpdateCarRequestMutation,
  useDeleteCarRequestMutation,
  useGetCarNumberQuery,
  useCreateCarItemIdMutation,
  useGetCarItemsQuery,
  useAddCarItemMutation,
  useUpdateCarItemMutation,
  useDeleteCarItemMutation,
} = carRequestApi;

export default carRequestApi.reducer;