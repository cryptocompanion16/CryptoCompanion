// src/pages/reset-password.tsx
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Password updated! Please sign in again.");
      window.location.href = "/auth";
    }

    setIsResetting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 bg-white rounded-xl p-6 shadow-xl">
        <h1 className="text-xl font-bold text-center">Reset Your Password</h1>
        <Input
          type="password"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Button onClick={handleReset} className="w-full" disabled={isResetting}>
          {isResetting ? "Updating..." : "Update Password"}
        </Button>
      </div>
    </div>
  );
}
