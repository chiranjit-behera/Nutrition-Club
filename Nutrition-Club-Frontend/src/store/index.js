import { configureStore } from '@reduxjs/toolkit';
import ordersReducer   from './slices/ordersSlice';
import bookingsReducer from './slices/bookingsSlice';

export const store = configureStore({
  reducer: {
    orders:   ordersReducer,
    bookings: bookingsReducer,
  },
});

export default store;
