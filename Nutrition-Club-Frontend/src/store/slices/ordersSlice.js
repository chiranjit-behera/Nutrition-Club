import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchOrders = createAsyncThunk('orders/fetchAll', async ({ page = 1, status = 'All' } = {}, { rejectWithValue }) => {
  try {
    const params = { page, limit: 15 };
    if (status !== 'All') params.status = status;
    const res = await api.get('/orders', { params });
    return { data: res.data.data, pagination: res.data.pagination };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch orders');
  }
});

export const fetchOrderStats = createAsyncThunk('orders/fetchStats', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/orders/stats/overview');
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch stats');
  }
});

export const updateOrderStatus = createAsyncThunk('orders/updateStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/orders/${id}/status`, { status });
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update status');
  }
});

export const bulkUpdateOrderStatus = createAsyncThunk('orders/bulkUpdateStatus', async ({ orderIds, status }, { rejectWithValue }) => {
  try {
    await api.put('/orders/bulk/status', { orderIds, status });
    return { orderIds, status };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Bulk update failed');
  }
});

export const deleteOrder = createAsyncThunk('orders/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/orders/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete order');
  }
});

export const bulkDeleteOrders = createAsyncThunk('orders/bulkDelete', async (orderIds, { rejectWithValue }) => {
  try {
    await api.delete('/orders/bulk/delete', { data: { orderIds } });
    return orderIds;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Bulk delete failed');
  }
});

// ── Slice ─────────────────────────────────────────────────────────────────────

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    items: [],
    stats: null,
    pagination: {},
    loading: false,
    statsLoading: false,
    error: null,
    selectedIds: [],
  },
  reducers: {
    toggleSelectOrder(state, action) {
      const id = action.payload;
      if (state.selectedIds.includes(id)) {
        state.selectedIds = state.selectedIds.filter(i => i !== id);
      } else {
        state.selectedIds.push(id);
      }
    },
    selectAllOrders(state, action) {
      state.selectedIds = action.payload; // pass array of all visible IDs
    },
    clearOrderSelection(state) {
      state.selectedIds = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending,  (state) => { state.loading = true; state.error = null; })
      .addCase(fetchOrders.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.items = payload.data;
        state.pagination = payload.pagination;
        state.selectedIds = [];
      })
      .addCase(fetchOrders.rejected, (state, { payload }) => { state.loading = false; state.error = payload; })

      .addCase(fetchOrderStats.pending,   (state) => { state.statsLoading = true; })
      .addCase(fetchOrderStats.fulfilled, (state, { payload }) => { state.statsLoading = false; state.stats = payload; })
      .addCase(fetchOrderStats.rejected,  (state) => { state.statsLoading = false; })

      .addCase(updateOrderStatus.fulfilled, (state, { payload }) => {
        const idx = state.items.findIndex(o => o._id === payload._id);
        if (idx !== -1) state.items[idx] = payload;
      })

      .addCase(bulkUpdateOrderStatus.fulfilled, (state, { payload }) => {
        state.items = state.items.map(o =>
          payload.orderIds.includes(o._id) ? { ...o, status: payload.status } : o
        );
        state.selectedIds = [];
      })

      .addCase(deleteOrder.fulfilled, (state, { payload }) => {
        state.items = state.items.filter(o => o._id !== payload);
        state.selectedIds = state.selectedIds.filter(id => id !== payload);
      })

      .addCase(bulkDeleteOrders.fulfilled, (state, { payload }) => {
        state.items = state.items.filter(o => !payload.includes(o._id));
        state.selectedIds = [];
      });
  },
});

export const { toggleSelectOrder, selectAllOrders, clearOrderSelection } = ordersSlice.actions;
export default ordersSlice.reducer;
