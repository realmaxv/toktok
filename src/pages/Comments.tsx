import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/auth-context';
import { Image, Smile, Hash, Sparkles, UserRoundPen } from 'lucide-react';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

interface Post {
  id: string;
  caption: string | null;
  content_url: string | null;
  user_id: string;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  nick_name: string | null;
  avatar_url: string | null;
}

export default function Comments({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<
    {
      id: string;
      content: string;
      created_at: string;
      user_id: string;
      profiles: {
        first_name: string | null;
        last_name: string | null;
        nick_name: string | null;
        avatar_url: string | null;
      } | null;
    }[]
  >([]);
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { session } = useAuthContext();

  // Function to delete the post
  const handleDeletePost = async () => {
    if (!post?.id) return;
    const confirmed = window.confirm(
      'Are you sure you want to delete this post?'
    );
    if (!confirmed) return;
    try {
      const { error } = await supabase.from('posts').delete().eq('id', post.id);
      if (error) throw error;
      navigate('/');
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Could not delete post.');
    }
  };

  const MAX_CHARS = 500;

  useEffect(() => {
    async function fetchPost() {
      if (!id) {
        setError('No post ID provided');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('posts')
          .select(
            `
            id,
            caption,
            content_url,
            created_at,
            user_id,
            profiles (
              avatar_url,
              first_name,
              last_name,
              nick_name
            )
          `
          )
          .eq('id', id)
          .single();

        if (error) throw error;
        setPost({
          id: data.id,
          caption: data.caption,
          content_url: await (async () => {
            if (data.content_url && !data.content_url.startsWith('http')) {
              const { data: urlData } = await supabase.storage
                .from('postcontent')
                .getPublicUrl(data.content_url);
              return urlData?.publicUrl ?? null;
            }
            return data.content_url;
          })(),
          user_id: data.user_id,
          created_at: data.created_at,
          first_name: data.profiles?.first_name ?? null,
          last_name: data.profiles?.last_name ?? null,
          nick_name: data.profiles?.nick_name ?? null,
          avatar_url:
            data.profiles?.avatar_url &&
            !data.profiles.avatar_url.startsWith('http')
              ? supabase.storage
                  .from('useruploads')
                  .getPublicUrl(data.profiles.avatar_url).data.publicUrl
              : data.profiles?.avatar_url ?? null,
        });

        // Fetch comments for this post
        const { data: commentData, error: commentError } = await supabase
          .from('comments')
          .select(
            `
            id,
            content,
            created_at,
            user_id,
            profiles (
              first_name,
              last_name,
              nick_name,
              avatar_url
            )
          `
          )
          .eq('post_id', id)
          .order('created_at', { ascending: false });

        if (commentError) throw commentError;
        const processedComments = (commentData || []).map((comment) => {
          const avatarPath = comment.profiles?.avatar_url;
          const avatar =
            avatarPath && !avatarPath.startsWith('http')
              ? supabase.storage.from('useruploads').getPublicUrl(avatarPath)
                  .data.publicUrl
              : avatarPath;
          return {
            ...comment,
            profiles: {
              ...comment.profiles,
              avatar_url: avatar,
            },
          };
        });
        setComments(processedComments);
      } catch (error: unknown) {
        setError(
          error instanceof Error ? error.message : 'Failed to load post'
        );
      } finally {
        setIsLoading(false);
      }
    }
    fetchPost();
  }, [id, session?.user?.id]);

  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= MAX_CHARS) {
      setCaption(text);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!session?.user?.id) {
      setError('You must be logged in to upload an image.');
      return null;
    }
    const fileExt = file.name.split('.').pop();
    const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('postcontent')
      .upload(fileName, file);
    if (uploadError) {
      setError('Failed to upload image: ' + uploadError.message);
      return null;
    }
    const { data: publicData } = supabase.storage
      .from('postcontent')
      .getPublicUrl(fileName);
    return publicData?.publicUrl || null;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImageFile(file);
  };

  const handleReply = async () => {
    if (!session?.user?.id) {
      setError('You must be logged in to reply.');
      return;
    }
    if (!id) {
      setError('Post ID is missing.');
      return;
    }
    if ((!caption || caption.trim() === '') && !imageFile) {
      setError('Please provide a caption or an image.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      let contentUrl: string | null = null;
      if (imageFile) {
        contentUrl = await handleImageUpload(imageFile);
        if (!contentUrl) throw new Error('Image upload failed.');
      }

      const { error } = await supabase.from('comments').insert({
        content: caption.trim(),
        post_id: id,
        user_id: session.user.id,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Reset inputs
      setCaption('');
      setImageFile(null);

      // Reload comments directly after submitting
      const { data: commentData, error: commentError } = await supabase
        .from('comments')
        .select(
          `
          id,
          content,
          created_at,
          user_id,
          profiles (
            first_name,
            last_name,
            nick_name,
            avatar_url
          )
        `
        )
        .eq('post_id', id)
        .order('created_at', { ascending: false });

      if (commentError) throw commentError;

      const processedComments = (commentData || []).map((comment) => {
        const avatarPath = comment.profiles?.avatar_url;
        const avatar =
          avatarPath && !avatarPath.startsWith('http')
            ? supabase.storage.from('useruploads').getPublicUrl(avatarPath).data
                .publicUrl
            : avatarPath;
        return {
          ...comment,
          profiles: {
            ...comment.profiles,
            avatar_url: avatar,
          },
        };
      });
      setComments(processedComments);
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : 'Failed to submit comment'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmojiClick = () => console.log('Emoji functionality placeholder');
  const handleGifClick = () => console.log('GIF functionality placeholder');
  const handleHashtagClick = () =>
    console.log('Hashtag functionality placeholder');
  const handleAIClick = () => console.log('AI text generation placeholder');

  const timeSince = (date: Date) => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days >= 1) return `${days}d`;
    if (hours >= 1) return `${hours}h`;
    if (minutes >= 1) return `${minutes}m`;
    return `${seconds}s`;
  };

  return (
    <>
      <Header />
      <div
        className={cn(
          'min-h-screen flex flex-col p-0 pt-16 pb-20 mx-auto w-full items-center',
          className
        )}
        {...props}
      >
        <Card className=" w-full max-w-md flex flex-col border-none shadow-none  dark:bg-stone-950">
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
              </div>
            ) : error ? (
              <div className="flex flex-col gap-6">
                <p className="text-sm text-red-500">{error}</p>
                <div className="grid gap-2">
                  <Label htmlFor="comment">Add a comment</Label>
                  <Textarea
                    id="comment"
                    placeholder="What's on your mind?"
                    value={caption}
                    onChange={handleCaptionChange}
                    rows={4}
                    className="resize-none h-13"
                    disabled={isLoading}
                  />
                  <div className="text-sm text-muted-foreground text-right">
                    {caption.length}/{MAX_CHARS}
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      document.getElementById('image-upload')?.click()
                    }
                    aria-label="Upload image"
                  >
                    <Image className="h-5 w-5" />
                  </Button>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                  {imageFile && (
                    <span className="text-sm text-muted-foreground">
                      Image selected: {imageFile.name}
                    </span>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleEmojiClick}
                    aria-label="Add emoji"
                  >
                    <Smile className="h-5 w-5" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleGifClick}
                    aria-label="Add GIF"
                  >
                    <span className="text-xs font-bold">GIF</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleHashtagClick}
                    aria-label="Add hashtag"
                  >
                    <Hash className="h-5 w-5" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleAIClick}
                    aria-label="AI text generation"
                  >
                    <Sparkles className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ) : post ? (
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2">
                  <img
                    src={post.avatar_url || '/placeholder-avatar.png'}
                    alt="User avatar"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="text-sm">
                      {post.first_name || post.last_name
                        ? `${post.first_name || ''} ${post.last_name || ''}`
                        : 'Unknown'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      @{post.nick_name || 'unknown'} •{' '}
                      {timeSince(new Date(post.created_at))} ago
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {post.content_url && (
                    <img
                      src={post.content_url}
                      alt="Post content"
                      className="w-full h-auto rounded-lg object-cover max-h-96 max-w-full mx-auto"
                    />
                  )}
                  <p className="text-sm">{post.caption || 'No caption'}</p>
                </div>

                {session?.user?.id === post.user_id && (
                  <Button
                    variant="destructive"
                    onClick={handleDeletePost}
                    className="w-fit self-end"
                  >
                    Delete post
                  </Button>
                )}
                {/* Comments under the post */}
                <div className="flex flex-col gap-4 mt-4">
                  <h3 className="text-sm font-bold">Comments</h3>
                  {comments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No comments yet.
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <img
                          src={
                            comment.profiles?.avatar_url ||
                            '/placeholder-avatar.png'
                          }
                          alt="User avatar"
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-semibold">
                            {comment.profiles?.first_name ||
                            comment.profiles?.last_name
                              ? `${comment.profiles?.first_name || ''} ${
                                  comment.profiles?.last_name || ''
                                }`
                              : 'Unknown'}
                            <span className="ml-2 text-muted-foreground text-xs">
                              @{comment.profiles?.nick_name || 'user'}
                            </span>
                          </p>
                          {editingCommentId === comment.id ? (
                            <>
                              <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                rows={2}
                                className="mt-1 mb-2"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="px-1.5 py-0.5 text-xs"
                                  onClick={async () => {
                                    const { error } = await supabase
                                      .from('comments')
                                      .update({ content: editContent })
                                      .eq('id', comment.id);
                                    if (!error) {
                                      setComments((prev) =>
                                        prev.map((c) =>
                                          c.id === comment.id
                                            ? { ...c, content: editContent }
                                            : c
                                        )
                                      );
                                      setEditingCommentId(null);
                                    }
                                  }}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="px-1.5 py-0.5 text-xs"
                                  onClick={async () => {
                                    const { error } = await supabase
                                      .from('comments')
                                      .delete()
                                      .eq('id', comment.id);
                                    if (!error) {
                                      setComments((prev) =>
                                        prev.filter((c) => c.id !== comment.id)
                                      );
                                      setEditingCommentId(null);
                                    }
                                  }}
                                >
                                  Delete
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="px-1.5 py-0.5 text-xs"
                                  onClick={() => setEditingCommentId(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </>
                          ) : (
                            <>
                              <p className="text-sm">{comment.content}</p>
                              {comment.user_id === session?.user?.id && (
                                <div className="flex items-center gap-2 mt-1">
                                  <button
                                    onClick={() =>
                                      editingCommentId === comment.id
                                        ? setEditingCommentId(null)
                                        : (setEditingCommentId(comment.id),
                                          setEditContent(comment.content))
                                    }
                                    className="text-muted-foreground hover:text-foreground"
                                    aria-label="Edit comment"
                                  >
                                    <UserRoundPen className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {timeSince(new Date(comment.created_at))} ago
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="comment">Write a comment</Label>
                  <Textarea
                    id="comment"
                    placeholder="What's on your mind?"
                    value={caption}
                    onChange={handleCaptionChange}
                    rows={4}
                    className="resize-none h-13"
                    disabled={isLoading}
                  />
                  <div className="text-sm text-muted-foreground text-right">
                    {caption.length}/{MAX_CHARS}
                  </div>
                  <Button
                    type="button"
                    className="text-lg h-13 bg-[var(--color-button-pink-active)] text-white hover:bg-[var(--color-brand-pink)]"
                    onClick={handleReply}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Replying...' : 'Reply'}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-red-500">Post not found.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
}
