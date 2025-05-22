import { BackButton } from '@/components/BackButton';
import { ModeToggle } from '@/components/DarkMode/mode-toggle';
import Footer from '@/components/Footer';

function Settings() {
  return (
    <>
      <header className="flex items-center justify-between p-6 fixed top-0 left-0 right-0 z-50 bg-white  dark:bg-black shadow-md">
        <div className="flex items-center justify-center gap-3">
          <BackButton />
          <h2 className="font-bold text-2xl">Settings</h2>
        </div>
      </header>

      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-semibold mb-4">Settings</h1>
        <p className="mb-4">Adjust your preferences below:</p>
        <p className="mb-4">Day/Night Mode:</p>
        <ModeToggle />
      </div>
      <Footer />
    </>
  );
}

export default Settings;
