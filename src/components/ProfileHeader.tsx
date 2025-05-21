import logo from "@/assets/logo.svg";
import { Heart } from "lucide-react";

function ProfileHeader() {
  console.log("header");
  return (
    <header className="flex items-center justify-between p-6  h-20 w-full fixed bg-accent">
      <div className="flex items-center justify-center gap-3">
        <img src={logo} alt="toktok-logo" />
        <h2 className="font-bold text-2xl"> Profile</h2>
      </div>
      <div className="flex items-center justify-center">
        <Heart className="w-7 h-7" />
      </div>
    </header>
  );
}

export default ProfileHeader;
