import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("https://shopkart-dkq7.onrender.com/orders/my-orders", {
          withCredentials: true
        });
        setOrders(res.data.orders || []);
      } catch (error) {
        if (error.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#f1f3f6] flex flex-col font-sans">
      <Navbar />

      <div className="max-w-6xl mx-auto w-full px-3 sm:px-6 py-6">
        {/* Breadcrumb / Title */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#212121]">My Orders</h1>
            <p className="text-xs sm:text-sm text-[#878787]">View and track all your purchases</p>
          </div>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-semibold text-[#2874f0] hover:underline"
          >
            Continue Shopping &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="bg-white rounded-sm border border-[#e0e0e0] p-16 text-center shadow-sm">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#2874f0] border-t-transparent mb-3"></div>
            <p className="text-sm font-semibold text-[#878787]">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-[#e0e0e0] rounded-sm p-12 text-center shadow-sm max-w-lg mx-auto my-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center text-[#2874f0]">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#212121] mb-1">No orders placed yet!</h3>
            <p className="text-xs sm:text-sm text-[#878787] mb-6">
              Looks like you haven't bought anything yet. Explore our deals!
            </p>
            <Link
              to="/products"
              className="inline-block bg-[#2874f0] hover:bg-[#1b5bbd] text-white text-xs sm:text-sm font-bold uppercase tracking-wider px-6 py-2.5 rounded-sm shadow-sm transition"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white border border-[#e0e0e0] rounded-sm shadow-sm overflow-hidden"
              >
                {/* Order Header bar */}
                <div className="bg-[#f9fafb] px-4 py-3 border-b border-[#e5e7eb] flex flex-wrap items-center justify-between gap-3 text-xs text-[#717478]">
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <div>
                      <span className="uppercase text-[10px] tracking-wider block font-semibold">Order Placed</span>
                      <span className="font-medium text-[#212121]">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="uppercase text-[10px] tracking-wider block font-semibold">Total Amount</span>
                      <span className="font-bold text-[#212121]">₹{order.totalAmount}</span>
                    </div>
                    <div>
                      <span className="uppercase text-[10px] tracking-wider block font-semibold">Ship To</span>
                      <span className="font-medium text-[#212121]">{order.shippingAddress?.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-gray-500">
                      ID: #{order._id.slice(-8).toUpperCase()}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${order.paymentStatus === "paid"
                          ? "bg-green-100 text-[#388e3c]"
                          : order.paymentStatus === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-700"
                        }`}
                    >
                      {order.paymentStatus === "paid" ? "Paid (Razorpay)" : order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Items in this order */}
                <div className="p-4 sm:p-5 divide-y divide-[#f0f0f0]">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 flex-shrink-0 bg-white border border-[#f0f0f0] rounded p-1 flex items-center justify-center">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <div className="text-gray-300 text-xs">No image</div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-[#212121] line-clamp-1">
                            {item.name}
                          </h4>
                          <p className="text-xs text-[#878787] mt-0.5">
                            Qty: <span className="font-medium text-[#212121]">{item.quantity}</span> &bull; Price: ₹{item.price} each
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-[#212121]">
                          ₹{item.price * item.quantity}
                        </span>
                        <div className="text-[11px] text-[#388e3c] font-medium mt-0.5">
                          ✓ Confirmed
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping & Payment Meta Footer */}
                {order.shippingAddress && (
                  <div className="bg-gray-50/70 border-t border-[#f0f0f0] px-4 py-2.5 text-xs text-[#878787] flex flex-wrap justify-between items-center gap-2">
                    <div>
                      <span className="font-semibold text-gray-700">Delivery Address: </span>
                      <span>
                        {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
                        {order.shippingAddress.state} - {order.shippingAddress.pincode} (Ph: {order.shippingAddress.phone})
                      </span>
                    </div>
                    {order.razorpayPaymentId && (
                      <div className="font-mono text-[11px] text-gray-500">
                        Payment ID: {order.razorpayPaymentId}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
