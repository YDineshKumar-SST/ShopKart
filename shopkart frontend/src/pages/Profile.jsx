import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    profileImage: ""
  });

  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://localhost:3000/customers/me", { withCredentials: true });
      setUser(res.data.customer);
      setFormData({
        fullName: res.data.customer.fullName,
        phone: res.data.customer.phone,
        profileImage: res.data.customer.profileImage || ""
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const res = await axios.put("http://localhost:3000/customers/update", formData, {
        withCredentials: true
      });
      setUser(res.data.customer);
      setIsEditing(false);
      alert("Profile updated successfully! 🎉");
    } catch {
      alert("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] flex flex-col font-sans">
        <Navbar />
        <div className="max-w-7xl mx-auto w-full p-16 text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#2874f0] border-t-transparent mb-4"></div>
          <p className="text-sm font-semibold text-[#878787]">Loading account profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6] flex flex-col font-sans">
      <Navbar />
      
      <div className="max-w-7xl mx-auto w-full px-2 sm:px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* Left Sidebar: Flipkart My Account Sidebar */}
          <div className="w-full md:w-4/12 space-y-4">
            {/* User Greeting Card */}
            <div className="bg-white border border-[#e0e0e0] rounded-sm p-4 shadow-sm flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center flex-shrink-0 border border-blue-200">
                {formData.profileImage || user?.profileImage ? (
                  <img
                    src={formData.profileImage || user?.profileImage}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">👤</span>
                )}
              </div>
              <div className="truncate">
                <span className="text-xs text-[#878787]">Hello,</span>
                <h2 className="text-base font-bold text-[#212121] truncate">
                  {user?.fullName || "Valued Customer"}
                </h2>
              </div>
            </div>

            {/* Account Quick Links Navigation */}
            <div className="bg-white border border-[#e0e0e0] rounded-sm shadow-sm overflow-hidden divide-y divide-[#f0f0f0] text-sm font-semibold text-[#212121]">
              <div className="p-4 bg-blue-50/50 flex items-center justify-between text-[#2874f0]">
                <div className="flex items-center gap-3">
                  <span>👤</span>
                  <span>Personal Information</span>
                </div>
                <span>●</span>
              </div>
              <Link to="/cart" className="p-4 hover:bg-gray-50 flex items-center justify-between transition">
                <div className="flex items-center gap-3">
                  <span>🛒</span>
                  <span>My Cart</span>
                </div>
                <span className="text-xs text-[#878787]">&rarr;</span>
              </Link>
              <Link to="/wishlist" className="p-4 hover:bg-gray-50 flex items-center justify-between transition">
                <div className="flex items-center gap-3">
                  <span>❤️</span>
                  <span>My Wishlist</span>
                </div>
                <span className="text-xs text-[#878787]">&rarr;</span>
              </Link>
              <Link to="/products" className="p-4 hover:bg-gray-50 flex items-center justify-between transition">
                <div className="flex items-center gap-3">
                  <span>🛍️</span>
                  <span>Shop Products</span>
                </div>
                <span className="text-xs text-[#878787]">&rarr;</span>
              </Link>
            </div>
          </div>

          {/* Right Area: Personal Information Card */}
          <div className="w-full md:w-8/12 bg-white border border-[#e0e0e0] rounded-sm shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-4">
              <div>
                <h1 className="text-xl font-bold text-[#212121]">Personal Information</h1>
                <p className="text-xs text-[#878787] mt-0.5">Manage your personal profile and account credentials</p>
              </div>
              <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={`text-xs font-bold uppercase tracking-wider px-5 py-2 rounded-sm shadow-xs transition ${
                  isEditing 
                    ? 'bg-[#388e3c] hover:bg-green-700 text-white' 
                    : 'bg-[#2874f0] hover:bg-[#1b5bbd] text-white'
                }`}
              >
                {isEditing ? "Save Changes" : "Edit Profile"}
              </button>
            </div>

            {/* Profile Avatar Upload */}
            <div className="flex items-center gap-6 p-4 bg-gray-50 border border-[#f0f0f0] rounded-sm">
              <div className="w-20 h-20 rounded-full border-2 border-[#2874f0] overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
                {formData.profileImage ? (
                  <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">👤</span>
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#212121]">Profile Picture</h3>
                <p className="text-xs text-[#878787] mt-0.5">PNG, JPG or WebP (Max 5MB)</p>
                {isEditing && (
                  <label className="mt-2 inline-block cursor-pointer text-xs font-bold text-[#2874f0] hover:text-[#1b5bbd] bg-white border border-[#2874f0] px-3 py-1 rounded-sm shadow-xs">
                    Choose New Image
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {/* Profile Fields */}
            <div className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-[#878787] uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full sm:max-w-md p-2.5 border border-[#d5d7db] rounded-sm text-sm text-[#212121] focus:outline-none focus:border-[#2874f0]"
                  />
                ) : (
                  <p className="text-sm font-semibold text-[#212121] py-1">{user?.fullName || "Not provided"}</p>
                )}
              </div>

              {/* Email (Read-Only) */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <label className="block text-xs font-bold text-[#878787] uppercase tracking-wider">
                    Email Address
                  </label>
                  <span className="text-[10px] bg-gray-200 text-[#878787] px-1.5 py-0.2 rounded font-semibold">
                    Read-Only
                  </span>
                </div>
                <p className="text-sm font-semibold text-[#212121] py-1">{user?.email}</p>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-[#878787] uppercase tracking-wider mb-1.5">
                  Mobile Number
                </label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full sm:max-w-md p-2.5 border border-[#d5d7db] rounded-sm text-sm text-[#212121] focus:outline-none focus:border-[#2874f0]"
                  />
                ) : (
                  <p className="text-sm font-semibold text-[#212121] py-1">{user?.phone || "Not provided"}</p>
                )}
              </div>
            </div>

            {/* FAQs / Information */}
            <div className="border-t border-[#f0f0f0] pt-6 space-y-3">
              <h3 className="text-sm font-bold text-[#212121]">Frequently Asked Questions</h3>
              <div className="text-xs text-[#878787] space-y-2">
                <p><strong>What happens when I update my email address (or mobile number)?</strong><br />
                Your login email id (or mobile number) changes, likewise. You'll receive all your account updates on your updated contact details.</p>
                <p><strong>When will my ShopKart account be updated with the new details?</strong><br />
                It happens immediately after you confirm the updates.</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;