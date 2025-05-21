import { House } from "lucide-react";
import { Search } from "lucide-react";
import { CirclePlus } from "lucide-react";
import { User } from "lucide-react";
import { NavLink } from "react-router";

function Footer() {
  return (
    <footer className="w-full h-20 fixed bottom-0 flex items-center justify-between p-6 bg-accent rounded shadow shadow-accent">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `${
            isActive ? "text-[var(--color-brand-pink)]" : "text-gray-500"
          } flex flex-col items-center justify-center`
        }
      >
        <House />
        <p className="text-xs">Home</p>
      </NavLink>

      <NavLink
        to="/search"
        className={({ isActive }) =>
          `${
            isActive ? "text-[var(--color-brand-pink)]" : "text-gray-500"
          } flex flex-col items-center justify-center`
        }
      >
        <Search />
        <p className="text-xs">Search</p>
      </NavLink>
      <NavLink
        to="/newpost"
        className={({ isActive }) =>
          `${
            isActive ? "text-[var(--color-brand-pink)]" : "text-gray-500"
          } flex flex-col items-center justify-center`
        }
      >
        <CirclePlus />
        <p className="text-xs">New Post</p>
      </NavLink>
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `${
            isActive ? "text-[var(--color-brand-pink)]" : "text-gray-500"
          } flex flex-col items-center justify-center`
        }
      >
        <User />
        <p className="text-xs">Profile</p>
      </NavLink>
    </footer>
  );
}

export default Footer;
