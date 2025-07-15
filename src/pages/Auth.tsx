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

import { toast } from "sonner";

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
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (session) {
        navigate("/dashboard");
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [session, isLoading, navigate]);

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) toast.error("Google Sign-In Error");
  };

  const handleEmailAuth = async () => {
    if (!email) return;

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });

        if (error) {
          toast.error("Failed to send reset email.");
          console.error("Reset error:", error.message);
        } else {
          toast.success("Password reset link sent to your email.");
          navigate("/auth");
        }
        return;
      }

      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });

        if (error) {
          toast.error("Sign-up failed. Check your email.");
          console.error("Sign-up error:", error.message);
        } else {
          toast.success("Check your email to confirm your account.");
          navigate("/auth");
        }
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error("Invalid login credentials.");
      }

    } catch (err) {
      toast.error("An unexpected error occurred.");
      console.error("Auth error:", err);
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
