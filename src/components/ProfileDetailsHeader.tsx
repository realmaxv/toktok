// import { ArrowLeft } from 'lucide-react';

import { BackButton } from "./BackButton";

function ProfileHeader({ nickname }: { nickname: string }) {
  console.log("header");
  return (
    <header className="flex items-center justify-between p-6 fixed top-0 left-0 right-0 z-50 bg-white  dark:bg-black shadow-md">
      <div className="flex items-center justify-center gap-3">
        {/* <ArrowLeft className="w-6 h-6 mr-4" /> */}
        <BackButton />
        <h2 className="font-bold text-2xl">{nickname}</h2>
      </div>
    </header>
  );
}

export default ProfileHeader;
