import { Outlet } from "react-router";

const RootLayout = () => {
  return (
    <main>
      <Outlet />
    </main>
  );
};

export default RootLayout;
