import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/components/DarkMode/theme-provider';

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const handleClick = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className="mr-2 bg-stone-800 dark:bg-amber-100 text-stone-200 dark:text-stone-900 rounded-3xl"
      >
        <Button onClick={handleClick} variant="outline" size="icon">
          {theme === 'light' ? (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Sun className="h-[1.2rem] w-[1.2rem]x" />
          )}
        </Button>
      </DropdownMenuTrigger>
    </DropdownMenu>
  );
}
