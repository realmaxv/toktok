import { useQuery } from "@tanstack/react-query";
import FeedCard from "./FeedCard";
import { supabase } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

function FeedList() {
  const [currentUserId, setCurrentUserId] = useState<string>("");
  useEffect(() => {
    const getInitialUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setCurrentUserId(session?.user?.id ?? "");
      }
    );

    getInitialUser();

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const { data } = useQuery({
    queryFn: async () => {
      const res = await supabase
        .from("posts")
        // Sort by newest first
        .select("*, profiles(*), post_likes(user_id), comments(id)")
        .order("created_at", { ascending: false });

      if (res.error) {
        console.error("Fehler beim Laden der Posts:", res.error);
        return [];
      }

      const processed =
        res.data?.map((single) => {
          let image_url = "/default-post.png";
          if (single.content_url) {
            if (single.content_url.startsWith("http")) {
              image_url = single.content_url;
            } else {
              const rawImagePath = single.content_url;
              const { data: imgUrlData } = supabase.storage
                .from("useruploads")
                .getPublicUrl(rawImagePath);
              image_url = imgUrlData?.publicUrl ?? "/default-post.png";
            }
          }
          console.log("imagePath for post", single.id, ":", single.content_url);

          let avatar_url = "/default-avatar.png";
          if (single.profiles?.avatar_url) {
            if (single.profiles.avatar_url.startsWith("http")) {
              avatar_url = single.profiles.avatar_url;
            } else {
              const rawAvatarPath = single.profiles.avatar_url.replace(
                /^\/+/,
                ""
              );
              const { data: avaUrlData } = supabase.storage
                .from("useruploads")
                .getPublicUrl(rawAvatarPath);
              avatar_url = avaUrlData?.publicUrl ?? "/default-avatar.png";
            }
          }

          return {
            ...single,
            content_url: image_url,
            profiles: {
              ...single.profiles,
              avatar_url,
            },
            likedByUser: (() => {
              const liked = Array.isArray(single.post_likes)
                ? single.post_likes.some(
                    (like) =>
                      typeof like?.user_id === "string" &&
                      like.user_id.trim() === currentUserId.trim()
                  )
                : false;
              console.log("DEBUG likedByUser", {
                postId: single.id,
                currentUserId,
                liked,
                likeUserIds: single.post_likes?.map((l) => l.user_id),
              });
              return liked;
            })(),
          };
        }) ?? [];

      return processed;
    },
    queryKey: ["posts", currentUserId],
    enabled: !!currentUserId,
  });
  console.log("Rendering FeedList, currentUserId:", currentUserId);

  return (
    <div
      style={{
        msOverflowStyle: "none",
        scrollbarWidth: "none",
      }}
      className="flex flex-col pt-22 pb-22 gap-6 w-full h-screen overflow-scroll scroll-smooth"
    >
      {data
        ?.filter((single) => single.profiles !== null)
        .map((single) => {
          console.log(
            "Post",
            single.id,
            "likedByUser:",
            single.likedByUser,
            "userId:",
            currentUserId,
            "likes:",
            single.post_likes
          );
          return (
            <FeedCard
              userId={currentUserId}
              authorId={single.user_id}
              caption={single.caption ?? ""}
              key={single.id}
              id={single.id}
              nickName={
                single.profiles?.first_name + " " + single.profiles?.last_name
              }
              avatarPath={single.profiles?.avatar_url}
              commentsCount={single.comments?.length.toString() ?? "0"}
              likesCount={
                Array.isArray(single.post_likes)
                  ? single.post_likes.length.toString()
                  : "0"
              }
              imagePath={single.content_url}
              jobTitle={single.profiles.job_title ?? ""}
              likedByUser={single.likedByUser}
            />
          );
        })}
    </div>
  );
}

export default FeedList;
