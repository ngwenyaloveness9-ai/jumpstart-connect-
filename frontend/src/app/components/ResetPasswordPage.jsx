import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";

// Thin redirect: carries the email + token from the URL into CreatePasswordPage with isReset=true.
// In production, extract the reset token from the URL search params here.
export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email ?? "";

  useEffect(() => {
    navigate(
      "/create-password",
      {
        state: {
          email,
          isReset: true,
        },
        replace: true,
      }
    );
  }, [navigate, email]);

  return null;
}