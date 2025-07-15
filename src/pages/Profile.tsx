// src/pages/Profile.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const Profile = () => {
  const user = useUser();
  const supabase = useSupabaseClient();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  // ✅ Check user and handle redirection
  useEffect(() => {
    if (user === null) {
      navigate("/auth", { replace: true });
    } else if (user) {
      setLoading(false);
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    // Redirection handled by useEffect
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white text-lg">
        Please wait... 
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-white flex flex-col items-center justify-center relative"
      style={{ backgroundColor: "#1a1a1a", padding: "40px" }}
    >
      {/* Title */}
      <div className="absolute top-4 left-6 text-xl font-semibold">Profile</div>

      {/* Close Button */}
      <div className="absolute top-4 right-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="w-10 h-10 flex items-center justify-center bg-white text-black rounded-full"
        >
          <X size={20} />
        </button>
      </div>

      {/* Profile Icon */}
      <div className="w-28 h-28 bg-white text-black rounded-full flex items-center justify-center text-5xl mb-6">
        👤
      </div>

      {/* Email */}
      <div className="text-sm text-center mb-6">
        Email: <span className="font-semibold">{user?.email}</span>
      </div>

      {/* Logout Button */}
      <Button
        onClick={handleLogout}
        className="bg-white text-black px-6 py-2 rounded-full font-bold"
      >
        Log Out
      </Button>
    </div>
  );
};

export default Profile;
