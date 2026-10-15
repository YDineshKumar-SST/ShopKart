import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const fetchWishlist = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await axios.get("http://localhost:3000/wishlist", { withCredentials: true });
      setWishlist(res.data.wishlist);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate("/login"); 
      } else {
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [navigate]);

  const handleRemove = async (productId) => {
    try {
      await axios.delete(`http://localhost:3000/wishlist/${productId}`, { withCredentials: true });
      setWishlist(wishlist.filter(item => item._id !== productId));
    } catch (err) {
      console.error(err);
      alert("Failed to remove product. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6] flex flex-col font-sans">
      <Navbar />
      
      <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 py-4 space-y-4">
        {/* Header Bar */}
        <div className="bg-white border border-[#e0e0e0] rounded-sm p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-[#212121]">
              My Wishlist
            </h1>
            {!loading && !error && (
              <span className="text-xs font-semibold text-[#878787]">
                ({wishlist.length} {wishlist.length === 1 ? 'item' : 'items'})
              </span>
            )}
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-[#2874f0] hover:text-[#1b5bbd] transition uppercase tracking-wide"
          >
            Continue Shopping &rarr;
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-sm border border-[#e0e0e0] p-16 text-center shadow-sm">
            <div className="inline-block animate-spin rounded-full h-9 w-9 border-4 border-[#2874f0] border-t-transparent mb-3"></div>
            <p className="text-sm font-semibold text-[#878787]">Loading your wishlist items...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-white border border-red-200 rounded-sm p-12 text-center shadow-sm">
            <div className="text-4xl mb-2">⚠️</div>
            <p className="text-base text-red-600 font-bold mb-1">Failed to load wishlist</p>
            <p className="text-xs text-[#878787] mb-4">Please check your connection and try again.</p>
            <button 
              onClick={fetchWishlist} 
              className="bg-[#2874f0] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && wishlist.length === 0 && (
          <div className="bg-white border border-[#e0e0e0] rounded-sm p-10 sm:p-16 text-center shadow-sm max-w-xl mx-auto my-6">
            <div className="w-36 h-36 mx-auto mb-4 flex items-center justify-center bg-red-50 rounded-full">
              <svg className="w-16 h-16 text-red-400 fill-current" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#212121] mb-1">Empty Wishlist</h2>
            <p className="text-xs sm:text-sm text-[#878787] mb-6">
              You have no items in your wishlist. Start adding items you love!
            </p>
            <Link
              to="/products"
              className="inline-block bg-[#2874f0] hover:bg-[#1b5bbd] text-white text-xs sm:text-sm font-bold uppercase tracking-wider px-8 py-3 rounded-sm shadow-sm transition active:scale-95"
            >
              Discover Products
            </Link>
          </div>
        )}

        {/* Wishlist Items Grid */}
        {!loading && !error && wishlist.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {wishlist.map((product) => (
              <div
                key={product._id}
                className="bg-white border border-[#f0f0f0] hover:border-[#e0e0e0] hover:shadow-lg transition-all duration-200 rounded-sm p-4 flex flex-col justify-between relative group"
              >
                {/* Delete / Trash Button */}
                <button
                  onClick={() => handleRemove(product._id)}
                  title="Remove from wishlist"
                  className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-red-50 text-gray-400 hover:text-red-500 shadow-sm flex items-center justify-center transition"
                  aria-label="Remove item"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>

                <Link to={`/products/${product._id}`} className="block">
                  {/* Image */}
                  <div className="w-full h-44 sm:h-48 flex items-center justify-center overflow-hidden bg-white mb-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Title & Category */}
                  <h3 className="font-medium text-[#212121] group-hover:text-[#2874f0] text-sm truncate transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-[#878787] mt-0.5 truncate">{product.category}</p>

                  {/* Rating & Assured */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-0.5 bg-[#388e3c] text-white text-[11px] font-bold px-1.5 py-0.5 rounded leading-none">
                      <span>4.2</span>
                      <span className="text-[9px]">★</span>
                    </span>
                    <span className="text-[11px] text-[#878787]">(620)</span>
                    
                    <span className="text-[11px] font-black italic text-[#2874f0] ml-auto">
                      f<span className="text-[#ffe500] font-sans">✓</span>Assured
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mt-2.5">
                    <span className="text-base sm:text-lg font-bold text-[#212121]">
                      ₹{product.price}
                    </span>
                    <span className="text-xs text-[#878787] line-through">
                      ₹{Math.round(product.price * 1.35)}
                    </span>
                    <span className="text-xs font-bold text-[#388e3c]">
                      25% off
                    </span>
                  </div>
                </Link>

                {/* Bottom Actions */}
                <div className="mt-3 pt-3 border-t border-[#f0f0f0] flex gap-2">
                  <Link
                    to={`/products/${product._id}`}
                    className="flex-1 text-center bg-[#2874f0] hover:bg-[#1b5bbd] text-white text-xs font-bold uppercase tracking-wider py-2 rounded-sm shadow-xs transition"
                  >
                    View Product
                  </Link>
                  <button
                    onClick={() => handleRemove(product._id)}
                    className="text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 px-3 py-2 rounded-sm transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;