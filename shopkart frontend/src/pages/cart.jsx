import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const navigate = useNavigate();
  const { cart, loading, updateQuantity, removeFromCart, cartSubtotal, cartCount, fetchCart } = useCart();
  const estimatedSavings = Math.round(cartSubtotal * 0.28);
  const totalMRP = cartSubtotal + estimatedSavings;

  // Checkout & Address State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userProfile, setUserProfile] = useState(null);

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: ""
  });

  // Fetch logged in customer profile to prefill name & phone
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("https://shopkart-dkq7.onrender.com/customers/me", { withCredentials: true });
        if (res.data?.customer) {
          setUserProfile(res.data.customer);
          setAddress((prev) => ({
            ...prev,
            name: prev.name || res.data.customer.fullName || "",
            phone: prev.phone || res.data.customer.phone || ""
          }));
        }
      } catch {
        // Guest / not logged in
      }
    };
    fetchUser();
  }, []);

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  // Helper to ensure Razorpay SDK script is loaded
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle Razorpay Payment Flow
  const handlePayment = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Validate Address fields
    if (!address.name || !address.phone || !address.address || !address.city || !address.state || !address.pincode) {
      setErrorMessage("Please fill all address fields to proceed.");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Ensure Razorpay SDK is available
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setErrorMessage("Could not load Razorpay SDK. Please check your internet connection.");
        setIsProcessing(false);
        return;
      }

      // 2. Fetch Razorpay public Key ID from backend
      const keyRes = await axios.get("https://shopkart-dkq7.onrender.com/orders/razorpay-key", { withCredentials: true });
      const razorpayKey = keyRes.data?.keyId;

      if (!razorpayKey || razorpayKey.includes("placeholder") || razorpayKey.includes("your_key")) {
        setErrorMessage(
          "⚠️ Razorpay Key is not configured yet! Please update RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET in the backend .env file with your actual keys."
        );
        setIsProcessing(false);
        return;
      }

      // 3. Create Order on Backend
      const orderRes = await axios.post(
        "https://shopkart-dkq7.onrender.com/orders/create",
        { shippingAddress: address },
        { withCredentials: true }
      );

      if (!orderRes.data?.success) {
        setErrorMessage(orderRes.data?.message || "Failed to initiate payment");
        setIsProcessing(false);
        return;
      }

      const { orderId, amount, currency, dbOrderId } = orderRes.data;

      // 4. Configure Razorpay Checkout Options
      const options = {
        key: razorpayKey,
        amount: amount,
        currency: currency || "INR",
        name: "ShopKart",
        description: `Order #${dbOrderId.slice(-6).toUpperCase()} Payment`,
        image: "https://cdn-icons-png.flaticon.com/512/891/891462.png",
        order_id: orderId,
        handler: async function (response) {
          try {
            // 5. Verify payment signature with backend
            const verifyRes = await axios.post(
              "https://shopkart-dkq7.onrender.com/orders/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                dbOrderId: dbOrderId
              },
              { withCredentials: true }
            );

            if (verifyRes.data?.success) {
              await fetchCart();
              setIsCheckoutOpen(false);
              alert("🎉 Payment Successful! Your order has been placed.");
              navigate("/orders");
            } else {
              setErrorMessage("Payment verification failed. Please contact support.");
            }
          } catch (verErr) {
            console.error("Verification error", verErr);
            setErrorMessage(verErr.response?.data?.message || "Failed to verify transaction signature");
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: address.name,
          email: userProfile?.email || "customer@example.com",
          contact: address.phone
        },
        notes: {
          address: `${address.address}, ${address.city}, ${address.pincode}`
        },
        theme: {
          color: "#2874f0" // Flipkart blue brand color
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on("payment.failed", function (failResponse) {
        setErrorMessage(`Payment failed: ${failResponse.error?.description || "Transaction declined"}`);
        setIsProcessing(false);
      });

      rzpInstance.open();
    } catch (error) {
      console.error("Checkout Error:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      } else {
        setErrorMessage(
          error.response?.data?.message || "Something went wrong while initiating checkout. Please try again."
        );
      }
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6] flex flex-col font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 py-4 space-y-4">

        {loading ? (
          <div className="bg-white rounded-sm border border-[#e0e0e0] p-16 text-center shadow-sm">
            <div className="inline-block animate-spin rounded-full h-9 w-9 border-4 border-[#2874f0] border-t-transparent mb-3"></div>
            <p className="text-sm font-semibold text-[#878787]">Loading your ShopKart cart...</p>
          </div>
        ) : cart.length === 0 ? (
          <div className="bg-white border border-[#e0e0e0] rounded-sm p-10 sm:p-16 text-center shadow-sm max-w-2xl mx-auto my-8">
            <div className="w-40 h-40 mx-auto mb-4 flex items-center justify-center bg-blue-50 rounded-full">
              <svg className="w-20 h-20 text-[#2874f0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#212121] mb-1">Your cart is empty!</h3>
            <p className="text-xs sm:text-sm text-[#878787] mb-6">Explore our curated catalog and discover great deals today.</p>
            <Link
              to="/products"
              className="inline-block bg-[#2874f0] hover:bg-[#1b5bbd] text-white text-xs sm:text-sm font-bold uppercase tracking-wider px-8 py-3 rounded-sm shadow-sm transition active:scale-95"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-4 items-start">

            {/* Left Column: Cart Items List */}
            <div className="lg:w-8/12 w-full space-y-3">
              {/* Delivery Address Header (Flipkart style) */}
              <div className="bg-white border border-[#e0e0e0] rounded-sm p-3 sm:p-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#878787]">Deliver to:</span>
                  <span className="text-xs sm:text-sm font-bold text-[#212121]">Standard Home Delivery - Express</span>
                </div>
                <span className="text-xs font-bold text-[#2874f0] uppercase cursor-pointer hover:underline">
                  Free
                </span>
              </div>

              {/* Items Card */}
              <div className="bg-white border border-[#e0e0e0] rounded-sm shadow-sm divide-y divide-[#f0f0f0]">
                {cart.map((item) => (
                  <div key={item.product?._id} className="p-4 sm:p-6 transition hover:bg-slate-50/40">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">

                      {/* Product Thumbnail */}
                      <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 flex items-center justify-center bg-white border border-[#f0f0f0] rounded-sm p-2">
                        <img
                          src={item.product?.image}
                          alt={item.product?.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div>
                            <Link
                              to={`/products/${item.product?._id}`}
                              className="font-medium text-[#212121] hover:text-[#2874f0] text-sm sm:text-base leading-snug transition"
                            >
                              {item.product?.name}
                            </Link>
                            <p className="text-xs text-[#878787] mt-0.5">{item.product?.category}</p>

                            {/* Seller & Assured */}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-[#878787]">Seller: RetailNet</span>
                              <span className="text-xs font-black italic text-[#2874f0]">
                                f<span className="text-[#ffe500] font-sans">✓</span>Assured
                              </span>
                            </div>
                          </div>

                          <div className="text-left sm:text-right">
                            <span className="text-xs text-[#212121]">Delivery by Tomorrow | </span>
                            <span className="text-xs text-[#388e3c] font-semibold">Free</span>
                          </div>
                        </div>

                        {/* Price Details */}
                        <div className="flex items-baseline gap-2.5 mt-3">
                          <span className="text-xs text-[#878787] line-through">
                            ₹{Math.round((item.product?.price || 0) * 1.35 * item.quantity)}
                          </span>
                          <span className="text-lg font-bold text-[#212121]">
                            ₹{(item.product?.price || 0) * item.quantity}
                          </span>
                          <span className="text-xs font-bold text-[#388e3c]">
                            25% Off
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Flipkart Quantity Controls & Action Buttons */}
                    <div className="flex items-center gap-4 sm:gap-6 mt-4 pt-3 border-t border-[#f7f7f7]">
                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product?._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-7 h-7 rounded-full border border-[#c2c2c2] flex items-center justify-center font-bold text-sm text-[#212121] hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-bold text-sm text-[#212121] border border-[#e0e0e0] py-0.5 rounded-xs bg-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product?._id, item.quantity + 1)}
                          disabled={item.quantity >= item.product?.stock}
                          className="w-7 h-7 rounded-full border border-[#c2c2c2] flex items-center justify-center font-bold text-sm text-[#212121] hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* Action Links */}
                      <button
                        onClick={() => removeFromCart(item.product?._id)}
                        className="text-xs sm:text-sm font-bold text-[#212121] hover:text-red-600 transition uppercase tracking-wide cursor-pointer"
                      >
                        Remove
                      </button>

                      <Link
                        to={`/products/${item.product?._id}`}
                        className="text-xs sm:text-sm font-bold text-[#2874f0] hover:text-[#1b5bbd] transition uppercase tracking-wide"
                      >
                        View Product
                      </Link>
                    </div>
                  </div>
                ))}

                {/* Bottom Place Order Bar */}
                <div className="p-4 bg-white flex justify-end">
                  <button
                    onClick={() => setIsCheckoutOpen(true)}
                    className="bg-[#fb641b] hover:bg-[#e55b17] text-white font-bold text-sm uppercase tracking-wider py-3.5 px-10 rounded-sm shadow-md transition active:scale-98 cursor-pointer"
                  >
                    Place Order
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Flipkart Price Details Box */}
            <div className="lg:w-4/12 w-full sticky top-20">
              <div className="bg-white border border-[#e0e0e0] rounded-sm shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[#f0f0f0]">
                  <h3 className="text-xs font-bold text-[#878787] uppercase tracking-wider">
                    Price Details
                  </h3>
                </div>

                <div className="p-5 space-y-3.5 text-sm text-[#212121]">
                  <div className="flex justify-between items-center">
                    <span>Price ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
                    <span>₹{totalMRP}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Discount</span>
                    <span className="text-[#388e3c] font-semibold">− ₹{estimatedSavings}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Delivery Charges</span>
                    <span className="text-[#388e3c] font-semibold">FREE</span>
                  </div>

                  <div className="border-t border-dashed border-[#e0e0e0] pt-4 mt-2 flex justify-between items-center text-base font-bold">
                    <span>Total Amount</span>
                    <span>₹{cartSubtotal}</span>
                  </div>

                  {/* Savings Banner */}
                  <div className="border-t border-[#f0f0f0] pt-3 text-xs font-bold text-[#388e3c]">
                    You will save ₹{estimatedSavings} on this order
                  </div>
                </div>

                {/* Place Order CTA */}
                <div className="p-4 border-t border-[#f0f0f0] bg-gray-50/50">
                  <button
                    onClick={() => setIsCheckoutOpen(true)}
                    className="w-full bg-[#fb641b] hover:bg-[#e55b17] text-white font-bold text-sm uppercase tracking-wider py-3.5 rounded-sm shadow-sm transition active:scale-98 cursor-pointer"
                  >
                    Place Order
                  </button>
                </div>
              </div>

              {/* Trust & Guarantee Box */}
              <div className="flex items-center gap-3 p-4 text-xs text-[#878787] mt-3">
                <svg className="w-8 h-8 text-[#878787] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Safe and Secure Payments with Razorpay. 100% Authentic products.</span>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Checkout & Delivery Address Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#2874f0] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Delivery &amp; Checkout</h3>
                <p className="text-xs text-blue-100">Enter shipping address to pay with Razorpay</p>
              </div>
              <button
                onClick={() => {
                  if (!isProcessing) setIsCheckoutOpen(false);
                }}
                className="text-white/80 hover:text-white text-xl font-bold p-1 cursor-pointer"
                disabled={isProcessing}
              >
                &times;
              </button>
            </div>

            {/* Error Message banner */}
            {errorMessage && (
              <div className="p-4 bg-red-50 border-b border-red-200 text-red-700 text-xs sm:text-sm font-medium flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1 leading-snug">{errorMessage}</div>
              </div>
            )}

            {/* Address Form */}
            <form onSubmit={handlePayment} className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#878787] uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={address.name}
                    onChange={handleAddressChange}
                    required
                    placeholder="e.g. John Doe"
                    className="w-full text-sm border border-[#e0e0e0] px-3 py-2 rounded-xs focus:outline-none focus:border-[#2874f0]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#878787] uppercase mb-1">
                    10-Digit Mobile *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={address.phone}
                    onChange={handleAddressChange}
                    required
                    placeholder="9876543210"
                    className="w-full text-sm border border-[#e0e0e0] px-3 py-2 rounded-xs focus:outline-none focus:border-[#2874f0]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#878787] uppercase mb-1">
                  Flat, House No., Building, Street *
                </label>
                <input
                  type="text"
                  name="address"
                  value={address.address}
                  onChange={handleAddressChange}
                  required
                  placeholder="Street address, apartment or landmark"
                  className="w-full text-sm border border-[#e0e0e0] px-3 py-2 rounded-xs focus:outline-none focus:border-[#2874f0]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#878787] uppercase mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={address.city}
                    onChange={handleAddressChange}
                    required
                    placeholder="City"
                    className="w-full text-sm border border-[#e0e0e0] px-3 py-2 rounded-xs focus:outline-none focus:border-[#2874f0]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#878787] uppercase mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={address.state}
                    onChange={handleAddressChange}
                    required
                    placeholder="State"
                    className="w-full text-sm border border-[#e0e0e0] px-3 py-2 rounded-xs focus:outline-none focus:border-[#2874f0]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#878787] uppercase mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={address.pincode}
                    onChange={handleAddressChange}
                    required
                    placeholder="6 digits"
                    className="w-full text-sm border border-[#e0e0e0] px-3 py-2 rounded-xs focus:outline-none focus:border-[#2874f0]"
                  />
                </div>
              </div>

              {/* Order Summary in modal */}
              <div className="bg-[#f9fafb] p-3 rounded-xs border border-[#f0f0f0] flex items-center justify-between text-sm">
                <span className="text-[#878787]">Amount Payable:</span>
                <span className="text-base font-bold text-[#212121]">₹{cartSubtotal}</span>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  disabled={isProcessing}
                  className="px-5 py-2.5 text-xs font-bold uppercase text-[#878787] hover:text-[#212121] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="bg-[#fb641b] hover:bg-[#e55b17] disabled:opacity-60 text-white font-bold text-xs sm:text-sm uppercase tracking-wider py-3 px-6 rounded-sm shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Connecting Razorpay...</span>
                    </>
                  ) : (
                    <>
                      <span>Pay ₹{cartSubtotal} with Razorpay</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;