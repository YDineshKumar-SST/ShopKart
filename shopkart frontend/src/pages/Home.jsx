import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

const CATEGORIES = [
  { name: "All Offers", query: "", icon: "🏷️" },
  { name: "Electronics", query: "Electronics", icon: "💻" },
  { name: "Fashion", query: "Fashion", icon: "👕" },
  { name: "Home", query: "Home", icon: "🏠" },
  { name: "Books", query: "Books", icon: "📚" },
];

const Home = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await axios.get("https://shopkart-dkq7.onrender.com/customers/me", {
          withCredentials: true
        });
      } catch {
        navigate("/login");
      }
    };
    verifyAuth();
  }, [navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("https://shopkart-dkq7.onrender.com/products", { withCredentials: true });
        const productsData = res.data.products;

        setFeaturedProducts(productsData.slice(0, 8));

        const dynamicBanners = productsData.slice(0, 3).map((product, index) => {
          if (product.image && (product.image.startsWith("http") || product.image.startsWith("data:image"))) {
            return product.image;
          } else {
            const fallbacks = [
              "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&q=80",
              "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=80",
              "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1400&q=80"
            ];
            return fallbacks[index % 3];
          }
        });

        if (dynamicBanners.length === 0) {
          setBanners([
            "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&q=80",
            "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=80",
            "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1400&q=80"
          ]);
        } else {
          setBanners(dynamicBanners);
        }

      } catch {
        console.error("Failed to load products");
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;

    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(slideInterval);
  }, [banners.length]);

  return (
    <div className="min-h-screen bg-[#f1f3f6] flex flex-col font-sans">
      <Navbar />

      {/* Flipkart Category Strip */}
      <div className="bg-white border-b border-[#e0e0e0] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between sm:justify-center sm:gap-12 overflow-x-auto text-center scrollbar-none">
          {CATEGORIES.map((cat, idx) => (
            <Link
              key={idx}
              to={cat.query ? `/products?category=${cat.query}` : "/products"}
              className="flex flex-col items-center min-w-[70px] group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-blue-50 group-hover:bg-[#2874f0]/10 flex items-center justify-center text-xl transition-transform group-hover:scale-110 mb-1">
                {cat.icon}
              </div>
              <span className="text-xs font-semibold text-[#212121] group-hover:text-[#2874f0] transition-colors whitespace-nowrap">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 py-3 space-y-4">
        {/* Flipkart Banner Carousel */}
        {banners.length > 0 && (
          <div className="relative w-full h-[220px] sm:h-[320px] md:h-[380px] overflow-hidden rounded-sm bg-white shadow-sm border border-[#e0e0e0]">
            {banners.map((banner, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
              >
                <img
                  src={banner}
                  alt={`Promotional Banner ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* Flipkart Overlay Gradient and Promo Tag */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent flex flex-col justify-center px-6 sm:px-12 text-white">
                  <span className="bg-[#ffe500] text-[#2874f0] text-xs font-extrabold uppercase px-2.5 py-1 rounded-sm w-fit mb-2 shadow">
                    Big Saving Days
                  </span>
                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-black mb-2 drop-shadow-md tracking-tight">
                    Welcome to ShopKart
                  </h1>
                  <p className="text-sm sm:text-lg mb-4 text-gray-100 max-w-md line-clamp-2">
                    India's favorite online destination for the best deals and trusted brands.
                  </p>
                  <div>
                    <Link
                      to="/products"
                      className="inline-flex items-center gap-2 bg-[#fb641b] hover:bg-[#e55b17] text-white font-bold text-sm sm:text-base px-6 py-2.5 rounded-sm shadow-md transition transform active:scale-95"
                    >
                      <span>Explore Deals</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {/* Prev / Next Controls */}
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-[#212121] p-2 rounded-r-md shadow-md transition focus:outline-none"
              aria-label="Previous Slide"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % banners.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-[#212121] p-2 rounded-l-md shadow-md transition focus:outline-none"
              aria-label="Next Slide"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Flipkart Dot Indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all ${index === currentSlide ? "w-6 bg-[#2874f0]" : "w-2 bg-white/70 hover:bg-white"
                    }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Featured Deals / Best of ShopKart (Flipkart Deals Section) */}
        <div className="bg-white rounded-sm border border-[#e0e0e0] shadow-sm">
          {/* Section Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#f0f0f0]">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#212121] tracking-tight">
                  Deals of the Day
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-[#878787] mt-0.5">
                  <svg className="w-3.5 h-3.5 text-[#2874f0]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span>Handpicked offers with extra discount</span>
                </div>
              </div>
            </div>

            <Link
              to="/products"
              className="bg-[#2874f0] hover:bg-[#1b5bbd] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-sm shadow-sm transition"
            >
              View All
            </Link>
          </div>

          {/* Product Grid */}
          <div className="p-4 sm:p-6">
            {featuredProducts.length === 0 ? (
              <div className="py-16 text-center text-[#878787]">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#2874f0] border-t-transparent mb-3"></div>
                <p className="font-semibold text-sm">Loading best offers for you...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {featuredProducts.map((product) => (
                  <Link
                    to={`/products/${product._id}`}
                    key={product._id}
                    className="group bg-white rounded-sm border border-[#f0f0f0] hover:border-[#e0e0e0] hover:shadow-lg transition-all duration-200 p-3 sm:p-4 flex flex-col justify-between"
                  >
                    <div>
                      {/* Product Image Container */}
                      <div className="relative w-full h-44 sm:h-52 flex items-center justify-center overflow-hidden bg-white mb-3">
                        <img
                          src={
                            product.image && product.image.length > 10
                              ? product.image
                              : "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500&q=80"
                          }
                          alt={product.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Title & Category */}
                      <h3 className="font-medium text-[#212121] group-hover:text-[#2874f0] text-sm truncate transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-[#878787] mt-0.5 truncate">{product.category}</p>

                      {/* Flipkart Rating Badge */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-0.5 bg-[#388e3c] text-white text-[11px] font-bold px-1.5 py-0.5 rounded leading-none">
                          <span>4.2</span>
                          <span className="text-[10px]">★</span>
                        </span>
                        <span className="text-[11px] text-[#878787]">(1,420)</span>
                      </div>
                    </div>

                    {/* Price and Assured Tag */}
                    <div className="mt-3 pt-2 border-t border-[#f7f7f7]">
                      <div className="flex items-baseline gap-2">
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

                      {/* Flipkart Assured Badge */}
                      <div className="flex items-center gap-1 mt-1.5">
                        <span className="text-[11px] font-black italic text-[#2874f0]">
                          f<span className="text-[#ffe500] font-sans">✓</span>Assured
                        </span>
                        <span className="text-[10px] text-[#878787] ml-auto">Free delivery</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Flipkart Trust Strip */}
        <div className="bg-white rounded-sm border border-[#e0e0e0] shadow-sm p-4 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="flex flex-col items-center p-2">
            <span className="text-3xl mb-1">🏷️</span>
            <h4 className="text-sm font-bold text-[#212121]">100% Authentic</h4>
            <p className="text-xs text-[#878787] mt-0.5">Directly from verified brands</p>
          </div>
          <div className="flex flex-col items-center p-2">
            <span className="text-3xl mb-1">🚚</span>
            <h4 className="text-sm font-bold text-[#212121]">Free &amp; Fast Delivery</h4>
            <p className="text-xs text-[#878787] mt-0.5">On all eligible orders</p>
          </div>
          <div className="flex flex-col items-center p-2">
            <span className="text-3xl mb-1">🔄</span>
            <h4 className="text-sm font-bold text-[#212121]">7-Day Easy Returns</h4>
            <p className="text-xs text-[#878787] mt-0.5">Hassle-free exchange policy</p>
          </div>
          <div className="flex flex-col items-center p-2">
            <span className="text-3xl mb-1">🛡️</span>
            <h4 className="text-sm font-bold text-[#212121]">Secure Payments</h4>
            <p className="text-xs text-[#878787] mt-0.5">UPI, Cards, NetBanking &amp; COD</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;