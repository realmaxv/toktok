import { ThemeProvider } from "@/components/DarkMode/theme-provider";
import { Outlet } from "react-router";

const RootLayout = () => {
  console.log(" load RootLayout");
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <main className="font-[urbanist] overflow-x-hidden w-screen">
        <Outlet />
      </main>
    </ThemeProvider>
  );
};

export default RootLayout;
