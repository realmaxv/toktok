import { createBrowserRouter, RouterProvider } from "react-router";
import "./App.css";
import RootLayout from "./layouts/RootLayout";
import HomeFeed from "./pages/HomeFeed";

const router = createBrowserRouter([
  {
    Component: RootLayout,
    children: [
      { path: "/", Component: HomeFeed },
      { path: "*", Component: HomeFeed },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
