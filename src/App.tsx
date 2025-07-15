import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster"; // Assuming this is for Shadcn UI toasts
import { Toaster as Sonner } from "@/components/ui/sonner"; // Assuming this is for Sonner toasts
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { createClient } from "@supabase/supabase-js";

// Import your pages/components
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import PositionCalculator from "./pages/PositionCalculator";
import DailyCompounding from "./pages/DailyCompounding";
import Converter from "./pages/Converter";
import Todo from "./pages/Todo";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound"; // Your 404 page

// Import the updated ProtectedRoute component
// Ensure the path matches your file structure
import ProtectedRoute from "./pages/ProtectedRoute"; // Corrected import path

const queryClient = new QueryClient();

// Initialize Supabase Client
// Ensure your .env.local or .env file has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// Basic check for environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase URL or Anon Key is missing from environment variables. " +
    "Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set."
  );
  // In a real application, you might want to display a user-friendly error page here
  // or prevent the app from starting if critical env vars are missing.
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const App = () => (
  // QueryClientProvider for React Query
  <QueryClientProvider client={queryClient}>
    {/* SessionContextProvider for Supabase authentication context */}
    <SessionContextProvider supabaseClient={supabase}>
      {/* TooltipProvider for Shadcn UI tooltips */}
      <TooltipProvider>
        {/* Toaster components for displaying notifications */}
        <Toaster />
        <Sonner />

        {/* BrowserRouter for client-side routing */}
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            {/* Note: The /auth/callback route is handled internally by supabase-auth-helpers-react.
                       You don't need a separate <Route> for it here.
                       Your Auth component's useEffect will handle the redirection after session is active. */}

            {/* Protected Routes: All routes nested here will require authentication */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/position-calculator" element={<PositionCalculator />} />
              <Route path="/daily-compounding" element={<DailyCompounding />} />
              <Route path="/converter" element={<Converter />} />
              <Route path="/todo" element={<Todo />} />
              {/* Add any other routes that should be protected here */}
            </Route>

            {/* Catch-all route for 404 Not Found pages */}
            {/* This route should always be the last one in your <Routes> */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SessionContextProvider>
  </QueryClientProvider>
);

export default App;
