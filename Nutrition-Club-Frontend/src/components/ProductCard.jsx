import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Star, Leaf, Drumstick } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { items, addItem, updateQuantity } = useCart();
  const [imgError, setImgError] = useState(false);

  const cartItem    = items.find(i => i.productId === product._id);
  const quantity    = cartItem?.quantity || 0;
  const isOutOfStock = product.stock === 0;
  const atStockMax   = quantity >= product.stock; // can't add more

  const handleAdd = () => {
    const added = addItem(product, 1);
    if (added === false) {
      toast.error(`Only ${product.stock} available in stock!`);
    } else {
      toast.success(`${product.name} added to cart!`);
    }
  };

  const handleIncrease = () => {
    if (atStockMax) {
      toast.error(`Only ${product.stock} available in stock!`);
      return;
    }
    updateQuantity(product._id, quantity + 1);
  };

  const handleDecrease = () => updateQuantity(product._id, quantity - 1);

  return (
    <div className={`card overflow-hidden group animate-fade-in ${isOutOfStock ? 'opacity-60' : ''}`}>
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-orange-50">
        {!imgError && product.image ? (
          <img src={product.image} alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
            <span className="text-5xl">🍽️</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {product.isVeg ? (
            <span className="badge bg-green-100 text-green-700 border border-green-300">
              <Leaf className="w-3 h-3 mr-1" /> Veg
            </span>
          ) : (
            <span className="badge bg-red-100 text-red-700 border border-red-300">
              <Drumstick className="w-3 h-3 mr-1" /> Non-Veg
            </span>
          )}
        </div>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 font-bold px-3 py-1 rounded-full text-sm">Out of Stock</span>
          </div>
        )}

        <div className="absolute top-2 right-2">
          <span className="badge bg-white/90 text-amber-600 shadow-sm">
            <Star className="w-3 h-3 mr-1 fill-amber-400 text-amber-400" />
            {product.rating}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-1">
          <span className="text-xs text-orange-500 font-medium uppercase tracking-wide">{product.category}</span>
        </div>
        <h3 className="font-display font-semibold text-gray-800 text-lg leading-tight mb-1">{product.name}</h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-3 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-orange-600">₹{product.price}</span>

          {!isOutOfStock ? (
            quantity === 0 ? (
              <button onClick={handleAdd}
                disabled={atStockMax}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 shadow-md ${
                  atStockMax
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}>
                <ShoppingCart className="w-4 h-4" /> Add
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-1 py-1">
                <button onClick={handleDecrease}
                  className="w-7 h-7 flex items-center justify-center bg-white rounded-lg text-orange-600 hover:bg-orange-100 transition-colors shadow-sm">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-bold text-gray-800">{quantity}</span>
                <button onClick={handleIncrease}
                  disabled={atStockMax}
                  title={atStockMax ? `Max ${product.stock} in stock` : ''}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-white transition-colors shadow-sm ${
                    atStockMax
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-orange-500 hover:bg-orange-600'
                  }`}>
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          ) : (
            <span className="text-sm text-gray-400 font-medium">Unavailable</span>
          )}
        </div>

        {/* Stock indicator */}
        {product.stock > 0 && product.stock <= 10 && (
          <p className="text-xs text-red-500 mt-2 font-medium">⚡ Only {product.stock} left!</p>
        )}
        {atStockMax && quantity > 0 && (
          <p className="text-xs text-orange-500 mt-2 font-medium">✓ Max stock added ({product.stock})</p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
