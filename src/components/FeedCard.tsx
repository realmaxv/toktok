import placeholder from "@/assets/avatar_placeholder.png";
import { supabase } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Heart, MessageCircleMore } from "lucide-react";
import { useState, useEffect } from "react";
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
  const [liked, setLiked] = useState(likedByUser);
  useEffect(() => {
    setLiked(likedByUser);
  }, [likedByUser]);
  const [likeCount, setLikeCount] = useState(() => {
    const count = Number(likesCount);
    return isNaN(count) ? 0 : count;
  });

  const [isProcessingLike, setIsProcessingLike] = useState(false);

  const handleLike = async () => {
    if (isProcessingLike) return;
    setIsProcessingLike(true);

    console.log("post_id:", id);
    if (!userId) {
      console.error("Kein userId übergeben – Like nicht möglich");
      setIsProcessingLike(false);
      return;
    }
    console.log("user_id:", userId);

    const { data: likeMatches, error } = await supabase
      .from("post_likes")
      .select("*")
      .eq("post_id", id)
      .eq("user_id", userId);

    const existingLike =
      Array.isArray(likeMatches) &&
      likeMatches.some(
        (like) =>
          typeof like?.user_id === "string" &&
          like.user_id.trim() === userId.trim()
      );
    console.log("Gefundene Likes für diesen User/Post:", likeMatches);

    if (error) {
      console.error("Fehler beim Prüfen des Likes:", error);
      setIsProcessingLike(false);
      return;
    }

    if (existingLike) {
      // Logging before removing like
      console.log("Like entfernt durch User:", userId);

      setLiked(false);
      setLikeCount((prev) => {
        const newCount = Math.max(prev - 1, 0);
        console.log(
          "Updated Like State – liked:",
          false,
          "likeCount:",
          newCount
        );
        return newCount;
      });

      const { error: deleteError } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", id)
        .eq("user_id", userId);

      if (deleteError) {
        console.error("Fehler beim Entfernen des Likes:", deleteError);
        setIsProcessingLike(false);
        return;
      }
    } else {
      // Logging before adding like
      console.log("Like erfolgreich gesetzt durch User:", userId);

      const { error: insertError } = await supabase
        .from("post_likes")
        .insert({
          post_id: id,
          user_id: userId,
        })
        .select();

      // Kontrolle: Insert erfolgreich?
      if (!insertError) {
        console.log("INSERT erfolgreich für post:", id, "user:", userId);
      }
      // Prüfen, ob insertError wirklich null ist
      if (insertError) {
        console.error("Fehler beim Hinzufügen des Likes:", insertError);
        setIsProcessingLike(false);
        return;
      }

      setLiked(true);
      setLikeCount((prev) => {
        const newCount = prev + 1;
        console.log(
          "Updated Like State – liked:",
          true,
          "likeCount:",
          newCount
        );
        return newCount;
      });
    }

    await queryClient.invalidateQueries({ queryKey: ["posts", userId] });
    await queryClient.refetchQueries({ queryKey: ["posts", userId] });

    setIsProcessingLike(false);
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
              disabled={isProcessingLike}
              className={`flex items-center space-x-2 ${
                isProcessingLike ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <Heart
                className={`w-7 h-7 transition-colors duration-300 ${
                  liked
                    ? "fill-pink-500 text-pink-500"
                    : "fill-none text-gray-400"
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
