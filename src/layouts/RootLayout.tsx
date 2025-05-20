import { ThemeProvider } from "@/components/DarkMode/theme-provider";
import { Outlet } from "react-router";
import Header from "@/components/Header"; 
import Footer from "@/components/Footer"; 

const RootLayout = () => {
  console.log("load RootLayout");
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex flex-col min-h-screen">
        <Header /> 
        <main className="font-[urbanist] flex-grow">
          <Outlet /> 
        </main>
        <Footer /> 
      </div>
    </ThemeProvider>
  );
};

export default RootLayout;