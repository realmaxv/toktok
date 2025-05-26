import { useContext } from "react";
import { authContext } from "@/contexts/auth-context";

export const useAuthContext = () => {
  const value = useContext(authContext);
  if (!value) {
    console.error("Heyyy, no authContext provided");
  }
  return value;
};
