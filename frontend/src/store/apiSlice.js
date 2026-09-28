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
    getBOMs: builder.query({
      query: () => '/engineering/boms',
      providesTags: ['Engineering'],
    }),
    getInvoices: builder.query({
      query: () => '/engineering/invoices',
      providesTags: ['Finance'],
    }),
    getWorkflows: builder.query({
      query: () => '/engineering/workflows',
      providesTags: ['Workflow'],
    }),
    updateWorkflow: builder.mutation({
      query: (workflow) => ({
        url: '/engineering/workflows',
        method: 'POST',
        body: workflow,
      }),
      invalidatesTags: ['Workflow'],
    }),
    generateAIBOM: builder.mutation({
      query: (request) => ({
        url: '/engineering/boms/generate',
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['Engineering'],
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
  useGetWasteLogsQuery,
  useGetBOMsQuery,
  useGetInvoicesQuery,
  useGetWorkflowsQuery,
  useUpdateWorkflowMutation,
  useGenerateAIBOMMutation
} = apiSlice;
