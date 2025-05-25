// src/App.tsx
import { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { AuthContextProvider, useAuthContext } from './contexts/auth-context';
import Loader from './components/Loader';
import HomeFeed from './pages/HomeFeed';
import CreateNewPost from './pages/CreateNewPost';
import Profile from './pages/Profile';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Search from './pages/Search';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import Comments from './pages/Comments';
import ProfileDetails from './pages/ProfileDetails';
import ProfileEdit from './pages/ProfileEdit';
import Settings from './pages/Settings';
import RootLayout from './layouts/RootLayout';

const SPLASH_DURATION = 1300; // lade animations dauer 1.3 Sekunden

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, []);

  // Simuliere das Laden von Auth-Daten
  // darkmodus auch bei der Authentifizierung berücksichtigen
  if (loading) {
    return <Loader />;
  }

  return (
    <AuthContextProvider>
      <InnerApp />
    </AuthContextProvider>
  );
}

function InnerApp() {
  const { session } = useAuthContext();

  const publicRouter = createBrowserRouter([
    {
      Component: RootLayout,
      children: [
        { path: '/signup', Component: SignUp },
        { path: '/signin', Component: SignIn },
        { path: '/forgot-password', Component: ForgotPasswordPage },
        { path: '*', Component: SignIn },
      ],
    },
  ]);

  const privateRouter = createBrowserRouter([
    {
      Component: RootLayout,
      children: [
        { path: '/', Component: HomeFeed },
        { path: '/newpost', Component: CreateNewPost },
        { path: '/profile', Component: Profile },
        { path: '/profile/:id', Component: ProfileDetails },
        { path: '/comments/:id', Component: Comments },
        { path: '/search', Component: Search },
        { path: '/profile-detail', Component: ProfileDetails },
        { path: '/profile-edit', Component: ProfileEdit },
        { path: '/settings', Component: Settings },
        { path: '*', Component: HomeFeed },
      ],
    },
  ]);

  return <RouterProvider router={session ? privateRouter : publicRouter} />;
}

export default App;
