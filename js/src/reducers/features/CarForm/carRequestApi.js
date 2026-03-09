// src/reducers/features/CarForm/carRequestApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import apiAuth from "../../../utils/apiAuth";

// ✅ apiAuth se current environment ka baseURL
const dynamicBaseQuery = async (args, api, extraOptions) => {
  const { url, method = "GET", body } = typeof args === "string" ? { url: args } : args;

  try {
    let response;

    switch (method.toUpperCase()) {
      case "POST":
        response = await apiAuth.post(url, body || {});
        break;
      case "PUT":
        response = await apiAuth.put(url, body || {});
        break;
      case "DELETE":
        response = await apiAuth.delete(url);
        break;
      case "GET":
      default:
        response = await apiAuth.get(url);
        break;
    }

    const data = await response.json();
    return { data };

  } catch (error) {
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
  baseQuery: dynamicBaseQuery,   // ✅ apiAuth wala baseQuery
  tagTypes: ["CarRequest", "CarItem"],
  endpoints: (builder) => ({

    // ─────────────────────────────────────────
    // 1) LIST car_request
    //    GET /api/v1/collection/car_request
    // ─────────────────────────────────────────
    getCarRequests: builder.query({
      query: () => ({ url: "/api/v1/collection/car_request", method: "GET" }),
      providesTags: ["CarRequest"],
      transformResponse: (response) => {
        console.log("✅ CAR Requests fetched:", response);
        return response.result || response;
      },
    }),

    // ─────────────────────────────────────────
    // 2) CREATE car_request
    //    POST /api/v1/collection/car_request
    // ─────────────────────────────────────────
    addCarRequest: builder.mutation({
      query: (body) => ({
        url: "/api/v1/collection/car_request",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CarRequest"],
      async onQueryStarted(arg, { queryFulfilled }) {
        console.group("📨 CAR Request - CREATE");
        console.log("Payload →", arg);
        try {
          const { data } = await queryFulfilled;
          console.log("✅ Created →", data);
        } catch (err) {
          console.error("❌ Error →", err?.error || err);
        } finally {
          console.groupEnd();
        }
      },
    }),

    // ─────────────────────────────────────────
    // 3) UPDATE car_request
    //    PUT /api/v1/collection/car_request/{id}
    // ─────────────────────────────────────────
    updateCarRequest: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/v1/collection/car_request/${id}`,
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
          console.error("❌ Error →", err?.error || err);
        } finally {
          console.groupEnd();
        }
      },
    }),

    // ─────────────────────────────────────────
    // 4) DELETE car_request
    //    DELETE /api/v1/collection/car_request/{id}
    // ─────────────────────────────────────────
    deleteCarRequest: builder.mutation({
      query: (id) => ({
        url: `/api/v1/collection/car_request/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CarRequest"],
    }),

    // ─────────────────────────────────────────
    // 5) GENERATE next CAR number
    //    GET /internal/car_number
    // ─────────────────────────────────────────
    getCarNumber: builder.query({
      query: () => ({ url: "/internal/car_number", method: "GET" }),
    }),

    // ─────────────────────────────────────────
    // 6) GENERATE next CAR item ID
    //    POST /internal/car_number
    // ─────────────────────────────────────────
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

    // ─────────────────────────────────────────
    // 7) LIST car_item_type
    //    GET /api/v1/collection/car_item_type
    // ─────────────────────────────────────────
    getCarItems: builder.query({
      query: () => ({ url: "/api/v1/collection/car_item_type", method: "GET" }),
      providesTags: ["CarItem"],
      transformResponse: (response) => {
        console.log("✅ CAR Items fetched:", response);
        return response.objects || response.result || response;
      },
    }),

    // ─────────────────────────────────────────
    // 8) CREATE car_item_type
    //    POST /api/v1/collection/car_item_type
    // ─────────────────────────────────────────
    addCarItem: builder.mutation({
      query: (body) => ({
        url: "/api/v1/collection/car_item_type",
        method: "POST",
        body,
      }),
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
        } finally {
          console.groupEnd();
        }
      },
    }),

    // ─────────────────────────────────────────
    // 9) UPDATE car_item_type
    //    PUT /api/v1/collection/car_item_type/{id}
    // ─────────────────────────────────────────
    updateCarItem: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/v1/collection/car_item_type/${id}`,
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
        } finally {
          console.groupEnd();
        }
      },
    }),

    // ─────────────────────────────────────────
    // 10) DELETE car_item_type
    //     DELETE /api/v1/collection/car_item_type/{id}
    // ─────────────────────────────────────────
    deleteCarItem: builder.mutation({
      query: (id) => ({
        url: `/api/v1/collection/car_item_type/${id}`,
        method: "DELETE",
      }),
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