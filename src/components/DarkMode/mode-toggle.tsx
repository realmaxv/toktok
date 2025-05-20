import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/DarkMode/theme-provider";
import { useState } from "react";

export function ModeToggle() {
  const { setTheme } = useTheme(); 
  const [light, setLight] = useState(false); 

  console.log("ModeToggle initial:", light ? "light" : "dark"); 

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    console.log("click mode toggle", light); 
    setLight((old) => !old); 
    if (light) {
      setTheme("light"); 
      console.log("switch to light mode"); 
    } else {
      setTheme("dark"); 
      console.log("switch to dark mode"); 
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button onClick={handleClick} variant="outline" size="icon">
       
          {!light && (
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          )}
          {light && (
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          )}
        </Button>
      </DropdownMenuTrigger>
    
    </DropdownMenu>
  );
}