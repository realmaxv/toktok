import { useQuery } from "@tanstack/react-query";
import FeedCard from "./FeedCard";
import { supabase } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

function FeedList() {
  const [currentUserId, setCurrentUserId] = useState<string>("");
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error) {
        console.error("Error fetching user:", error);
      } else if (user) {
        setCurrentUserId(user.id);
      }
    });
  }, []);

  const { data, isError } = useQuery({
    queryFn: async () => {
      const res = await supabase
        .from("posts")
        .select("*, profiles(*), post_likes(user_id), comments(id)");
      if (isError) {
        console.log(isError);
      }
      return res.data;
    },
    queryKey: ["posts"],
  });

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
        .map((single) => (
          <FeedCard
            userId={currentUserId}
            caption={single.caption ?? ""}
            key={single.id}
            id={single.id}
            nickName={
              single.profiles?.first_name + " " + single.profiles?.last_name
            }
            avatarPath={single.profiles?.avatar_url ?? ""}
            commentsCount={single.comments?.length.toString() ?? "0"}
            likesCount={
              Array.isArray(single.post_likes)
                ? single.post_likes.length.toString()
                : "0"
            }
            imagePath={single.content_url}
            jobTitle={single.profiles.job_title ?? ""}
            likedByUser={
              Array.isArray(single.post_likes) &&
              single.post_likes.some((like) => like.user_id === currentUserId)
            }
          />
        ))}
    </div>
  );
}

export default FeedList;
