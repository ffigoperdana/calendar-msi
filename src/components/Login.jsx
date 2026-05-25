import React, { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthProvider";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Login = () => {
  const { user, signInWithGoogle, sessionExpired, setNavigate } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isExpired = searchParams.get("expired") === "true" || sessionExpired;

  // Register navigate function with AuthProvider for redirect on token expiry
  useEffect(() => {
    if (setNavigate) {
      setNavigate(navigate);
    }
  }, [navigate, setNavigate]);

  useEffect(() => {
    if (user) {
      navigate("/events");
    }
  }, [user, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md text-center space-y-6">
        {isExpired && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
            <p className="text-red-600 font-medium m-0">
              Session expired, please sign in again
            </p>
          </div>
        )}

        <h2 className="text-2xl font-bold text-gray-800">
          Hi Para Mas Mbak Abang Cak, welcome back!
        </h2>
        <p className="text-gray-600">
          Yuk, masuk dengan akun Mastersystem dan segera kumpulkan daily sebelum ditagih mbak nia.
        </p>

        {/* Trust Indicators Section */}
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                🔒 Official Google OAuth 2.0
              </Badge>
            </div>
            <p className="text-xs text-gray-500 text-left ml-1">
              This app uses Google&apos;s official authentication — your credentials are never shared.
            </p>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                📅 Calendar access only
              </Badge>
            </div>
            <p className="text-xs text-gray-500 text-left ml-1">
              Only your calendar data is accessed — nothing else.
            </p>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                🚫 No external storage
              </Badge>
            </div>
            <p className="text-xs text-gray-500 text-left ml-1">
              No data is stored on external servers — everything stays with Google.
            </p>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                🛡️ Privacy respected
              </Badge>
            </div>
            <p className="text-xs text-gray-500 text-left ml-1">
              Your privacy is fully respected — we follow best practices.
            </p>
          </CardContent>
        </Card>

        {/* Google Sign-In Button */}
        <Button
          variant="outline"
          className="w-full h-12 text-base font-medium border-gray-300 hover:bg-gray-50"
          onClick={signInWithGoogle}
        >
          <div className="flex items-center justify-center gap-3">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
            <span>Sign in with Google</span>
          </div>
        </Button>
      </div>
    </div>
  );
};

export default Login;
