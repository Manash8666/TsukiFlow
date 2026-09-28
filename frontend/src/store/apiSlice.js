import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8000/api' }),
  tagTypes: ['Plan', 'Inventory', 'Task'],
  endpoints: (builder) => ({
    getPlans: builder.query({
      query: () => '/plans',
      providesTags: ['Plan'],
    }),
    addPlan: builder.mutation({
      query: (newPlan) => ({
        url: '/plans',
        method: 'POST',
        body: newPlan,
      }),
      invalidatesTags: ['Plan'],
    }),
    getInventory: builder.query({
      query: () => '/inventory',
      providesTags: ['Inventory'],
    }),
    getTasks: builder.query({
      query: () => '/tasks',
      providesTags: ['Task'],
    }),
  }),
});

export const { useGetPlansQuery, useAddPlanMutation, useGetInventoryQuery, useGetTasksQuery } = apiSlice;
