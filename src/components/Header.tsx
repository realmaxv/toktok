import logo from "@/assets/logo.svg";
import { Heart } from "lucide-react";

function Header() {
  console.log("header");
  return (
    <header className="flex items-center justify-between p-6 h-20 mb-20 w-full fixed rounded bg-accent shadow shadow-accent">
      <div className="flex items-center justify-center gap-3">
        <img src={logo} alt="toktok-logo" />
        <h2 className="font-bold text-2xl">TokTok</h2>
      </div>
      <div className="flex items-center justify-center">
        <Heart className="w-7 h-7" />
      </div>
    </header>
  );
}

export default Header;
