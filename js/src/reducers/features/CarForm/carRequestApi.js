// src/reducers/features/CarForm/carRequestApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const carRequestApi = createApi({
  reducerPath: 'carRequestApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/',
    prepareHeaders: (headers) => {
      return headers;
    },
  }),
  tagTypes: ['CarRequest'],
  endpoints: (builder) => ({
    // 🔹 1) LIST – GET: /api/v1/collection/car_request
    getCarRequests: builder.query({
      query: () => 'api/v1/collection/car_request',
      providesTags: ['CarRequest'],
      transformResponse: (response) => {
        console.log('✅ CAR Requests fetched:', response);
        
        return response.result || response;
      },
    }),

    // 🔹 2) CREATE – POST: /api/v1/collection/car_request
    //    Yahan hum CAR number bhi payload me bhejenge
    addCarRequest: builder.mutation({
      query: (body) => ({
        url: 'api/v1/collection/car_request',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['CarRequest'],
      async onQueryStarted(arg, { queryFulfilled }) {
        console.group('📨 CAR Request - CREATE');
        console.log('Request payload →', arg);
        try {
          const { data } = await queryFulfilled;
          console.log('✅ Created CAR →', data);
        } catch (err) {
          console.error('❌ CREATE error →', err?.error || err);
        } finally {
          console.groupEnd();
        }
      },
    }),

    // 🔹 3) UPDATE – PUT: /api/v1/collection/car_request/{id}
    updateCarRequest: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `api/v1/collection/car_request/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['CarRequest'],
      async onQueryStarted(arg, { queryFulfilled }) {
        console.group('✏️ CAR Request - UPDATE');
        console.log('Update arg →', arg);
        try {
          const { data } = await queryFulfilled;
          console.log('✅ Updated CAR →', data);
        } catch (err) {
          console.error('❌ UPDATE error →', err?.error || err);
        } finally {
          console.groupEnd();
        }
      },
    }),

    // 🔹 4) DELETE – DELETE: /api/v1/collection/car_request/{id}
    deleteCarRequest: builder.mutation({
      query: (id) => ({
        url: `api/v1/collection/car_request/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CarRequest'],
    }),

    // 🔹 5) CAR NUMBER – GET: /internal/car_number
    //    Ye wahi endpoint hai jise tumne browser me test kiya tha
    createCarNumber: builder.mutation({
      query: () => ({
        url: 'internal/car_number',   // ✅ final URL: http://localhost:8080/internal/car_number
        method: 'GET',
      }),
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
} = carRequestApi;

export default carRequestApi.reducer;
