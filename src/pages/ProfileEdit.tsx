import { BackButton } from '@/components/BackButton';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

export default function ProfileEdit() {
  return (
    <>
      <header className="flex items-center justify-between p-6 fixed top-0 left-0 right-0 z-50 bg-white  dark:bg-black shadow-md">
        <div className="flex items-center justify-center gap-3">
          <BackButton />
          <h2 className="font-bold text-2xl">/ProfileName/</h2>
        </div>
      </header>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Profile Edit</h1>
        <p className="text-gray-700">This is the profile Edit page.</p>
        <Button className="mt-4 bg-red-400 text-white font-bold py-2 px-12 rounded-2xl">
          Save
        </Button>
      </div>

      <Footer />
    </>
  );
}
