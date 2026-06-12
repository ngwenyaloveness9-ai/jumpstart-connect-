import { createBrowserRouter } from "react-router";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { ProtectedAdmin } from "./components/ProtectedAdmin";

export const router = createBrowserRouter([
    { index: true, Component: LandingPage },
    { path: "login", Component: LoginPage },
    { path: "admin", Component: ProtectedAdmin },
]);
