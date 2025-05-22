import logo from '@/assets/logo.svg';
import { NavLink } from 'react-router';

function Header() {
  console.log('header');
  return (
    <header className="flex items-center justify-between p-6 fixed top-0 left-0 right-0 z-50 shadow-md bg-white/70 dark:bg-black/70 backdrop-blur-lg rounded-b-lg border-b ">
      <div className="flex items-center justify-center gap-3">
        <img src={logo} alt="toktok-logo" />
        <h2 className="font-bold text-2xl">TokTok</h2>
      </div>

      <NavLink to="/profile" className="rounded-full">
        <img
          src="https://cdn.vectorstock.com/i/500p/38/88/happy-girl-avatar-funny-child-profile-picture-vector-41133888.jpg"
          alt="profile picture"
          className="w-8 h-8 rounded-full"
        />
      </NavLink>
    </header>
  );
}

export default Header;
