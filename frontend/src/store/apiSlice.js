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
    addInventory: builder.mutation({
      query: (newItem) => ({
        url: '/inventory',
        method: 'POST',
        body: newItem,
      }),
      invalidatesTags: ['Inventory'],
    }),
    getTasks: builder.query({
      query: () => '/tasks',
      providesTags: ['Task'],
    }),
    addTask: builder.mutation({
      query: (newTask) => ({
        url: '/tasks',
        method: 'POST',
        body: newTask,
      }),
      invalidatesTags: ['Task'],
    }),
    getMachines: builder.query({
      query: () => '/machines',
      providesTags: ['Machine'],
    }),
    getPOs: builder.query({
      query: () => '/supply/pos',
      providesTags: ['Supply'],
    }),
    getWasteLogs: builder.query({
      query: () => '/supply/waste',
      providesTags: ['Supply'],
    }),
  }),
});

export const { 
  useGetPlansQuery, 
  useAddPlanMutation, 
  useGetInventoryQuery, 
  useAddInventoryMutation,
  useGetTasksQuery,
  useAddTaskMutation,
  useGetMachinesQuery,
  useGetPOsQuery,
  useGetWasteLogsQuery
} = apiSlice;
