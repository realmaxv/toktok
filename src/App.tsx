import { createBrowserRouter, RouterProvider } from 'react-router';
import { AuthContextProvider } from './contexts/auth-context';
import RootLayout from './layouts/RootLayout';
import HomeFeed from './pages/HomeFeed';
import CreateNewPost from './pages/CreateNewPost';
import Profile from './pages/Profile';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Search from './pages/Search';
import Comments from './pages/Comments';
import ProfileDetail from './pages/ProfileDetails';
import ProfileEdit from './pages/ProfileEdit';
import Settings from './pages/Settings';

const router = createBrowserRouter([
  {
    Component: RootLayout,
    children: [
      { path: '/', Component: HomeFeed },
      { path: '/signup', Component: SignUp },
      { path: '/signin', Component: SignIn },
      { path: '/newpost', Component: CreateNewPost },
      { path: '/profile', Component: Profile },
      { path: '/comments', Component: Comments },
      { path: '/search', Component: Search },
      { path: '/profile-detail', Component: ProfileDetail },
      { path: '/profile-edit', Component: ProfileEdit },
      { path: '/settings', Component: Settings },

      { path: '*', Component: HomeFeed },
    ],
  },
]);

function App() {
  console.log('App, router:', router);
  return (
    <AuthContextProvider>
      <RouterProvider router={router} />
    </AuthContextProvider>
  );
}

export default App;
