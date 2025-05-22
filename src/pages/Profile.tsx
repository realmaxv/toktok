// src/pages/Profile.tsx
import { useState, useEffect } from "react";
import { mockUsers, mockPosts } from "../mockData";
import Footer from "@/components/Footer";
import ProfileHeader from "@/components/ProfileHeader";
import Spinner from "@/components/Spinner";
import { Link } from "react-router";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";

function Profile() {
  // 1) Loading-State
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 2) Simulate data fetching
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  console.log("Profile loaded");
  const currentUser = mockUsers.find((u) => u.username === "john_doe");
  const userPosts = mockPosts.filter(
    (p) => p.userId === (currentUser?.id || 1)
  );

  return (
    <>
      {/* Header always visible */}
      <ProfileHeader />

      {/* Content section */}
      <div className="relative flex flex-col items-center justify-center min-h-screen p-4">
        {/* Spinner overlay during loading */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-transparent z-10 pointer-events-none">
            <Spinner size={40} color="#FF7185" speed={1.2} />
          </div>
        )}

        {/* Actual content only once loaded; keeps container size due to min-h-screen */}
        {!loading && (
          <>
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
                  <strong>Website:</strong>{" "}
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
                  {post.content} (Likes: {post.likes}, Comments: {post.comments}
                  )
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Link to="/profile-detail">
                <button className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                  (Test Button) Profile Details
                </button>
              </Link>
            </div>
            <div>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate("/signin");
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </>
        )}
      </div>

      {/* Footer always visible */}
      <Footer />
    </>
  );
}

export default Profile;
