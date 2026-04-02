import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(i => i.productId === action.payload.productId);
      if (existingIndex >= 0) {
        const updated = [...state.items];
        const existing = updated[existingIndex];
        const newQty = existing.quantity + action.payload.quantity;
        // Clamp to available stock
        updated[existingIndex] = {
          ...existing,
          quantity: Math.min(newQty, existing.stock)
        };
        return { ...state, items: updated };
      }
      return { ...state, items: [...state.items, action.payload] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.productId !== action.payload) };
    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      if (quantity <= 0)
        return { ...state, items: state.items.filter(i => i.productId !== productId) };
      return {
        ...state,
        items: state.items.map(i => {
          if (i.productId !== productId) return i;
          // Clamp to available stock
          return { ...i, quantity: Math.min(quantity, i.stock) };
        })
      };
    }
    case 'SYNC_STOCK': {
      // action.payload = array of { _id, stock } from fresh API response
      const stockMap = {};
      action.payload.forEach(p => { stockMap[p._id] = p.stock; });
      return {
        ...state,
        items: state.items.map(item => {
          const freshStock = stockMap[item.productId];
          if (freshStock === undefined) return item;
          const clampedQty = Math.min(item.quantity, freshStock);
          return { ...item, stock: freshStock, quantity: clampedQty };
        })
      };
    }
    case 'CLEAR_CART':
      return { ...state, items: [] };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] }, () => {
    try {
      const saved = localStorage.getItem('cart');
      if (!saved) return { items: [] };
      const parsed = JSON.parse(saved);
      return parsed && Array.isArray(parsed.items) ? parsed : { items: [] };
    } catch {
      return { items: [] };
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state));
  }, [state]);

  const addItem = (product, quantity = 1) => {
    const existing = state.items.find(i => i.productId === product._id);
    if (existing && existing.quantity >= product.stock) return false; // already at max
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        isVeg: product.isVeg,
        stock: product.stock,   // ← store stock so we can cap later
        quantity
      }
    });
    return true;
  };

  const syncCartStock = (products) =>
    dispatch({ type: 'SYNC_STOCK', payload: products });

  const removeItem   = (productId) => dispatch({ type: 'REMOVE_ITEM', payload: productId });
  const updateQuantity = (productId, quantity) =>
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  const clearCart = () => {
    localStorage.removeItem('cart');          // clear immediately — don't wait for useEffect
    dispatch({ type: 'CLEAR_CART' });
  };

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items: state.items, addItem, removeItem, updateQuantity, syncCartStock, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
