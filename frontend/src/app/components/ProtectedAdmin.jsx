import { RequireAuth } from "./RequireAuth";
import { AdminDashboard } from "./AdminDashboard";

export function ProtectedAdmin() {
  return (
    <RequireAuth>
      <AdminDashboard />
    </RequireAuth>
  );
}
