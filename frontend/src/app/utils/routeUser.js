export function routeUser(user) {
  if (!user) return "/login";

  const role = (user.role || "").toLowerCase().trim();

  // Admin roles
  if (
    role === "admin" ||
    role === "administrator" ||
    role === "system admin"
  ) {
    return "/admin";
  }

  // Human Resources roles
  if (
    role === "hr" ||
    role === "human resources" ||
    role === "human resource" ||
    role === "hr manager" ||
    role === "hr officer"
  ) {
    return "/dashboard";
  }

  // Default employee/user dashboard
  return "/dashboard";
}