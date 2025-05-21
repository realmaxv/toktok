// src/pages/Profile.tsx
import { useState, useEffect } from 'react';
import { ModeToggle } from '@/components/DarkMode/mode-toggle';
import { mockUsers, mockPosts } from '../mockData';
import Footer from '@/components/Footer';
import ProfileHeader from '@/components/ProfileHeader';
import Loader from '@/components/Loader';

function Profile() {
  // 1) Loading-State
  const [loading, setLoading] = useState(true);

  // 2) Simulate data fetching
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200); // Simulate loading for 1 second
    return () => clearTimeout(timer);
  }, []);
  // 3) Während loading=true, Loader fullscreen
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-transparent z-50 pointer-events-none">
        <Loader />
      </div>
    );
  }

  // 4) Profil-UI
  console.log('Profile loaded');
  const currentUser = mockUsers.find((u) => u.username === 'john_doe');
  const userPosts = mockPosts.filter(
    (p) => p.userId === (currentUser?.id || 1)
  );

  const handleEditClick = () => {
    console.log('click edit, navigate to /edit');
    // z.B. navigate('/edit')
  };

  return (
    <>
      <ProfileHeader />

      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-semibold mb-4">User Profile</h1>
        {currentUser && (
          <div className="mb-6 text-center">
            <p>
              <strong>Username:</strong> {currentUser.username}
            </p>
            <p>
              <strong>Name:</strong> {currentUser.name}
            </p>
            <p>
              <strong>Role:</strong> {currentUser.role}
            </p>
            <p>
              <strong>Bio:</strong> {currentUser.bio}
            </p>
            <p>
              <strong>Website:</strong>{' '}
              <a
                href={currentUser.website}
                className="text-blue-500 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {currentUser.website}
              </a>
            </p>
          </div>
        )}
        <h2 className="text-xl font-medium mb-2">My Posts</h2>
        <ul className="list-disc list-inside mb-6">
          {userPosts.map((post) => (
            <li key={post.id} className="mb-1">
              {post.content} (Likes: {post.likes}, Comments: {post.comments})
            </li>
          ))}
        </ul>
        <button
          onClick={handleEditClick}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          Edit
        </button>

        <div className="mt-8">
          <ModeToggle />
        </div>
        <Footer />
      </div>
    </>
  );
}

export default Profile;
