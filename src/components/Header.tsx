import logo from '@/assets/logo.svg';
import { ModeToggle } from './DarkMode/mode-toggle';

function Header() {
  console.log("header");
  return (
    <header className="flex items-center justify-between p-6 ">
      <div className="flex items-center justify-center gap-3">
        <img src={logo} alt="toktok-logo" />
        <h2 className="font-bold text-2xl">TokTok</h2>
      </div>
      <div className="flex items-center justify-center">
        <ModeToggle />
      </div>
    </header>
  );
}

export default Header;
