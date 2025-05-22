import logo from '@/assets/logo.svg';
import { NavLink } from 'react-router';
import { UserRoundPen } from 'lucide-react';
import { Settings } from 'lucide-react';

function ProfileHeader() {
  console.log('header');
  return (
    <header className="flex items-center justify-between p-6 fixed top-0 left-0 right-0 z-50 bg-white  dark:bg-black shadow-md">
      <div className="flex items-center justify-center gap-3">
        <img src={logo} alt="toktok-logo" />
        <h2 className="font-bold text-2xl"> Profile</h2>
      </div>
      <div className="flex items-center justify-center">
        <NavLink to="/profile-edit">
          <UserRoundPen className="w-6 h-6" />
        </NavLink>
        <NavLink to="/settings">
          <Settings className="w-6 h-6 ml-4" />
        </NavLink>
      </div>
    </header>
  );
}

export default ProfileHeader;
