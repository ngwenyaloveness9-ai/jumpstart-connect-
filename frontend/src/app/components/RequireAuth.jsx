import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { authApi } from "../services/authApi";

export function RequireAuth({ children }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("accessToken");

        if (!token) {
          setStatus("unauthenticated");
          return;
        }

        console.log("Found token:", token);

        const user = await authApi.me();

        console.log("Authenticated user:", user);

        localStorage.setItem(
          "currentUser",
          JSON.stringify(user)
        );

        setStatus("authenticated");
      } catch (error) {
        console.error("Authentication check failed:", error);

        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("currentUser");

        setStatus("unauthenticated");
      }
    };

    verifyAuth();
  }, []);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="rounded-2xl border border-[#1E1E1E] bg-[#111111] p-8 text-center shadow-lg shadow-black/10">
          <div className="text-sm text-[#888] mb-3">
            Validating session...
          </div>

          <div className="h-3 w-24 rounded-full bg-[#2A2A2A] animate-pulse mx-auto" />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return children;
}