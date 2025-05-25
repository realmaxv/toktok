import placeholder from "@/assets/avatar_placeholder.png";
import { supabase } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Heart, MessageCircleMore } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

type FeedCardProps = {
  id: string;
  userId: string;
  nickName: string;
  jobTitle: string;
  avatarPath: string;
  imagePath: string;
  likesCount: string;
  commentsCount: string;
  caption: string;
  likedByUser: boolean;
};

function FeedCard({
  id,
  userId,
  nickName,
  jobTitle,
  avatarPath,
  imagePath,
  likesCount,
  commentsCount,
  caption,
  likedByUser,
}: FeedCardProps) {
  const queryClient = useQueryClient();
  const hasLoadedFromStorage = useRef(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(() => Number(likesCount));

  useEffect(() => {
    if (!hasLoadedFromStorage.current) {
      const stored = localStorage.getItem(`liked_${id}`);
      setLiked(stored === "true" || likedByUser);
      hasLoadedFromStorage.current = true;
    }
  }, [id, likedByUser]);

  const handleLike = async () => {
    console.log("post_id:", id);
    console.log("user_id:", userId);

    const { data: existingLike, error } = await supabase
      .from("post_likes")
      .select("*")
      .eq("post_id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Fehler beim Prüfen des Likes:", error);
      return;
    }

    if (existingLike) {
      const { error: deleteError } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", id)
        .eq("user_id", userId);

      if (deleteError) {
        console.error("Fehler beim Entfernen des Likes:", deleteError);
        return;
      }

      setLiked(false);
      setLikeCount((prev) => prev - 1);
      console.log("Removing localStorage liked:", id);
      localStorage.removeItem(`liked_${id}`);
    } else {
      // Like
      const { error: insertError } = await supabase.from("post_likes").insert({
        post_id: id,
        user_id: userId,
      });

      if (insertError) {
        console.error("Fehler beim Hinzufügen des Likes:", insertError);
        return;
      }

      setLiked(true);
      setLikeCount((prev) => prev + 1);
      console.log("Setting localStorage liked:", id);
      localStorage.setItem(`liked_${id}`, "true");
    }

    queryClient.invalidateQueries({ queryKey: ["posts"] });
  };

  return (
    <main
      id={id}
      className="
    container mx-auto
    grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
    gap-6 p-4
  "
    >
      <article className="rounded-2xl overflow-hidden flex flex-col">
        <Link
          to={`/profile/${userId}`}
          className="flex items-center p-4 space-x-4"
        >
          <div
            className="w-12 h-12 rounded-full bg-center bg-cover"
            style={{ backgroundImage: `url(${avatarPath || placeholder})` }}
          />
          <div className="flex flex-col">
            <p className="font-medium">{nickName}</p>
            <p className="text-sm text-gray-500">{jobTitle}</p>
          </div>
        </Link>

        <div
          className="relative w-full pb-[100%] bg-center bg-cover rounded-3xl"
          style={{ backgroundImage: `url(${imagePath})` }}
        />

        <div className="p-4 flex flex-col space-y-4">
          <p className="text-base font-bold leading-snug">{caption}</p>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className="flex items-center space-x-2"
            >
              <Heart
                className={`w-7 h-7 ${
                  liked
                    ? "fill-[var(--color-brand-pink)] text-[var(--color-brand-pink)]"
                    : ""
                }`}
              />
              <span className="font-semibold">{likeCount}</span>
            </button>
            <Link
              to={`/comments/${id}`}
              className="flex items-center space-x-2"
            >
              <MessageCircleMore className="w-7 h-7" />
              <span className="font-semibold">{commentsCount}</span>
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}

export default FeedCard;
