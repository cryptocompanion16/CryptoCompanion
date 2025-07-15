import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSessionContext } from "@supabase/auth-helpers-react";

const ProtectedRoute = () => {
  // useSessionContext provides session data and loading state from Supabase auth-helpers
  const { session, isLoading } = useSessionContext();

  // If the session is still loading, display a loading message.
  // This prevents flickering or premature redirects while auth state is being determined.
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center text-xl text-gray-700">
          Checking authentication status...
        </div>
      </div>
    );
  }

  // If there is no active session, redirect the user to the authentication page.
  // The 'replace' prop ensures that the current (unauthorized) history entry is replaced,
  // preventing the user from navigating back to a protected route using the browser's back button.
  if (!session) {
    console.log("ProtectedRoute: No session found, redirecting to /auth");
    return <Navigate to="/auth" replace />;
  }

  // If a session exists, render the child routes/components.
  // Outlet is used when this component acts as a layout route for nested routes.
  console.log("ProtectedRoute: Session found, rendering protected content.");
  return <Outlet />;
};

export default ProtectedRoute;
