import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchBookings = createAsyncThunk('bookings/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const [bookingsRes, statsRes] = await Promise.all([
      api.get('/bookings', { params: { limit: 100 } }),
      api.get('/bookings/stats/overview'),
    ]);
    return { data: bookingsRes.data.data, stats: statsRes.data.data };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch bookings');
  }
});

export const updateBooking = createAsyncThunk('bookings/update', async ({ id, status, adminNotes }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/bookings/${id}`, { status, adminNotes });
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update booking');
  }
});

export const deleteBooking = createAsyncThunk('bookings/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/bookings/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete booking');
  }
});

export const bulkDeleteBookings = createAsyncThunk('bookings/bulkDelete', async (bookingIds, { rejectWithValue }) => {
  try {
    await api.delete('/bookings/bulk/delete', { data: { bookingIds } });
    return bookingIds;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Bulk delete failed');
  }
});

// ── Slice ─────────────────────────────────────────────────────────────────────

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: {
    items: [],
    stats: null,
    loading: false,
    error: null,
    selectedIds: [],
  },
  reducers: {
    toggleSelectBooking(state, action) {
      const id = action.payload;
      if (state.selectedIds.includes(id)) {
        state.selectedIds = state.selectedIds.filter(i => i !== id);
      } else {
        state.selectedIds.push(id);
      }
    },
    selectAllBookings(state, action) {
      state.selectedIds = action.payload;
    },
    clearBookingSelection(state) {
      state.selectedIds = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending,  (state) => { state.loading = true; state.error = null; })
      .addCase(fetchBookings.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.items = payload.data;
        state.stats = payload.stats;
        state.selectedIds = [];
      })
      .addCase(fetchBookings.rejected, (state, { payload }) => { state.loading = false; state.error = payload; })

      .addCase(updateBooking.fulfilled, (state, { payload }) => {
        const idx = state.items.findIndex(b => b._id === payload._id);
        if (idx !== -1) state.items[idx] = payload;
      })

      .addCase(deleteBooking.fulfilled, (state, { payload }) => {
        state.items = state.items.filter(b => b._id !== payload);
        state.selectedIds = state.selectedIds.filter(id => id !== payload);
      })

      .addCase(bulkDeleteBookings.fulfilled, (state, { payload }) => {
        state.items = state.items.filter(b => !payload.includes(b._id));
        state.selectedIds = [];
      });
  },
});

export const { toggleSelectBooking, selectAllBookings, clearBookingSelection } = bookingsSlice.actions;
export default bookingsSlice.reducer;
