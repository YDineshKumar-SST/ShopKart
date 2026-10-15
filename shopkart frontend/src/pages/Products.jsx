import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

const CATEGORY_OPTIONS = ["All Categories", "Electronics", "Fashion", "Books", "Home"];

const Products = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const initialSearch = searchParams.get("search") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState("");

  const [wishlistStatus, setWishlistStatus] = useState({});
  const [cartStatus, setCartStatus] = useState({});

  const navigate = useNavigate();
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();

  // Sync if URL search params change
  useEffect(() => {
    const urlCategory = searchParams.get("category");
    const urlSearch = searchParams.get("search");
    if (urlCategory !== null) setCategory(urlCategory);
    if (urlSearch !== null) setSearch(urlSearch);
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get("https://shopkart-dkq7.onrender.com/products", {
          params: { search, category, sort },
          withCredentials: true
        });
        setProducts(response.data.products);
        setError("");
      } catch (err) {
        if (err.response && err.response.status === 401) {
          navigate("/login");
        } else {
          setError("Something went wrong while loading products.");
        }
      } finally {
        setLoading(false);
      }
    };

    const delayTimer = setTimeout(() => {
      fetchProducts();
    }, 400);

    return () => clearTimeout(delayTimer);
  }, [search, category, sort, navigate]);

  const handleAddToWishlist = async (e, productId) => {
    e.preventDefault();
    setWishlistStatus(prev => ({ ...prev, [productId]: 'saving' }));
    try {
      await axios.post(`https://shopkart-dkq7.onrender.com/wishlist/${productId}`, {}, { withCredentials: true });
      setWishlistStatus(prev => ({ ...prev, [productId]: 'added' }));
    } catch (err) {
      if (err.response && err.response.status === 401) navigate("/login");
      else if (err.response && err.response.status === 409) setWishlistStatus(prev => ({ ...prev, [productId]: 'added' }));
      else {
        setWishlistStatus(prev => ({ ...prev, [productId]: 'error' }));
        alert("Unable to save product. Please try again.");
      }
    }
  };

  const handleAddToCart = async (e, productId) => {
    e.preventDefault();
    setCartStatus(prev => ({ ...prev, [productId]: 'adding' }));

    const result = await addToCart(productId);

    if (result.success) {
      setCartStatus(prev => ({ ...prev, [productId]: null }));
    } else {
      setCartStatus(prev => ({ ...prev, [productId]: 'error' }));
      alert(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6] flex flex-col font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 py-4 space-y-4">
        {/* Flipkart Filter & Search Ribbon */}
        <div className="bg-white rounded-sm border border-[#e0e0e0] shadow-sm p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

            {/* Search Input with icon */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search products in ShopKart..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-[#d5d7db] rounded-sm text-sm text-[#212121] focus:outline-none focus:border-[#2874f0] focus:ring-1 focus:ring-[#2874f0] transition"
              />
              <svg className="w-4 h-4 text-[#878787] absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#878787] hover:text-[#212121]"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Select */}
            <div className="flex items-center gap-2">
              <label htmlFor="category-select" className="text-xs font-bold text-[#878787] uppercase whitespace-nowrap">
                Category:
              </label>
              <select
                id="category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border border-[#d5d7db] bg-white text-sm text-[#212121] font-medium py-1.5 px-3 rounded-sm focus:outline-none focus:border-[#2874f0] cursor-pointer"
              >
                {CATEGORY_OPTIONS.map((cat, idx) => (
                  <option key={idx} value={cat === "All Categories" ? "" : cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Flipkart Sort By Tabs */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-6 border-t border-[#f0f0f0] mt-4 pt-3 text-xs sm:text-sm">
            <span className="font-bold text-[#212121] uppercase text-xs tracking-wider mr-1">
              Sort By
            </span>

            <button
              onClick={() => setSort("")}
              className={`py-1.5 px-2 font-medium transition border-b-2 ${sort === ""
                  ? "border-[#2874f0] text-[#2874f0] font-bold"
                  : "border-transparent text-[#212121] hover:text-[#2874f0]"
                }`}
            >
              Relevance
            </button>

            <button
              onClick={() => setSort("price_asc")}
              className={`py-1.5 px-2 font-medium transition border-b-2 ${sort === "price_asc"
                  ? "border-[#2874f0] text-[#2874f0] font-bold"
                  : "border-transparent text-[#212121] hover:text-[#2874f0]"
                }`}
            >
              Price -- Low to High
            </button>

            <button
              onClick={() => setSort("price_desc")}
              className={`py-1.5 px-2 font-medium transition border-b-2 ${sort === "price_desc"
                  ? "border-[#2874f0] text-[#2874f0] font-bold"
                  : "border-transparent text-[#212121] hover:text-[#2874f0]"
                }`}
            >
              Price -- High to Low
            </button>

            <span className="ml-auto text-xs text-[#878787] hidden md:inline">
              {!loading && `${products.length} products found`}
            </span>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="bg-white rounded-sm border border-[#e0e0e0] p-16 text-center shadow-sm">
            <div className="inline-block animate-spin rounded-full h-9 w-9 border-4 border-[#2874f0] border-t-transparent mb-3"></div>
            <p className="text-sm font-semibold text-[#878787]">Loading products from ShopKart...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-sm border border-red-200 p-12 text-center shadow-sm">
            <div className="text-4xl mb-2">⚠️</div>
            <p className="text-base text-red-600 font-bold mb-3">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#2874f0] text-white text-xs font-bold uppercase px-4 py-2 rounded-sm"
            >
              Reload Page
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-sm border border-[#e0e0e0] p-16 text-center shadow-sm">
            <div className="text-5xl mb-3">🔍</div>
            <h3 className="text-lg font-bold text-[#212121] mb-1">Sorry, no products found!</h3>
            <p className="text-xs text-[#878787] mb-6">Please check the spelling or try searching for something else.</p>
            <button
              onClick={() => { setSearch(""); setCategory(""); setSort(""); }}
              className="bg-[#2874f0] text-white text-xs font-bold uppercase px-5 py-2.5 rounded-sm shadow-sm hover:bg-[#1b5bbd]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {products.map((product) => {
              const cartItem = cart.find(item => item.product?._id === product._id);
              const isWishlisted = wishlistStatus[product._id] === 'added';
              const isWishlistSaving = wishlistStatus[product._id] === 'saving';

              return (
                <div
                  key={product._id}
                  className="bg-white border border-[#f0f0f0] hover:border-[#e0e0e0] hover:shadow-lg transition-all duration-200 rounded-sm p-4 flex flex-col justify-between relative group"
                >
                  {/* Floating Wishlist Heart Icon */}
                  <button
                    onClick={(e) => handleAddToWishlist(e, product._id)}
                    disabled={isWishlistSaving}
                    title={isWishlisted ? "Saved in Wishlist" : "Add to Wishlist"}
                    className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-sm flex items-center justify-center transition hover:scale-110"
                    aria-label="Toggle Wishlist"
                  >
                    <svg
                      className={`w-5 h-5 transition-colors ${isWishlisted
                          ? "text-red-500 fill-current"
                          : "text-gray-300 hover:text-red-400 fill-transparent stroke-current stroke-2"
                        }`}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>

                  <Link to={`/products/${product._id}`} className="block">
                    {/* Product Image */}
                    <div className="w-full h-48 sm:h-52 flex items-center justify-center overflow-hidden bg-white mb-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Product Name */}
                    <h2 className="text-sm font-medium text-[#212121] group-hover:text-[#2874f0] line-clamp-2 leading-snug transition-colors">
                      {product.name}
                    </h2>

                    {/* Category */}
                    <p className="text-xs text-[#878787] mt-1">{product.category}</p>

                    {/* Flipkart Rating & Assured Badge */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-0.5 bg-[#388e3c] text-white text-[11px] font-bold px-1.5 py-0.5 rounded leading-none">
                        <span>4.2</span>
                        <span className="text-[9px]">★</span>
                      </span>
                      <span className="text-[11px] text-[#878787]">(842)</span>

                      <span className="text-[11px] font-black italic text-[#2874f0] ml-auto">
                        f<span className="text-[#ffe500] font-sans">✓</span>Assured
                      </span>
                    </div>

                    {/* Price Row */}
                    <div className="flex items-baseline gap-2 mt-2">
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

                    {/* Stock Status */}
                    <p className={`text-[11px] mt-1 font-semibold ${product.stock > 0 ? 'text-[#388e3c]' : 'text-red-600'}`}>
                      {product.stock > 0 ? `In Stock (${product.stock} units left)` : 'Out of Stock'}
                    </p>
                  </Link>

                  {/* Flipkart Action Buttons */}
                  <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-[#f0f0f0]">
                    {cartItem ? (
                      /* Flipkart Quantity Stepper */
                      <div className="flex items-center justify-between border border-[#2874f0] rounded-sm bg-blue-50/50 overflow-hidden w-full h-[36px]">
                        <button
                          onClick={() => {
                            if (cartItem.quantity <= 1) {
                              removeFromCart(product._id);
                            } else {
                              updateQuantity(product._id, cartItem.quantity - 1);
                            }
                          }}
                          className="px-3 py-1 text-[#2874f0] font-black hover:bg-[#2874f0] hover:text-white transition text-base w-1/3 flex items-center justify-center"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="font-bold text-xs text-[#2874f0] flex-1 text-center">
                          Qty: {cartItem.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product._id, cartItem.quantity + 1)}
                          disabled={cartItem.quantity >= product.stock}
                          className="px-3 py-1 text-[#2874f0] font-black hover:bg-[#2874f0] hover:text-white transition text-base w-1/3 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#2874f0] flex items-center justify-center"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      /* Flipkart Add to Cart Button (Warm Amber) */
                      <button
                        onClick={(e) => handleAddToCart(e, product._id)}
                        disabled={cartStatus[product._id] === 'adding' || product.stock < 1}
                        className={`w-full font-bold text-xs uppercase tracking-wider py-2.5 rounded-sm transition flex items-center justify-center gap-1.5 h-[36px] shadow-xs ${cartStatus[product._id] === 'adding'
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            : product.stock < 1
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-[#ff9f00] hover:bg-[#f39700] text-white active:scale-98'
                          }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>{cartStatus[product._id] === 'adding' ? 'Adding...' : 'Add to Cart'}</span>
                      </button>
                    )}

                    {/* View Details Link */}
                    <Link
                      to={`/products/${product._id}`}
                      className="w-full text-center text-xs font-semibold text-[#2874f0] hover:text-[#1b5bbd] py-1 border border-[#e0e0e0] hover:border-[#2874f0] rounded-sm transition"
                    >
                      View Details &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;