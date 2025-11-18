// src/reducers/features/CarForm/carRequestApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// âœ… Create the API slice
export const carRequestApi = createApi({
  reducerPath: 'carRequestApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/',
    prepareHeaders: (headers) => {
      // Add any auth headers if needed
      return headers;
    },
  }),
  tagTypes: ['CarRequest'],
  endpoints: (builder) => ({
    // GET: Fetch all CAR requests
    getCarRequests: builder.query({
      query: () => 'collection/car_request',
      providesTags: ['CarRequest'],
      transformResponse: (response) => {
        console.log('âœ… CAR Requests fetched:', response);
        return response;
      },
    }),

    // POST: Create new CAR request
    addCarRequest: builder.mutation({
      query: (body) => ({
        url: 'collection/car_request',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['CarRequest'],
      async onQueryStarted(arg, { queryFulfilled }) {
        console.group('ðŸ“¤ CAR Request - CREATE');
        console.log('Request payload â†’', arg);
        try {
          const { data } = await queryFulfilled;
          console.log('âœ… Success â†’', data);
        } catch (err) {
          console.error('âŒ Error â†’', err?.error || err);
          console.log('Error details:', {
            status: err?.error?.status,
            data: err?.error?.data,
            originalStatus: err?.error?.originalStatus
          });
        } finally {
          console.groupEnd();
        }
      },
    }),

    // PUT: Update existing CAR request
    updateCarRequest: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `collection/car_request/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['CarRequest'],
      async onQueryStarted(arg, { queryFulfilled }) {
        console.group('ðŸ“ CAR Request - UPDATE');
        console.log('Request ID â†’', arg.id);
        console.log('Request payload â†’', arg);
        try {
          const { data } = await queryFulfilled;
          console.log('âœ… Success â†’', data);
        } catch (err) {
          console.error('âŒ Error â†’', err?.error || err);
        } finally {
          console.groupEnd();
        }
      },
    }),

    // DELETE: Delete CAR request
    deleteCarRequest: builder.mutation({
      query: (id) => ({
        url: `collection/car_request/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CarRequest'],
      async onQueryStarted(arg, { queryFulfilled }) {
        console.group('ðŸ—‘ï¸ CAR Request - DELETE');
        console.log('Request ID â†’', arg);
        try {
          const { data } = await queryFulfilled;
          console.log('âœ… Success â†’', data);
        } catch (err) {
          console.error('âŒ Error â†’', err?.error || err);
        } finally {
          console.groupEnd();
        }
      },
    }),
  }),
});

// âœ… Export the auto-generated hooks
export const {
  useGetCarRequestsQuery,
  useAddCarRequestMutation,
  useUpdateCarRequestMutation,
  useDeleteCarRequestMutation,
} = carRequestApi;

// âœ… Export the reducer and middleware
export default carRequestApi.reducer;