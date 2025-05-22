import placeholder from "@/assets/avatar_placeholder.png";
import { supabase } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Heart, MessageCircleMore } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";

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
    <main id={id} className="flex flex-col items-center w-full h-full px-6 ">
      <div className="flex  flex-col items-center gap-4 px-2">
        <header className=" flex items-start w-full gap-4 ">
          <div
            style={{
              backgroundImage: `url(${avatarPath || placeholder})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            className="size-12 rounded-full"
          ></div>
          <div className="flex flex-col items-start">
            <p className="font-medium">{nickName}</p>
            <p className="font-extralight">{jobTitle}</p>
          </div>
        </header>
        <div
          style={{
            backgroundImage: `url(${imagePath})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          className="size-90 rounded-4xl shadow shadow-accent"
        ></div>
        <p className="font-extrabold font-serif text-left w-full">
          {caption || ""}
        </p>
        <div className="flex items-center justify-start w-full gap-4 ">
          <button onClick={handleLike} className="flex items-center gap-2">
            <Heart className={!liked ? "w-7 h-7" : "w-7 h-7 fill-red-600"} />
            <p className="font-semibold">{likeCount}</p>
          </button>
          <Link to={"/comments"} className="flex items-center gap-2">
            <MessageCircleMore className="w-7 h-7" />
            <p className="font-semibold">{commentsCount}</p>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default FeedCard;
