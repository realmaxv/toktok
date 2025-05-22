import { useQuery } from "@tanstack/react-query";
import FeedCard from "./FeedCard";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";

function FeedList() {
  const session = useSession();
  const currentUserId = session?.user.id;

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

  console.log(data);

  return (
    <div
      style={{
        msOverflowStyle: "none",
        scrollbarWidth: "none",
      }}
      className="flex flex-col pt-22 pb-22 gap-6 w-full h-screen overflow-scroll scroll-smooth"
    >
      {data?.map((single) => (
        <FeedCard
          userId={single.user_id}
          caption={single.caption ?? ""}
          key={single.id}
          id={single.id}
          nickName={
            single.profiles.first_name + " " + single.profiles.last_name
          }
          avatarPath={single.profiles.avatar_url ?? ""}
          commentsCount={single.comments?.length.toString() ?? "0"}
          likesCount={single.post_likes?.length.toString() ?? "0"}
          imagePath={single.content_url}
          jobTitle={single.profiles.job_title ?? ""}
          likedByUser={
            (() => {
              const isLiked =
                Array.isArray(single.post_likes) &&
                single.post_likes.some((like) => like.user_id === currentUserId);
              if (isLiked) {
                localStorage.setItem(`liked_${single.id}`, "true");
              } else {
                localStorage.removeItem(`liked_${single.id}`);
              }
              return isLiked;
            })()
          }
        />
      ))}
    </div>
  );
}

export default FeedList;
