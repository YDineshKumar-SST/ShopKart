import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [wishlistStatus, setWishlistStatus] = useState("");
  const [cartStatus, setCartStatus] = useState("");
  
  const navigate = useNavigate();
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/products/${id}`, { withCredentials: true });
        setProduct(res.data.product);
      } catch {
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToWishlist = async () => {
    setWishlistStatus('saving');
    try {
      await axios.post(`http://localhost:3000/wishlist/${id}`, {}, { withCredentials: true });
      setWishlistStatus('added');
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else if (err.response?.status === 409) setWishlistStatus('added');
      else {
        setWishlistStatus('error');
        alert("Unable to save product.");
      }
    }
  };

  const handleAddToCart = async () => {
    setCartStatus('adding');
    const result = await addToCart(id);
    if (result.success) {
      setCartStatus(null);
    } else {
      setCartStatus('error');
      alert(result.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] flex flex-col font-sans">
        <Navbar />
        <div className="max-w-7xl mx-auto w-full p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#2874f0] border-t-transparent mb-4"></div>
          <p className="text-base font-semibold text-[#878787]">Loading product specifications...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] flex flex-col font-sans">
        <Navbar />
        <div className="max-w-xl mx-auto mt-16 p-8 bg-white border border-[#e0e0e0] rounded-sm text-center shadow-sm">
          <div className="text-5xl mb-3">⚠️</div>
          <h2 className="text-xl font-bold text-[#212121] mb-2">Product Not Found</h2>
          <p className="text-sm text-[#878787] mb-6">The product you are looking for might have been moved or is currently unavailable.</p>
          <Link
            to="/products"
            className="inline-block bg-[#2874f0] text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-sm"
          >
            Browse Other Products
          </Link>
        </div>
      </div>
    );
  }

  const cartItem = cart.find(item => item.product?._id === product._id);
  const isWishlisted = wishlistStatus === 'added';
  const isWishlistSaving = wishlistStatus === 'saving';

  return (
    <div className="min-h-screen bg-[#f1f3f6] flex flex-col font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 py-4 space-y-4">
        {/* Flipkart Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs text-[#878787]">
          <Link to="/" className="hover:text-[#2874f0] transition">Home</Link>
          <span>&gt;</span>
          <Link to="/products" className="hover:text-[#2874f0] transition">Products</Link>
          <span>&gt;</span>
          <Link to={`/products?category=${product.category}`} className="hover:text-[#2874f0] transition font-medium">
            {product.category}
          </Link>
          <span>&gt;</span>
          <span className="text-[#212121] truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
        </div>

        {/* Main Product Container */}
        <div className="bg-white rounded-sm border border-[#e0e0e0] shadow-sm p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Left Column: Image & Sticky Action Buttons */}
          <div className="lg:w-5/12 flex flex-col">
            <div className="relative border border-[#f0f0f0] rounded-sm p-6 bg-white flex items-center justify-center min-h-[350px] sm:min-h-[420px]">
              {/* Floating Wishlist Heart */}
              <button
                onClick={handleAddToWishlist}
                disabled={isWishlistSaving}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white border border-[#e0e0e0] shadow-sm flex items-center justify-center hover:scale-110 transition"
                title={isWishlisted ? "Saved in Wishlist" : "Add to Wishlist"}
              >
                <svg
                  className={`w-6 h-6 transition-colors ${
                    isWishlisted
                      ? "text-red-500 fill-current"
                      : "text-gray-300 hover:text-red-400 fill-transparent stroke-current stroke-2"
                  }`}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </button>

              <img
                src={product.image}
                alt={product.name}
                className="max-h-[340px] sm:max-h-[380px] max-w-full object-contain"
              />
            </div>

            {/* Flipkart Action Buttons (Add to Cart / Buy Now) */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              {cartItem ? (
                <div className="flex items-center justify-between border-2 border-[#2874f0] rounded-sm bg-blue-50/60 overflow-hidden h-[48px]">
                  <button
                    onClick={() => {
                      if (cartItem.quantity <= 1) {
                        removeFromCart(product._id);
                      } else {
                        updateQuantity(product._id, cartItem.quantity - 1);
                      }
                    }}
                    className="px-4 py-2 text-[#2874f0] font-black hover:bg-[#2874f0] hover:text-white transition text-lg w-1/3 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="font-bold text-sm text-[#2874f0] flex-1 text-center">
                    Qty: {cartItem.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(product._id, cartItem.quantity + 1)}
                    disabled={cartItem.quantity >= product.stock}
                    className="px-4 py-2 text-[#2874f0] font-black hover:bg-[#2874f0] hover:text-white transition text-lg w-1/3 disabled:opacity-30 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={cartStatus === 'adding' || product.stock < 1}
                  className={`font-bold text-xs sm:text-sm uppercase tracking-wider py-3.5 px-4 rounded-sm transition flex items-center justify-center gap-2 shadow-sm ${
                    cartStatus === 'adding'
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : product.stock < 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[#ff9f00] hover:bg-[#f39700] text-white active:scale-98'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>{cartStatus === 'adding' ? 'Adding...' : 'Add to Cart'}</span>
                </button>
              )}

              {/* Flipkart Buy Now / Cart Action */}
              <button
                onClick={() => {
                  if (!cartItem && product.stock > 0) {
                    addToCart(id).then(() => navigate("/cart"));
                  } else {
                    navigate("/cart");
                  }
                }}
                disabled={product.stock < 1}
                className="bg-[#fb641b] hover:bg-[#e55b17] disabled:bg-gray-300 text-white font-bold text-xs sm:text-sm uppercase tracking-wider py-3.5 px-4 rounded-sm shadow-sm transition flex items-center justify-center gap-2 active:scale-98"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                <span>{cartItem ? 'Go to Cart' : 'Buy Now'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Product Details & Specifications */}
          <div className="lg:w-7/12 flex flex-col justify-start">
            
            {/* Category */}
            <span className="text-xs text-[#878787] uppercase font-bold tracking-wider">
              {product.category}
            </span>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-medium text-[#212121] mt-1 leading-snug">
              {product.name}
            </h1>

            {/* Rating & Assured Banner */}
            <div className="flex items-center gap-3 mt-2.5">
              <span className="inline-flex items-center gap-1 bg-[#388e3c] text-white text-xs font-bold px-2 py-0.5 rounded leading-none">
                <span>4.3</span>
                <span className="text-[10px]">★</span>
              </span>
              <span className="text-xs font-semibold text-[#878787]">
                2,481 Ratings &amp; 342 Reviews
              </span>
              <span className="text-sm font-black italic text-[#2874f0] ml-2">
                f<span className="text-[#ffe500] font-sans">✓</span>Assured
              </span>
            </div>

            {/* Price Section */}
            <div className="mt-4 pt-3 border-t border-[#f0f0f0]">
              <span className="text-xs font-bold text-[#388e3c]">Special price</span>
              <div className="flex items-baseline gap-3 mt-0.5">
                <span className="text-3xl font-bold text-[#212121]">₹{product.price}</span>
                <span className="text-base text-[#878787] line-through">₹{Math.round(product.price * 1.35)}</span>
                <span className="text-base font-bold text-[#388e3c]">25% off</span>
              </div>
            </div>

            {/* Stock Availability */}
            <div className="mt-3">
              {product.stock > 0 ? (
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#388e3c] bg-[#e8f7ee] px-2.5 py-1 rounded-sm">
                  <span>●</span>
                  <span>In Stock ({product.stock} units available)</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-sm">
                  <span>●</span>
                  <span>Currently Out of Stock</span>
                </div>
              )}
            </div>

            {/* Flipkart Available Offers Box */}
            <div className="mt-5 p-4 bg-[#fbfbfb] border border-[#f0f0f0] rounded-sm space-y-2.5">
              <h3 className="text-xs font-bold text-[#212121] uppercase tracking-wider flex items-center gap-1.5">
                <span>🏷️</span>
                <span>Available Offers</span>
              </h3>
              <ul className="text-xs text-[#212121] space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[#388e3c] font-bold">●</span>
                  <span><strong>Bank Offer:</strong> 5% Unlimited Cashback on Flipkart Axis Bank Credit Card</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#388e3c] font-bold">●</span>
                  <span><strong>Special Price:</strong> Get extra ₹150 off on orders above ₹999</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#388e3c] font-bold">●</span>
                  <span><strong>Partner Offer:</strong> Sign up for ShopKart Pay Later &amp; get ₹250 Gift Card</span>
                </li>
              </ul>
            </div>

            {/* Description / Highlights */}
            <div className="mt-6">
              <h3 className="text-xs font-bold text-[#878787] uppercase tracking-wider mb-2">
                Product Description
              </h3>
              <p className="text-sm text-[#212121] leading-relaxed bg-[#f9f9f9] p-4 rounded-sm border border-[#f0f0f0]">
                {product.description || "Designed with premium grade materials ensuring superior durability, modern aesthetics, and daily ease of use. Ideal for quality-conscious consumers."}
              </p>
            </div>

            {/* Flipkart Trust / Services Details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-4 border-t border-[#f0f0f0] text-xs text-[#212121]">
              <div className="flex items-center gap-2">
                <span className="text-lg">🚚</span>
                <div>
                  <p className="font-bold">Free Delivery</p>
                  <p className="text-[#878787] text-[11px]">By tomorrow</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🔄</span>
                <div>
                  <p className="font-bold">7 Days Return</p>
                  <p className="text-[#878787] text-[11px]">Hassle-free policy</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">💵</span>
                <div>
                  <p className="font-bold">Cash On Delivery</p>
                  <p className="text-[#878787] text-[11px]">Available</p>
                </div>
              </div>
            </div>

            {/* Wishlist Action Button */}
            <div className="mt-6 pt-4 border-t border-[#f0f0f0]">
              <button
                onClick={handleAddToWishlist}
                disabled={isWishlistSaving}
                className={`w-full sm:w-auto text-xs font-bold px-6 py-2.5 rounded-sm border transition flex items-center justify-center gap-2 ${
                  isWishlisted
                    ? 'border-red-300 bg-red-50 text-red-600'
                    : 'border-[#d5d7db] bg-white text-[#212121] hover:bg-gray-50'
                }`}
              >
                <span>{isWishlisted ? '❤️ Saved to Wishlist' : '♡ Add to Wishlist'}</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;