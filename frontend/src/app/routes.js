import { createBrowserRouter } from "react-router";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { AdminDashboard } from "./components/AdminDashboard";
export const router = createBrowserRouter([
    { index: true, Component: LandingPage },
    { path: "login", Component: LoginPage },
    { path: "admin", Component: AdminDashboard },
]);
