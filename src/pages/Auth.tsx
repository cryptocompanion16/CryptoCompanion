import { useState, useEffect } from "react";
import { useSupabaseClient, useSessionContext } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { toast } from "sonner"; // Assuming 'sonner' is your toast library

const Auth = () => {
  const navigate = useNavigate();
  const { session, isLoading } = useSessionContext();
  const supabase = useSupabaseClient();

  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ Redirect when session is active
  useEffect(() => {
    // Only proceed if session loading is complete
    if (isLoading) {
      console.log("Auth: Session still loading...");
      return;
    }

    // Small delay to ensure the session context is fully updated
    // before attempting redirection. This can help prevent flickering.
    const timer = setTimeout(() => {
      if (session) {
        console.log("Auth: Session detected, navigating to /dashboard");
        navigate("/dashboard");
      } else {
        console.log("Auth: No session found or session ended.");
      }
    }, 100);

    // Cleanup the timer if the component unmounts or dependencies change
    return () => clearTimeout(timer);
  }, [session, isLoading, navigate]); // Dependencies: session, isLoading, navigate

  const handleGoogleSignIn = async () => {
    try {
      // IMPORTANT: The redirectTo URL MUST be added to your Supabase project's
      // "Authentication -> URL Configuration -> Redirect URLs"
      // AND your Google Cloud Console's "Authorized redirect URIs"
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // Use window.location.origin to dynamically get the current base URL
          // This ensures it works correctly in both local dev (http://localhost:XXXX)
          // and deployed environments.
          redirectTo: window.location.origin + "/auth",
        },
      });

      if (error) {
        toast.error(`Google Sign-In Failed: ${error.message}`);
        console.error("Google Sign-In Error:", error);
      } else {
        // OAuth flow will redirect the user to Google, then back to /auth/callback
        // The useEffect will then catch the new session and navigate.
        console.log("Initiated Google Sign-In, awaiting redirect from Google...");
      }
    } catch (err) {
      toast.error("An unexpected error occurred during Google Sign-In.");
      console.error("Unexpected Google Sign-In Error:", err);
    }
  };

  const handleEmailAuth = async () => {
    if (!email) {
      toast.warning("Please enter your email.");
      return;
    }

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password", // Ensure this route is handled by your app
        });

        if (error) {
          toast.error(`Failed to send reset email: ${error.message}`);
          console.error("Password reset error:", error.message);
        } else {
          toast.success("Password reset link sent to your email.");
          // No navigation here, user needs to check email
          // navigate("/auth"); // You might keep them on the current page to wait for email
        }
        return;
      }

      if (isSignUp) {
        // Supabase often requires email confirmation for signUp by default.
        // User won't be "logged in" until they confirm their email.
        const { error } = await supabase.auth.signUp({ email, password });

        if (error) {
          toast.error(`Sign-up failed: ${error.message}. Please check your email.`);
          console.error("Sign-up error:", error.message);
        } else {
          toast.success("Account created! Please check your email to confirm your account.");
          // No navigation here; the user needs to confirm email first.
          // navigate("/auth"); // Keep them on the auth page or show a message.
        }
        return;
      }

      // Default: Sign In
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(`Sign-in failed: ${error.message}. Invalid credentials.`);
        console.error("Sign-in error:", error.message);
      } else {
        console.log("Email sign-in successful. Session should be set by auth-helpers.");
        // The useEffect hook will handle redirection to /dashboard
      }

    } catch (err) {
      toast.error("An unexpected error occurred during email authentication.");
      console.error("Auth error (email/password):", err);
    }
  };

  const resetForm = () => {
    setIsForgotPassword(false);
    setIsSignUp(false);
    setEmail("");
    setPassword("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md glass animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Crypto <br /> Companion
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {!isForgotPassword && (
            <Button
              onClick={handleGoogleSignIn}
              variant="glass"
              className="w-full h-12"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {isForgotPassword
                  ? "Enter email to receive reset link"
                  : "Or Continue with Email"}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass"
              />
            </div>

            {!isForgotPassword && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass"
                />
              </div>
            )}

            <Button
              onClick={handleEmailAuth}
              className="w-full h-12"
              variant="default"
            >
              {isForgotPassword
                ? "Send Reset Link"
                : isSignUp
                ? "Create Account"
                : "Sign In"}
            </Button>
          </div>

          <div className="text-center space-y-2">
            {!isForgotPassword && !isSignUp && (
              <button
                onClick={() => setIsForgotPassword(true)}
                className="text-sm text-primary hover:underline"
              >
                Forgot Password?
              </button>
            )}

            {!isForgotPassword && (
              <div className="text-sm">
                {isSignUp ? "Already have an account? " : "Don't have an account? "}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-primary hover:underline font-medium"
                >
                  {isSignUp ? "Sign In" : "Create New Account"}
                </button>
              </div>
            )}

            {isForgotPassword && (
              <button
                onClick={resetForm}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Back to Sign In
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;