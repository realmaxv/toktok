import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import ProfileHeader from "@/components/ProfileHeader";
import { SquarePen } from "lucide-react";

interface ProfileData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  job_title: string | null;
  avatar_url: string | null;
  website_url: string | null;
  nick_name: string | null;
  created_at: string | null;
  bio: string | null;
}

interface PostPreview {
  id: string;
  content_url: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<PostPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
      if (!userId) {
        navigate("/login");
        return;
      }
      const { count: fetchedFollowerCount } = await supabase
        .from("followers")
        .select("*", { count: "exact", head: true })
        .eq("following_id", userId ?? "");

      const { count: fetchedFollowingCount } = await supabase
        .from("followers")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", userId ?? "");

      setFollowerCount(fetchedFollowerCount ?? 0);
      setFollowingCount(fetchedFollowingCount ?? 0);
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      let avatarUrl = "/default-avatar.png";
      if (profileData?.avatar_url) {
        const raw = profileData.avatar_url.replace(/^\/+/, "");
        if (raw.startsWith("http")) {
          avatarUrl = raw;
        } else {
          const { data: urlData } = supabase.storage
            .from("useruploads")
            .getPublicUrl(raw);
          avatarUrl = urlData?.publicUrl ?? "/default-avatar.png";
        }
      }
      if (profileData) {
        profileData.avatar_url = avatarUrl!;
      }

      // Fetch last 3 posts
      const { data: postData } = await supabase
        .from("posts")
        .select("id, content_url")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      // Post-Bilder auflösen
      const processedPosts = (postData || []).map((p) => {
        let imageUrl = "/default-post.png";
        if (p.content_url) {
          const rawPath = p.content_url.replace(/^\/+/, "");
          if (rawPath.startsWith("http")) {
            imageUrl = rawPath;
          } else {
            const { data: imgData } = supabase.storage
              .from("useruploads")
              .getPublicUrl(rawPath);
            imageUrl = imgData?.publicUrl ?? "/default-post.png";
          }
        }
        return { ...p, content_url: imageUrl };
      });
      setProfile(profileData ?? null);
      setPosts(processedPosts);
      setLoading(false);
    }
    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
      </div>
    );
  }

  if (!profile) {
    return <p className="text-center mt-20">Profile nicht gefunden.</p>;
  }

  const fullName = `${profile.first_name ?? ""} ${
    profile.last_name ?? ""
  }`.trim();

  return (
    <div className="flex flex-col min-h-screen pt-20 pb-20">
      <ProfileHeader />

      <div className="flex flex-col items-center text-center px-6 py-8 ">
        <div className="relative">
          <img
            src={profile.avatar_url || "/default-avatar.png"}
            alt="Avatar"
            className="w-32 h-32 rounded-full object-cover"
          />

          <Link
            to="/profile-edit"
            className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow"
          >
            <SquarePen className="w-5 h-5 text-[var(--color-brand-pink)]" />
          </Link>
        </div>
        <h2 className="mt-4 text-2xl font-bold">
          {fullName || profile.nick_name}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {profile.job_title}
        </p>
        <p className="mt-3 text-gray-700 dark:text-gray-300 max-w-md">
          {profile.bio
            ? profile.bio
            : "Hier steht deine Bio. Bearbeite dein Profil, um sie zu ändern."}
        </p>
        {profile.website_url && (
          <a
            href={profile.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-pink-500underline"
          >
            {profile.website_url}
          </a>
        )}
      </div>

      <div className="grid grid-cols-3 text-center py-4">
        <div>
          <div className="text-lg font-bold">{posts.length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Posts</div>
        </div>
        <div>
          <div className="text-lg font-bold">{followerCount}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Followers
          </div>
        </div>
        <div>
          <div className="text-lg font-bold">{followingCount}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Following
          </div>
        </div>
      </div>

      <div className="px-6 py-8 flex-1 ">
        <h3 className="flex items-center text-lg font-medium mb-4 text-[var(--color-brand-pink)]">
          Feeds
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {posts.map((p) => (
            <Link to={`/comments/${p.id}`} key={p.id}>
              <img
                src={p.content_url}
                alt={`Beitrag ${p.id}`}
                className="w-full h-24 object-cover rounded-md hover:opacity-80 transition-opacity"
              />
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
