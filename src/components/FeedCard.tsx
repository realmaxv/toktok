import placeholder from '@/assets/avatar_placeholder.png';
import { supabase } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Heart, MessageCircleMore } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

type FeedCardProps = {
  id: string;
  userId: string;
  authorId: string;
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
  authorId,
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

    if (!userId) {
      console.error('Kein userId übergeben – Like nicht möglich');
      setIsProcessingLike(false);
      return;
    }

    const { data: likeMatches, error } = await supabase
      .from('post_likes')
      .select('*')
      .eq('post_id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Fehler beim Prüfen des Likes:', error);
      setIsProcessingLike(false);
      return;
    }

    const existingLike =
      Array.isArray(likeMatches) &&
      likeMatches.some((like) => like.user_id?.trim() === userId.trim());

    if (existingLike) {
      setLiked(false);
      setLikeCount((prev) => Math.max(prev - 1, 0));

      const { error: deleteError } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', id)
        .eq('user_id', userId);

      if (deleteError)
        console.error('Fehler beim Entfernen des Likes:', deleteError);
    } else {
      const { error: insertError } = await supabase
        .from('post_likes')
        .insert({ post_id: id, user_id: userId });

      if (insertError) {
        console.error('Fehler beim Hinzufügen des Likes:', insertError);
      } else {
        setLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    }

    await queryClient.invalidateQueries({ queryKey: ['posts', userId] });
    setIsProcessingLike(false);
  };

  return (
    <main
      id={id}
      className="
        w-full
        grid grid-cols-1
        gap-0 p-0
      "
    >

      <article className="relative flex flex-col">

        <div className="flex items-center p-4 space-x-4">
          <Link to={`/profile/${authorId}`}>
            <div
              className="w-12 h-12 rounded-full bg-center bg-cover"
              style={{ backgroundImage: `url(${avatarPath || placeholder})` }}
            />
          </Link>
          <div className="flex flex-col">
            <Link to={`/profile/${authorId}`}>
              <p className="font-medium hover:underline">{nickName}</p>
            </Link>
            <p className="text-sm text-gray-500">{jobTitle}</p>
          </div>
        </div>


        <div
          className="relative w-full pb-[120%] bg-center bg-cover"
          style={{ backgroundImage: `url(${imagePath})` }}
        />


        <div className="p-4 flex flex-col space-y-4">
          <p className="text-base leading-snug">{caption}</p>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              disabled={isProcessingLike}
              className={`flex items-center space-x-2 ${
                isProcessingLike ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <Heart
                className={`w-7 h-7 transition-colors duration-300 ${
                  liked
                    ? 'fill-[#ff4d67] text-[#ff4d67]'
                    : 'fill-none text-gray-600 dark:text-gray-400'
                }`}
              />
              <span className="font-semibold text-gray-600 dark:text-gray-400">
                {likeCount}
              </span>
            </button>
            <Link
              to={`/comments/${id}`}
              className="flex items-center space-x-2"
            >
              <MessageCircleMore className="w-7 h-7 text-gray-600 dark:text-gray-400" />
              <span className="font-semibold text-gray-600 dark:text-gray-400">
                {commentsCount}
              </span>
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}

export default FeedCard;