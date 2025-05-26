type Post = {
  id: string;
  caption: string | null;
  content_url: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase/client';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/auth-context';
import { nanoid } from 'nanoid';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

// Name deines Buckets
const BUCKET_NAME = 'useruploads';

export default function CreateNewPost({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { session } = useAuthContext();

  const MAX_CHARS = 500;

  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= MAX_CHARS) setCaption(text);
  };

  // Upload-Funktion mit Debugging
  const handleImageUpload = async (file: File): Promise<string | null> => {
    if (!session?.user?.id) {
      setError('You must be logged in to upload an image.');
      return null;
    }

    const userId = session.user.id;
    const fileExt = file.name.split('.').pop();
    const uniqueName = `${Date.now()}_${nanoid()}.${fileExt}`;
    const filePath = `${userId}/${uniqueName}`;

    console.log(`Uploading to bucket: ${BUCKET_NAME}, path: ${filePath}`);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        contentType: file.type,
        metadata: { user_id: userId },
      });

    if (uploadError) {
      console.error('Upload Error:', uploadError);
      setError(`Upload failed: ${uploadError.message}`);
      return null;
    }

    console.log('Upload successful:', uploadData);

    // Public Buckets: Get Public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    console.log('Public URL:', publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
  };

  const handleSubmit = async () => {
    if (!session?.user?.id) {
      setError('Du musst eingeloggt sein.');
      return;
    }

    if (!imageFile) {
      setError('Bitte füge ein erst ein Bild zum uploaden ein.');
      return;
    }

    if (!window.confirm('Post erstellen?')) return;

    setError(null);
    setIsLoading(true);

    try {
      let contentUrl = '';
      if (imageFile) {
        const url = await handleImageUpload(imageFile);
        if (!url) throw new Error('Image upload failed');
        contentUrl = url;
      }

      const now = new Date().toISOString();
      const { data: insertResult, error: insertError } = await supabase
        .from('posts')
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

      // Optional: direkt nach Post-Erstellung einen Like für den aktuellen User setzen
      const { error: likeError } = await supabase.from('post_likes').insert({
        post_id: insertResult?.[0]?.id,
        user_id: session.user.id,
      });
      if (likeError) {
        console.warn(
          'Post erstellt, aber Like konnte nicht gesetzt werden:',
          likeError
        );
      }

      navigate('/home');
    } catch (err: unknown) {
      console.error('Post creation error:', err);
      setError(err instanceof Error ? err.message : 'Error creating post');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Cancel? Unsaved changes lost.')) navigate('/home');
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setImageFile(e.target.files[0]);
  };

  return (
    <>
      <Header />
      <div
        className={cn(
          'min-h-screen flex items-center justify-center p-4 bg-stone-200 dark:bg-stone-950',
          className
        )}
        {...props}
      >
        <Card className="w-full max-w-md p-0 bg-transparent">
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="text-2xl p-4">Create New Post</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/home')}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex flex-col space-y-6">
              <div>
                <Label htmlFor="caption">What's new?</Label>
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

              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    document.getElementById('image-upload')?.click()
                  }
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
                {imageFile && <span className="text-sm">{imageFile.name}</span>}
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex flex-col space-y-3">
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full py-3 bg-[var(--color-button-pink)] text-white hover:bg-[var(--color-brand-pink)]"
                >
                  {isLoading ? 'Posting...' : 'Post'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="w-full py-3"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </>
  );
}
