import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ['Plan', 'Inventory', 'Task', 'Machine', 'Supply', 'Engineering', 'Finance', 'Workflow', 'BOM', 'Spine', 'Lot', 'JWO', 'RoutingBoM'],
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
    logDowntime: builder.mutation({
      query: (log) => ({
        url: '/machines/downtime',
        method: 'POST',
        body: log,
      }),
      invalidatesTags: ['Machine'],
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
    createManualBOM: builder.mutation({
      query: (bom) => ({
        url: '/engineering/boms/manual',
        method: 'POST',
        body: bom,
      }),
      invalidatesTags: ['Engineering'],
    }),
    getSKUs: builder.query({
      query: () => '/inventory/skus',
      providesTags: ['Inventory'],
    }),
    addSKU: builder.mutation({
      query: (sku) => ({
        url: '/inventory/skus',
        method: 'POST',
        body: sku,
      }),
      invalidatesTags: ['Inventory'],
    }),
    createGRN: builder.mutation({
      query: (grn) => ({
        url: '/supply/grns',
        method: 'POST',
        body: grn,
      }),
      invalidatesTags: ['Supply', 'Inventory'],
    }),
    getGRNs: builder.query({
      query: () => '/supply/grns',
      providesTags: ['Supply'],
    }),
    updateGRNStatus: builder.mutation({
      query: ({ grn_id, status }) => ({
        url: `/supply/grns/${grn_id}/status?status=${status}`,
        method: 'PUT',
      }),
      invalidatesTags: ['Supply'],
    }),
    getMultiLevelBOMs: builder.query({
      query: () => '/engineering/multilevel-boms',
      providesTags: ['BOM'],
    }),
    createWaste: builder.mutation({
      query: (waste) => ({
        url: '/supply/waste',
        method: 'POST',
        body: waste,
      }),
      invalidatesTags: ['Supply'],
    }),
    // ==========================================
    // THE EIGHT MISSING SYSTEMS (SPINE & MRP)
    // ==========================================
    getWarehouses: builder.query({
      query: () => '/spine/warehouses',
      providesTags: ['Spine'],
    }),
    getLots: builder.query({
      query: () => '/spine/lots',
      providesTags: ['Lot'],
    }),
    splitLot: builder.mutation({
      query: ({ lot_id, ...body }) => ({
        url: `/spine/lots/${lot_id}/split`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Lot', 'Spine'],
    }),
    getStageStocks: builder.query({
      query: () => '/spine/stage-stocks',
      providesTags: ['Spine'],
    }),
    getLotMovements: builder.query({
      query: () => '/spine/movements',
      providesTags: ['Spine'],
    }),
    completeStageWithConservation: builder.mutation({
      query: ({ jwo_id, ...body }) => ({
        url: `/spine/jwo/${jwo_id}/complete-stage`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Lot', 'JWO', 'Spine', 'Finance'],
    }),
    getRoutingBoMs: builder.query({
      query: () => '/mrp/routing-boms',
      providesTags: ['RoutingBoM'],
    }),
    explodeMRP: builder.mutation({
      query: (body) => ({
        url: '/mrp/explode',
        method: 'POST',
        body,
      }),
    }),
    generateShortfallPOs: builder.mutation({
      query: (body) => ({
        url: '/mrp/generate-shortfall-pos',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Supply', 'Plan'],
    }),
    getJWOs: builder.query({
      query: () => '/mrp/jwos',
      providesTags: ['JWO'],
    }),
    getProcessorBills: builder.query({
      query: () => '/mrp/bills',
      providesTags: ['Finance'],
    }),
    payProcessorBill: builder.mutation({
      query: (body) => ({
        url: '/mrp/bills/pay',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Finance'],
    }),
    getMISReports: builder.query({
      query: () => '/mrp/reports/mis',
      providesTags: ['Finance', 'JWO', 'Lot', 'Spine'],
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
  useLogDowntimeMutation,
  useGetPOsQuery,
  useGetWasteLogsQuery,
  useGetBOMsQuery,
  useGetInvoicesQuery,
  useGetWorkflowsQuery,
  useUpdateWorkflowMutation,
  useGenerateAIBOMMutation,
  useCreateManualBOMMutation,
  useGetSKUsQuery,
  useAddSKUMutation,
  useCreateGRNMutation,
  useGetGRNsQuery,
  useUpdateGRNStatusMutation,
  useGetMultiLevelBOMsQuery,
  useCreateWasteMutation,
  // The Eight Systems Hooks
  useGetWarehousesQuery,
  useGetLotsQuery,
  useSplitLotMutation,
  useGetStageStocksQuery,
  useGetLotMovementsQuery,
  useCompleteStageWithConservationMutation,
  useGetRoutingBoMsQuery,
  useExplodeMRPMutation,
  useGenerateShortfallPOsMutation,
  useGetJWOsQuery,
  useGetProcessorBillsQuery,
  usePayProcessorBillMutation,
  useGetMISReportsQuery,
} = apiSlice;
