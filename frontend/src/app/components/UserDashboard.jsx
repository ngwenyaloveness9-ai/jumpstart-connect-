import { useNavigate } from "react-router";
import { LogOut } from "lucide-react";
import { Messages } from "./admin/Messages";

export function UserDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <div className="h-screen bg-background p-6">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
      <Messages />
    </div>
  );
}