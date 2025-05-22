import { createBrowserRouter, RouterProvider } from "react-router";
import { AuthContextProvider, useAuthContext } from "./contexts/auth-context";
import HomeFeed from "./pages/HomeFeed";
import CreateNewPost from "./pages/CreateNewPost";
import Profile from "./pages/Profile";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Search from "./pages/Search";
import Comments from "./pages/Comments";
import ProfileDetail from "./pages/ProfileDetails";
import ProfileEdit from "./pages/ProfileEdit";
import Settings from "./pages/Settings";
import Loader from "./components/Loader";
import RootLayout from "./layouts/RootLayout";

function App() {
  return (
    <AuthContextProvider>
      <InnerApp />
    </AuthContextProvider>
  );
}

function InnerApp() {
  const { session, isLoading } = useAuthContext();

  if (isLoading) {
    return <Loader />;
  }

  const publicRouter = createBrowserRouter([
    {
      Component: RootLayout,
      children: [
        { path: "/signup", Component: SignUp },
        { path: "/signin", Component: SignIn },
        { path: "*", Component: SignIn },
      ],
    },
  ]);

  const privateRouter = createBrowserRouter([
    {
      Component: RootLayout,
      children: [
        { path: "/", Component: HomeFeed },
        { path: "/newpost", Component: CreateNewPost },
        { path: "/profile", Component: Profile },
        { path: "/comments", Component: Comments },
        { path: "/search", Component: Search },
        { path: "/profile-detail", Component: ProfileDetail },
        { path: "/profile-edit", Component: ProfileEdit },
        { path: "/settings", Component: Settings },
        { path: "*", Component: HomeFeed },
      ],
    },
  ]);

  return <RouterProvider router={session ? privateRouter : publicRouter} />;
}

export default App;
