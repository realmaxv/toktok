import { createBrowserRouter, RouterProvider } from "react-router";
import "./App.css";
import RootLayout from "./layouts/RootLayout";
import HomePage from "./pages/HomePage";
import WrongPage from "./pages/WrongPage";

const router = createBrowserRouter([
  {
    Component: RootLayout,
    children: [
      { path: "/", Component: HomePage },
      { path: "*", Component: WrongPage },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
