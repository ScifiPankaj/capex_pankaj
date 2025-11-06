import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const mastersApi = createApi({
  reducerPath: 'mastersApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8080/api/v1/collection/' }),
  tagTypes: ['Plant','Requirement','Nature','ItemSource','ESG'],
  endpoints: (b) => ({
    // READS
    getPlants:        b.query({ query: () => 'kln_plantmaster',     providesTags: ['Plant'] }),
    getRequirements:  b.query({ query: () => 'car_requirement_type', providesTags: ['Requirement'] }),
    getNatureAssets:  b.query({ query: () => 'car_nature_asset',     providesTags: ['Nature'] }),
    getItemSources:   b.query({ query: () => 'car_item_source',      providesTags: ['ItemSource'] }),
    getEsgImpacts:    b.query({ query: () => 'car_esg_impacts',      providesTags: ['ESG'] }),

    // one generic mutation you can use for POST/PUT/DELETE
    mutateMaster: b.mutation({
      query: ({ url, method, body }) => ({
        url, method, body, headers: body ? { 'Content-Type': 'application/json' } : undefined
      }),
      // easiest: invalidate all master lists (simple & safe)
      invalidatesTags: ['Plant','Requirement','Nature','ItemSource','ESG']
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
