import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/auth-context";
import { Image, Smile, Hash, Sparkles } from "lucide-react";
import logo from '@/assets/logo.svg';
import { BackButton } from "@/components/BackButton";

interface Post {
  id: string;
  caption: string | null;
  content_url: string | null;
  user_id: string;
  created_at: string;
  handle: string;
  first_name: string | null;
  last_name: string | null;
}

export default function Comments({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { session } = useAuthContext();

  const MAX_CHARS = 500;

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) {
        setError("No post ID provided");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("posts")
          .select(`
            id,
            caption,
            content_url,
            user_id,
            created_at,
            public_profiles (handle),
            profiles (first_name, last_name)
          `)
          .eq("id", postId)
          .single();

        if (error) throw error;
        setPost(data as Post);
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : "Failed to load post");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [postId]);

  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= MAX_CHARS) {
      setCaption(text);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!session?.user?.id) {
      setError("You must be logged in to upload an image.");
      return null;
    }
    const fileExt = file.name.split(".").pop();
    const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
    const { error: uploadError, data } = await supabase.storage
      .from("post-content")
      .upload(fileName, file);
    if (uploadError) {
      setError("Failed to upload image: " + uploadError.message);
      return null;
    }
    const { data: publicData } = supabase.storage
      .from("post-content")
      .getPublicUrl(fileName);
    return publicData?.publicUrl || null;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImageFile(file);
  };

  const handleReply = async () => {
    if (!session?.user?.id) {
      setError("You must be logged in to reply.");
      return;
    }
    if (!caption && !imageFile) {
      setError("Please provide a caption or an image.");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      let contentUrl: string | null = null;
      if (imageFile) {
        contentUrl = await handleImageUpload(imageFile);
        if (!contentUrl) throw new Error("Image upload failed.");
      }

      const { error } = await supabase.from("comments").insert({
        content: caption || null,
        post_id: postId,
        user_id: session.user.id,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      setCaption("");
      setImageFile(null);
      navigate("/home");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to submit comment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmojiClick = () => console.log("Emoji functionality placeholder");
  const handleGifClick = () => console.log("GIF functionality placeholder");
  const handleHashtagClick = () => console.log("Hashtag functionality placeholder");
  const handleAIClick = () => console.log("AI text generation placeholder");

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
    <div className={cn("min-h-screen flex flex-col p-4 bg-stone-200 dark:bg-stone-950", className)} {...props}>
      <Card className="w-full max-w-md flex flex-col border-none shadow-none bg-stone-200 dark:bg-stone-950">
        <CardHeader className="flex flex-row items-center justify-between">
          <BackButton onClick={() => navigate("/home")} />
          <Button
            type="button"
            className="text-lg h-13 bg-[var(--color-button-pink)] text-white hover:bg-[var(--color-brand-pink)]"
            onClick={handleReply}
            disabled={isLoading}
          >
            {isLoading ? "Replying..." : "Reply"}
          </Button>
        </CardHeader>
        {/* <div className="flex items-center justify-center p-4">
          <img src={logo} alt="TokTok Logo" className="w-[25px] h-[25px]" />
        </div> */}
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
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
                  onClick={() => document.getElementById("image-upload")?.click()}
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
                  src={post.content_url || "/placeholder-avatar.png"}
                  alt="User avatar"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="text-sm">
                    {post.first_name || post.last_name
                      ? `${post.first_name || ""} ${post.last_name || ""}`
                      : "Unknown"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    @{post.handle} • {timeSince(new Date(post.created_at))} ago
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {post.content_url && (
                  <img
                    src={post.content_url}
                    alt="Post content"
                    className="w-full h-auto rounded-lg"
                  />
                )}
                <p className="text-sm">{post.caption || "No caption"}</p>
              </div>
              {session?.user && (
                <div className="flex items-center gap-2">
                  <img
                    src="/placeholder-avatar.png"
                    alt="Current user avatar"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="text-sm">
                      {session.user.user_metadata?.first_name ||
                        session.user.user_metadata?.last_name
                        ? `${session.user.user_metadata?.first_name || ""} ${
                            session.user.user_metadata?.last_name || ""
                          }`
                        : "Current User"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      @{session.user.user_metadata?.handle || "user"}
                    </p>
                  </div>
                </div>
              )}
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
                  onClick={() => document.getElementById("image-upload")?.click()}
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
          ) : (
            <div className="flex flex-col gap-6">
              <p className="text-sm text-muted-foreground">No post data available</p>
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
                  onClick={() => document.getElementById("image-upload")?.click()}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}