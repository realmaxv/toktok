import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Image, Smile, Hash, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/auth-context";
import logo from '@/assets/logo.svg';

export default function CreateNewPost({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { session } = useAuthContext();

  const MAX_CHARS = 500;

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

  const handleSubmit = async () => {
    if (!session?.user?.id) {
      setError("You must be logged in to create a post.");
      return;
    }

    if (!caption && !imageFile) {
      setError("Please provide a caption or an image.");
      return;
    }

    const confirmPost = window.confirm("Are you sure you want to create this post?");
    if (!confirmPost) return;

    setError(null);
    setIsLoading(true);

    try {
      let contentUrl: string | null = null;
      if (imageFile) {
        contentUrl = await handleImageUpload(imageFile);
        if (!contentUrl) throw new Error("Image upload failed.");
      }

      const { error } = await supabase.from("posts").insert({
        caption: caption || null,
        content_url: contentUrl || "",
        user_id: session.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      navigate("/home");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred while creating the post");
      console.log("Post creation failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    const confirmCancel = window.confirm("Are you sure you want to cancel? Any unsaved changes will be lost.");
    if (confirmCancel) {
      navigate("/home");
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleEmojiClick = () => {
    console.log("Emoji functionality placeholder - use system emoji picker");
  };

  const handleGifClick = () => {
    console.log("GIF functionality placeholder");
  };

  const handleHashtagClick = () => {
    console.log("Hashtag functionality placeholder - fetch from database");
  };

  const handleAIClick = () => {
    console.log("AI text generation placeholder - reserved for AI API");
  };

  return (
    <div className={cn("min-h-screen flex items-center justify-center p-4 bg-stone-200 dark:bg-stone-950", className)} {...props}>
      <Card className="w-full max-w-md flex flex-col border-none shadow-none bg-stone-200 dark:bg-stone-950">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-3xl p-4">Create New Post</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/home")}
            aria-label="Back to home"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </CardHeader>
        {/* <div className="flex items-center justify-center p-4">
          <img src={logo} alt="TokTok Logo" className="w-[25px] h-[25px]" />
        </div> */}
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="caption">What's new?</Label>
              <Textarea
                id="caption"
                placeholder="What's new?"
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

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex flex-col gap-4">
              <Button
                type="button"
                className="text-lg mt-2 h-13 w-full bg-[var(--color-button-pink)] text-white hover:bg-[var(--color-brand-pink)]"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? "Posting..." : "Post"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="text-lg mt-2 h-13 w-full"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}