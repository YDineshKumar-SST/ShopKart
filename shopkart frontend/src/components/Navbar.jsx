import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext"; 

const Navbar = () => {
  const navigate = useNavigate();
  const { cartCount } = useCart(); 
  const [navSearch, setNavSearch] = useState("");

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:3000/customers/logout", {}, { withCredentials: true });
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/products?search=${encodeURIComponent(navSearch.trim())}`);
    } else {
      navigate("/products");
    }
  };

  return (
    <nav className="bg-[#2874f0] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16 gap-3 md:gap-6">
          
          {/* Flipkart Style Logo */}
          <Link to="/" className="flex flex-col items-start leading-none group flex-shrink-0">
            <div className="flex items-center gap-1">
              <span className="text-xl md:text-2xl font-black italic tracking-wide text-white font-sans">
                ShopKart
              </span>
              <svg className="w-5 h-5 text-[#ffe500] fill-current transform -rotate-12 group-hover:scale-110 transition" viewBox="0 0 24 24">
                <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z"/>
              </svg>
            </div>
            <div className="text-[10px] md:text-[11px] italic font-semibold text-white/90 flex items-center gap-0.5 tracking-tight mt-0.5">
              <span>Explore</span>
              <span className="text-[#ffe500] font-bold">Plus</span>
              <span className="text-[#ffe500] text-xs">✦</span>
            </div>
          </Link>

          {/* Flipkart Search Bar */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="flex-1 max-w-xl hidden sm:flex items-center relative"
          >
            <input
              type="text"
              placeholder="Search for products, brands and more"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              className="w-full bg-white text-[#212121] placeholder-gray-400 text-sm px-4 py-2 pr-10 rounded-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-[#ffe500]"
            />
            <button 
              type="submit" 
              className="absolute right-0 top-0 bottom-0 px-3 text-[#2874f0] hover:text-[#1b5bbd] transition flex items-center justify-center"
              aria-label="Search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {/* Right Navigation Actions */}
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6 flex-shrink-0 text-sm font-semibold">
            
            {/* All Products Link */}
            <Link 
              to="/products" 
              className="hidden md:flex items-center gap-1.5 text-white hover:text-[#ffe500] transition py-1 px-2 rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Products</span>
            </Link>

            {/* Wishlist Link */}
            <Link 
              to="/wishlist" 
              className="flex items-center gap-1 text-white hover:text-[#ffe500] transition py-1 px-2 rounded"
            >
              <svg className="w-4 h-4 text-red-300 fill-current" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span className="hidden sm:inline">Wishlist</span>
            </Link>

            {/* Orders Link */}
            <Link 
              to="/orders" 
              className="hidden md:flex items-center gap-1 text-white hover:text-[#ffe500] transition py-1 px-2 rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>Orders</span>
            </Link>

            {/* Cart Link with Flipkart Yellow Badge */}
            <Link 
              to="/cart" 
              className="flex items-center gap-1.5 text-white hover:text-[#ffe500] transition py-1 px-2 rounded relative"
            >
              <div className="relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-[#ffe500] text-[#2874f0] text-[11px] font-extrabold px-1.5 py-0.2 rounded-full min-w-[18px] text-center leading-tight shadow-sm border border-white/40">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Cart</span>
            </Link>

            {/* Flipkart White Account Button */}
            <Link 
              to="/profile" 
              className="bg-white text-[#2874f0] hover:bg-gray-100 font-semibold px-3 sm:px-5 py-1.5 rounded-sm shadow-sm transition flex items-center gap-1 text-xs sm:text-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Account</span>
            </Link>

            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="text-white/90 hover:text-white text-xs font-semibold px-2.5 py-1 rounded border border-white/30 hover:border-white/80 transition"
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="sm:hidden pb-2.5 pt-0.5">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              placeholder="Search for products, brands and more"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              className="w-full bg-white text-[#212121] placeholder-gray-400 text-xs px-3 py-2 pr-9 rounded-sm shadow-inner focus:outline-none"
            />
            <button 
              type="submit" 
              className="absolute right-0 top-0 bottom-0 px-3 text-[#2874f0]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;