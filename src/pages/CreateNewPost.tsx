type Post = {
  id: string;
  caption: string | null;
  content_url: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/auth-context";
import { nanoid } from "nanoid";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const BUCKET_NAME = "useruploads";

export default function CreateNewPost({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { session } = useAuthContext();

  const MAX_CHARS = 500;

  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= MAX_CHARS) setCaption(text);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    if (!session?.user?.id) {
      setError("You must be logged in to upload an image.");
      return null;
    }

    const userId = session.user.id;
    const fileExt = file.name.split(".").pop();
    const uniqueName = `${Date.now()}_${nanoid()}.${fileExt}`;
    const filePath = `${userId}/${uniqueName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        contentType: file.type,
        metadata: { user_id: userId },
      });

    if (uploadError) {
      console.error("Upload Error:", uploadError);
      setError(`Upload failed: ${uploadError.message}`);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  };

  const handleSubmit = async () => {
    if (!session?.user?.id) {
      setError("Du musst eingeloggt sein.");
      return;
    }

    if (!imageFile) {
      setError("Bitte füge ein Bild hinzu.");
      return;
    }

    if (!window.confirm("Post erstellen?")) return;

    setIsLoading(true);
    setError(null);

    try {
      const contentUrl = await handleImageUpload(imageFile);
      if (!contentUrl) throw new Error("Image upload failed");

      const now = new Date().toISOString();
      const { data: insertResult, error: insertError } = await supabase
        .from("posts")
        .insert({
          caption: caption || null,
          content_url: contentUrl,
          user_id: session.user.id,
          created_at: now,
          updated_at: now,
        })
        .select()
        .returns<Post[]>();

      if (insertError) throw insertError;

      // optional Like setzen
      const { error: likeError } = await supabase.from("post_likes").insert({
        post_id: insertResult?.[0]?.id,
        user_id: session.user.id,
      });
      if (likeError) {
        console.warn(
          "Post erstellt, aber Like konnte nicht gesetzt werden:",
          likeError
        );
      }

      navigate("/home");
    } catch (err: unknown) {
      console.error("Post creation error:", err);
      setError(
        err instanceof Error ? err.message : "Fehler beim Erstellen des Posts"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm("Cancel? Unsaved changes lost.")) navigate("/home");
  };

  return (
    <>
      <Header />
      <div
        className={cn(
          "min-h-screen flex items-center justify-center p-4 bg-stone-200 dark:bg-stone-950",
          className
        )}
        {...props}
      >

        <Card className="w-full max-w-md bg-transparent gap-0 p-1 mt-0">
          <CardHeader className="flex justify-center items-center">
            <Label htmlFor="caption" className="text-2xl pt-2">
              What's New?
            </Label>

          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-3">
            {/* Bild-Upload */}
            <div className="space-y-2 ">
              <div
                className="w-full aspect-square rounded-md border border-input shadow-xs flex items-center justify-center bg-transparent dark:bg-input/30 overflow-hidden cursor-pointer mb-0"
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Click to upload an image
                  </div>
                )}
              </div>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>

            {/* Caption */}
            <div>
              <Textarea
                id="caption"
                placeholder="Write a caption..."
                value={caption}
                onChange={handleCaptionChange}
                disabled={isLoading}
                rows={4}
              />
              <div className="text-sm text-muted-foreground text-right">
                {caption.length}/{MAX_CHARS}
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            {/* Buttons */}
            <div className="flex flex-col space-y-3">
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="cursor-pointer w-full py-3 bg-[var(--color-button-pink-active)] text-white hover:bg-[var(--color-brand-pink)] active:shadow-inner active:brightness-90 transition duration-150 ease-in-out mb-2"
              >
                {isLoading ? "Posting..." : "Post"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
                className="cursor-pointer w-full py-3 active:shadow-inner active:brightness-90 transition duration-150 ease-in-out"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
}
