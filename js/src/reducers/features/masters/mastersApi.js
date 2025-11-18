// src/reducers/features/masters/mastersApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * Masters API
 * Handles all master data endpoints (Plants, Requirements, Nature Assets, etc.)
 */
export const mastersApi = createApi({
  reducerPath: 'mastersApi',
  
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api/v1/collection/',  // ✅ Changed to relative path (proxy will handle it)
    
    // Add headers and debugging
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      headers.set('Accept', 'application/json');
      return headers;
    },
    
    // Add response validation and debugging
    validateStatus: (response, result) => {
      console.log('📡 API Response:', {
        status: response.status,
        ok: response.ok,
        result: result
      });
      return response.ok;
    },
  }),
  
  tagTypes: ['Plant', 'Requirement', 'Nature', 'ItemSource', 'ESG'],
  
  endpoints: (builder) => ({
    // ============================================================
    // READ ENDPOINTS
    // ============================================================
    
    /**
     * Get all plants
     */
    getPlants: builder.query({
      query: () => ({
        url: 'kln_plantmaster',
        method: 'GET',
      }),
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
    
    /**
     * Get all requirement types
     */
    getRequirements: builder.query({
      query: () => ({
        url: 'car_requirement_type',
        method: 'GET',
      }),
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
    
    /**
     * Get all nature of assets
     */
    getNatureAssets: builder.query({
      query: () => ({
        url: 'car_nature_asset',
        method: 'GET',
      }),
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
    
    /**
     * Get all item sources
     */
    getItemSources: builder.query({
      query: () => ({
        url: 'car_item_source',
        method: 'GET',
      }),
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
    
    /**
     * Get all ESG impacts
     */
    getEsgImpacts: builder.query({
      query: () => ({
        url: 'car_esg_impacts',
        method: 'GET',
      }),
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
    
    // ============================================================
    // MUTATION ENDPOINT (CREATE/UPDATE/DELETE)
    // ============================================================
    
    /**
     * Generic mutation for all master data operations
     * Supports POST, PUT, DELETE methods
     */
    mutateMaster: builder.mutation({
      query: ({ url, method, body }) => ({
        url,
        method,
        body,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
      }),
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

// Export hooks
export const {
  useGetPlantsQuery,
  useGetRequirementsQuery,
  useGetNatureAssetsQuery,
  useGetItemSourcesQuery,
  useGetEsgImpactsQuery,
  useMutateMasterMutation,
} = mastersApi;

// Export reducer and middleware
export default mastersApi.reducer;