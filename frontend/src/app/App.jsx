import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ThemeProvider } from "./components/ThemeProvider";
export default function App() {
    return (<ThemeProvider>
      <div className="theme-adaptive min-h-screen">
        <RouterProvider router={router}/>
      </div>
    </ThemeProvider>);
}
