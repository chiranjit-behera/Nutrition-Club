import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Tag } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const CartPage = () => {
  const { items, updateQuantity, removeItem, totalItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const deliveryFee = totalPrice > 500 ? 0 : 40;
  const taxes = Math.round(totalPrice * 0.05);
  const grandTotal = totalPrice + deliveryFee + taxes;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-orange-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="font-display text-3xl font-bold text-gray-800 mb-3">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Add some delicious items from our menu!</p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/" className="p-2 hover:bg-white rounded-xl transition-colors text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display text-3xl font-bold text-gray-800">Your Cart</h1>
          <span className="badge bg-orange-100 text-orange-600 text-sm px-3 py-1">{totalItems} items</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="card p-4 flex items-center gap-4 animate-fade-in">
                {/* Image */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-orange-50 flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none' }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
                  <p className="text-orange-600 font-medium">₹{item.price} each</p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-1 py-1">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center bg-white rounded-lg text-orange-600 hover:bg-orange-100 transition-colors shadow-sm"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-bold text-gray-800">{item.quantity}</span>
                      <button
                        onClick={() => {
                          if (item.quantity >= item.stock) {
                            toast.error(`Max stock reached — only ${item.stock} available!`);
                            return;
                          }
                          updateQuantity(item.productId, item.quantity + 1);
                        }}
                        disabled={item.quantity >= item.stock}
                        title={item.quantity >= item.stock ? `Max stock: ${item.stock}` : ''}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-white transition-colors shadow-sm ${
                          item.quantity >= item.stock
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-orange-500 hover:bg-orange-600'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {item.quantity >= item.stock && (
                      <p className="text-xs text-orange-500 font-medium">Max stock reached</p>
                    )}
                    {item.stock > 0 && item.stock <= 10 && item.quantity < item.stock && (
                      <p className="text-xs text-red-500 font-medium">⚡ Only {item.stock} left</p>
                    )}
                  </div>

                  <span className="font-bold text-gray-800 w-20 text-right">₹{(item.price * item.quantity).toFixed(0)}</span>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="text-sm text-red-400 hover:text-red-600 transition-colors flex items-center gap-1 mt-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="font-display text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-orange-500" />
                Order Summary
              </h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="font-medium">₹{totalPrice.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  {deliveryFee === 0 ? (
                    <span className="text-green-600 font-medium">FREE</span>
                  ) : (
                    <span className="font-medium">₹{deliveryFee}</span>
                  )}
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Taxes (5%)</span>
                  <span className="font-medium">₹{taxes}</span>
                </div>
                {deliveryFee > 0 && (
                  <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                    Add ₹{(500 - totalPrice).toFixed(0)} more for FREE delivery!
                  </p>
                )}
                <div className="h-px bg-gray-100 my-3"></div>
                <div className="flex justify-between font-bold text-lg text-gray-800">
                  <span>Total</span>
                  <span className="text-orange-600">₹{grandTotal.toFixed(0)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout', { state: { totalAmount: grandTotal } })}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-base"
              >
                <ShoppingBag className="w-5 h-5" />
                Proceed to Checkout
              </button>

              <Link to="/" className="block text-center text-sm text-orange-500 hover:text-orange-600 mt-4 font-medium">
                + Add More Items
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
