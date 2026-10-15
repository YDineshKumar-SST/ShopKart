import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post("https://shopkart-dkq7.onrender.com/customers/login", formData, { withCredentials: true });
      console.log("Login Success:", response.data);
      navigate("/home");
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.response?.data?.message || "Invalid Credentials");
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6] flex flex-col justify-between font-sans">
      {/* Flipkart Header Strip */}
      <header className="bg-[#2874f0] shadow-sm py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex flex-col items-start leading-none group">
            <div className="flex items-center gap-1">
              <span className="text-xl sm:text-2xl font-black italic tracking-wide text-white">
                ShopKart
              </span>
              <svg className="w-5 h-5 text-[#ffe500] fill-current transform -rotate-12" viewBox="0 0 24 24">
                <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z" />
              </svg>
            </div>
            <span className="text-[10px] italic font-semibold text-white/90 flex items-center gap-0.5 mt-0.5">
              <span>Explore</span>
              <span className="text-[#ffe500] font-bold">Plus</span>
              <span className="text-[#ffe500] text-xs">✦</span>
            </span>
          </Link>
          <Link to="/products" className="text-xs sm:text-sm text-white font-medium hover:underline">
            Explore All Products &rarr;
          </Link>
        </div>
      </header>

      {/* Main Centered Split Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-3xl bg-white rounded-sm shadow-xl border border-[#e0e0e0] flex flex-col md:flex-row overflow-hidden min-h-[480px]">

          {/* Left Column: Flipkart Blue Panel */}
          <div className="md:w-5/12 bg-[#2874f0] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Login</h2>
              <p className="mt-4 text-sm sm:text-base text-blue-100 leading-relaxed font-normal">
                Get access to your Orders, Wishlist and Recommendations.
              </p>
            </div>

            {/* Shopping Graphic / Illustration */}
            <div className="mt-8 flex justify-center relative z-10">
              <div className="w-32 h-32 rounded-full bg-blue-500/30 flex items-center justify-center">
                <svg className="w-20 h-20 text-[#ffe500] fill-current" viewBox="0 0 24 24">
                  <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z" />
                </svg>
              </div>
            </div>

            {/* Subtle background decoration */}
            <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-blue-400/20 blur-2xl pointer-events-none"></div>
          </div>

          {/* Right Column: White Form Panel */}
          <div className="md:w-7/12 p-8 sm:p-10 flex flex-col justify-between bg-white">
            <div>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-5 rounded-xs">
                  <p className="text-xs font-semibold text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[#878787] uppercase tracking-wider mb-1">
                    Enter Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="e.g. user@domain.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 border-b-2 border-[#e0e0e0] focus:border-[#2874f0] text-sm text-[#212121] outline-none transition bg-transparent placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#878787] uppercase tracking-wider mb-1">
                    Enter Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 border-b-2 border-[#e0e0e0] focus:border-[#2874f0] text-sm text-[#212121] outline-none transition bg-transparent placeholder-gray-400"
                  />
                </div>

                <p className="text-[11px] text-[#878787] leading-relaxed">
                  By continuing, you agree to ShopKart's{" "}
                  <span className="text-[#2874f0] hover:underline cursor-pointer">Terms of Use</span> and{" "}
                  <span className="text-[#2874f0] hover:underline cursor-pointer">Privacy Policy</span>.
                </p>

                {/* Flipkart Orange CTA Button */}
                <button
                  type="submit"
                  className="w-full bg-[#fb641b] hover:bg-[#e55b17] text-white text-sm font-bold uppercase tracking-wider py-3 rounded-sm shadow-md transition active:scale-98"
                >
                  Request OTP / Sign In
                </button>
              </form>
            </div>

            {/* Bottom Register Link */}
            <div className="pt-6 border-t border-[#f0f0f0] mt-6 text-center">
              <Link
                to="/register"
                className="text-xs sm:text-sm font-bold text-[#2874f0] hover:text-[#1b5bbd] transition"
              >
                New to ShopKart? Create an account &rarr;
              </Link>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-[#878787] border-t border-[#e0e0e0] bg-white">
        ShopKart &copy; 2026. All rights reserved. 100% Genuine Products guaranteed.
      </footer>
    </div>
  );
};

export default Login;