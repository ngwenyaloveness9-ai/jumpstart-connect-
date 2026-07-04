export function routeUser(user) {
  if (!user) return "/login";

  const role = (user.role || "").toLowerCase();

  if (
    role === "admin" ||
    role === "administrator" ||
    role === "system admin"
  ) {
    return "/admin";
  }

  return "/dashboard";
}