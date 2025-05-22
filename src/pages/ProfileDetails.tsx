import Footer from '@/components/Footer';
import ProfileDetailsHeader from '@/components/ProfileDetailsHeader';

export default function ProfileDetails() {
  return (
    <>
      <ProfileDetailsHeader />

      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Profile Details</h1>
        <p className="text-gray-700">This is the profile details page.</p>
      </div>
      <Footer />
    </>
  );
}
