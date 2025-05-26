import { ModeToggle } from '@/components/DarkMode/mode-toggle';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

function Settings() {
  return (
    <>
      <Header />

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
