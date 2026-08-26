import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";

// Thin redirect: carries the email + token from the URL into CreatePasswordPage with isReset=true.
// In production, extract the reset token from the URL search params here.
export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const email = location.state?.email ?? params.get("email") ?? "";
  const uid = params.get("uid") ?? "";
  const token = params.get("token") ?? "";

  useEffect(() => {
    navigate(
      "/create-password",
      {
        state: {
          email,
          uid,
          token,
          isReset: true,
        },
        replace: true,
      }
    );
  }, [navigate, email, uid, token]);

  return null;
}