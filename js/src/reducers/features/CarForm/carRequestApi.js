// src/reducers/features/CarForm/carRequestApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const carRequestApi = createApi({
  reducerPath: "carRequestApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/",
    prepareHeaders: (headers) => {
      return headers;
    },
  }),
  tagTypes: ["CarRequest", "CarItem"],
  endpoints: (builder) => ({
    // 🔹 1) LIST – GET: /api/v1/collection/car_request
    getCarRequests: builder.query({
      query: () => "api/v1/collection/car_request",
      providesTags: ["CarRequest"],
      transformResponse: (response) => {
        console.log("✅ CAR Requests fetched:", response);
        // Contact JSON API sometimes returns { objects: [...] }, sometimes { result: ... }
        return response.result || response;
      },
    }),

    // 🔹 2) CREATE – POST: /api/v1/collection/car_request
    addCarRequest: builder.mutation({
      query: (body) => ({
        url: "api/v1/collection/car_request",
        method: "POST",
        body,
      }),
      invalidatesTags: ["CarRequest"],
      async onQueryStarted(arg, { queryFulfilled }) {
        console.group("📨 CAR Request - CREATE");
        console.log("Request payload →", arg);
        try {
          const { data } = await queryFulfilled;
          console.log("✅ Created CAR →", data);
        } catch (err) {
          console.error("❌ CREATE error →", err?.error || err);
        } finally {
          console.groupEnd();
        }
      },
    }),

    // 🔹 3) UPDATE – PUT: /api/v1/collection/car_request/{id}
    updateCarRequest: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `api/v1/collection/car_request/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["CarRequest"],
      async onQueryStarted(arg, { queryFulfilled }) {
        console.group("✏️ CAR Request - UPDATE");
        console.log("Update arg →", arg);
        try {
          const { data } = await queryFulfilled;
          console.log("✅ Updated CAR →", data);
        } catch (err) {
          console.error("❌ UPDATE error →", err?.error || err);
        } finally {
          console.groupEnd();
        }
      },
    }),

    // 🔹 4) DELETE – DELETE: /api/v1/collection/car_request/{id}
    deleteCarRequest: builder.mutation({
      query: (id) => ({
        url: `api/v1/collection/car_request/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CarRequest"],
    }),

    // 🔹 5) CAR NUMBER – GET: /internal/car_number
    createCarNumber: builder.mutation({
      query: () => ({
        url: "internal/car_number", // http://localhost:8080/internal/car_number
        method: "GET",
      }),
    }),

    // 🔹 Add this inside endpoints: (builder) => ({ ... })
    getCarItems: builder.query({
      query: () => "api/v1/collection/car_item_type",
      transformResponse: (response) => {
        console.log("✅ CAR Items fetched:", response);
        return response.objects || response.result || response;
      },
    }),

    // 🔹 6) CAR ITEM – POST: /api/v1/collection/car_item_type
    addCarItem: builder.mutation({
      query: (body) => ({
        url: "api/v1/collection/car_item_type",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, arg) =>
        arg?.car_no ? [{ type: "CarItem", id: arg.car_no }] : ["CarItem"],
      async onQueryStarted(arg, { queryFulfilled }) {
        console.group("📦 CAR Item - CREATE");
        console.log("Item payload →", arg);
        try {
          const { data } = await queryFulfilled;
          console.log("✅ Created CAR Item →", data);
        } catch (err) {
          console.error("❌ CAR Item CREATE error →", err?.error || err);
        } finally {
          console.groupEnd();
        }
      },
    }),
  }),
});

// ✅ Export hooks
export const {
  useGetCarRequestsQuery,
  useAddCarRequestMutation,
  useUpdateCarRequestMutation,
  useDeleteCarRequestMutation,
  useCreateCarNumberMutation,
  useAddCarItemMutation,
  useGetCarItemsQuery,
} = carRequestApi;

export default carRequestApi.reducer;
