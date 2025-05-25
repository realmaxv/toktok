import Footer from "@/components/Footer";
import ProfileDetailsHeader from "@/components/ProfileDetailsHeader";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  nick_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  birth_date?: string | null;
  created_at?: string | null;
  gender?: string | null;
  job_title?: string | null;
  last_signin_at?: string | null;
  website_url?: string | null;
  follower_count?: number;
  following_count?: number;
}

interface Post {
  id: string;
  content_url: string;
}

export default function ProfileDetails() {
  const { id } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("/avatar-placeholder.png");

  useEffect(() => {
    const fetchData = async () => {
      const { data: sessionData } = await supabase.auth.getUser();
      setCurrentUserId(sessionData.user?.id ?? null);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id ?? "")
        .single();

      setProfile(profileData);

      const { count: followerCount } = await supabase
        .from("followers")
        .select("*", { count: "exact", head: true })
        .eq("following_id", id ?? "");

      const { count: followingCount } = await supabase
        .from("followers")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", id ?? "");

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              follower_count: followerCount ?? 0,
              following_count: followingCount ?? 0,
            }
          : null
      );

      if (profileData?.avatar_url) {
        const raw = profileData.avatar_url.replace(/^\/+/, "");
        if (raw.startsWith("http")) {
          setAvatarUrl(raw);
        } else {
          const { data: urlData } = supabase.storage
            .from("useruploads")
            .getPublicUrl(raw);
          setAvatarUrl(urlData?.publicUrl ?? "/avatar-placeholder.png");
        }
      }

      const { data: postData } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", id ?? "")
        .order("created_at", { ascending: false });

      const processedPosts = await Promise.all(
        (postData ?? []).map(async (p) => {
          const rawPath = p.content_url?.replace(/^\/+/, "") ?? "";
          if (rawPath.startsWith("http")) return { ...p, content_url: rawPath };
          const { data: imgData } = supabase.storage
            .from("useruploads")
            .getPublicUrl(rawPath);
          return {
            ...p,
            content_url: imgData?.publicUrl ?? "/default-post.png",
          };
        })
      );
      setPosts(processedPosts);

      // Check if current user is following this profile
      if (sessionData.user?.id && id && id !== sessionData.user.id) {
        const { data: followData } = await supabase
          .from("followers")
          .select("id")
          .eq("follower_id", sessionData.user.id)
          .eq("following_id", id ?? "")
          .maybeSingle();
        setIsFollowing(!!followData);
      }
    };

    fetchData();
  }, [id]);

  const handleFollow = async () => {
    if (!currentUserId || !id) return;
    if (isFollowing) {
      await supabase
        .from("followers")
        .delete()
        .eq("follower_id", currentUserId)
        .eq("following_id", id ?? "");
      setIsFollowing(false);
    } else {
      await supabase.from("followers").insert({
        follower_id: currentUserId,
        following_id: id,
      });
      setIsFollowing(true);
    }
  };

  return (
    <>
      <ProfileDetailsHeader />
      <div className="flex flex-col items-center px-6 py-8 min-h-[calc(100vh-120px)] overflow-y-auto pt-[72px] pb-[72px] text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-900">
        {profile && (
          <>
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover mb-4"
            />
            <h1 className="text-2xl font-bold">
              {profile.first_name} {profile.last_name}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              @{profile.nick_name}
            </p>
            <div className="flex gap-6 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span>{profile.follower_count} Follower</span>
              <span>{profile.following_count} Following</span>
            </div>
            <p className="mt-2 text-center max-w-md text-gray-700 dark:text-gray-300">
              {profile.bio}
            </p>
            {currentUserId && id && currentUserId !== id && (
              <button
                onClick={handleFollow}
                className="mt-4 px-4 py-2 rounded font-medium transition-colors text-white"
                style={{ backgroundColor: "#ff4d67" }}
              >
                {isFollowing ? "Entfolgt" : "Folgen"}
              </button>
            )}
          </>
        )}
        <div className="grid grid-cols-3 gap-2 mt-8 w-full max-w-2xl">
          {posts.map((post) => (
            <Link to={`/comments/${post.id}`} key={post.id}>
              <img
                src={post.content_url}
                alt="Post preview"
                className="w-full h-24 object-cover rounded-md hover:opacity-80 transition-opacity"
              />
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
