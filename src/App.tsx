import { createBrowserRouter, RouterProvider } from 'react-router';
import RootLayout from './layouts/RootLayout';
import HomeFeed from './pages/HomeFeed';
import CreateNewPost from './pages/CreateNewPost';
import Profile from './pages/Profile';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Search from './pages/Search';

const router = createBrowserRouter([
  {
    Component: RootLayout,
    children: [
      { path: '/', Component: HomeFeed },
      { path: '/signup', Component: SignUp },
      { path: '/signin', Component: SignIn },
      { path: '/newpost', Component: CreateNewPost },
      { path: '/profile', Component: Profile },
      { path: '/comments', Component: HomeFeed },
      { path: '/search', Component: Search },
      { path: '*', Component: HomeFeed },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
