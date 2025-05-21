import logo from '@/assets/logo.svg';
import { PencilLine } from 'lucide-react';
import { SquarePlus } from 'lucide-react';
import { CircleEllipsis } from 'lucide-react';

function ProfileHeader() {
  console.log('header');
  return (
    <header className="flex items-center justify-between p-6 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-center gap-3">
        <img src={logo} alt="toktok-logo" />
        <h2 className="font-bold text-2xl"> Profile</h2>
      </div>
      <div className="flex items-center justify-center">
        <SquarePlus className="w-6 h-6 mr-4" />
        <PencilLine className="w-6 h-6" />
        <CircleEllipsis className="w-6 h-6 ml-4" />
      </div>
    </header>
  );
}

export default ProfileHeader;
