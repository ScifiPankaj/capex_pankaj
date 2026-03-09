// src/reducers/features/masters/mastersApi.js
import { createApi } from '@reduxjs/toolkit/query/react';
import apiAuth from '../../../utils/apiAuth';

// ✅ apiAuth wala baseQuery — environment auto-detect, CSRF + Basic Auth sab handle
const dynamicBaseQuery = async (args, api, extraOptions) => {
  const { url, method = 'GET', body } = typeof args === 'string' ? { url: args } : args;
  const endpoint = `/api/v1/collection/${url}`;

  try {
    let response;

    switch (method.toUpperCase()) {
      case 'POST':
        response = await apiAuth.post(endpoint, body || {});
        break;
      case 'PUT':
        response = await apiAuth.put(endpoint, body || {});
        break;
      case 'DELETE':
        response = await apiAuth.delete(endpoint);
        break;
      case 'GET':
      default:
        response = await apiAuth.get(endpoint);
        break;
    }

    const data = await response.json();
    return { data };

  } catch (error) {
    return {
      error: {
        status: error.status || 'FETCH_ERROR',
        error: error.message,
      },
    };
  }
};

export const mastersApi = createApi({
  reducerPath: 'mastersApi',
  baseQuery: dynamicBaseQuery,  // ✅ apiAuth wala
  tagTypes: ['Plant', 'Requirement', 'Nature', 'ItemSource', 'ESG'],

  endpoints: (builder) => ({

    // ── GET Plants ──────────────────────────────────────────────
    getPlants: builder.query({
      query: () => ({ url: 'kln_plantmaster', method: 'GET' }),
      providesTags: ['Plant'],
      transformResponse: (response) => {
        console.log('✅ Plants Response:', response);
        return response;
      },
      transformErrorResponse: (error) => {
        console.error('❌ Plants Error:', error);
        return error;
      },
    }),

    // ── GET Requirements ────────────────────────────────────────
    getRequirements: builder.query({
      query: () => ({ url: 'car_requirement_type', method: 'GET' }),
      providesTags: ['Requirement'],
      transformResponse: (response) => {
        console.log('✅ Requirements Response:', response);
        return response;
      },
      transformErrorResponse: (error) => {
        console.error('❌ Requirements Error:', error);
        return error;
      },
    }),

    // ── GET Nature Assets ───────────────────────────────────────
    getNatureAssets: builder.query({
      query: () => ({ url: 'car_nature_asset', method: 'GET' }),
      providesTags: ['Nature'],
      transformResponse: (response) => {
        console.log('✅ Nature Assets Response:', response);
        return response;
      },
      transformErrorResponse: (error) => {
        console.error('❌ Nature Assets Error:', error);
        return error;
      },
    }),

    // ── GET Item Sources ────────────────────────────────────────
    getItemSources: builder.query({
      query: () => ({ url: 'car_item_source', method: 'GET' }),
      providesTags: ['ItemSource'],
      transformResponse: (response) => {
        console.log('✅ Item Sources Response:', response);
        return response;
      },
      transformErrorResponse: (error) => {
        console.error('❌ Item Sources Error:', error);
        return error;
      },
    }),

    // ── GET ESG Impacts ─────────────────────────────────────────
    getEsgImpacts: builder.query({
      query: () => ({ url: 'car_esg_impacts', method: 'GET' }),
      providesTags: ['ESG'],
      transformResponse: (response) => {
        console.log('✅ ESG Impacts Response:', response);
        return response;
      },
      transformErrorResponse: (error) => {
        console.error('❌ ESG Impacts Error:', error);
        return error;
      },
    }),

    // ── Generic Mutation (POST / PUT / DELETE) ──────────────────
    mutateMaster: builder.mutation({
      query: ({ url, method, body }) => ({ url, method, body }),
      invalidatesTags: ['Plant', 'Requirement', 'Nature', 'ItemSource', 'ESG'],
      transformResponse: (response) => {
        console.log('✅ Mutate Master Response:', response);
        return response;
      },
      transformErrorResponse: (error) => {
        console.error('❌ Mutate Master Error:', error);
        return error;
      },
    }),
  }),
});

export const {
  useGetPlantsQuery,
  useGetRequirementsQuery,
  useGetNatureAssetsQuery,
  useGetItemSourcesQuery,
  useGetEsgImpactsQuery,
  useMutateMasterMutation,
} = mastersApi;

export default mastersApi.reducer;