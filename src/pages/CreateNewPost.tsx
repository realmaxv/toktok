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

    // Private Buckets: Signed URL
    const { data: urlData, error: urlError } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 3600);

    if (urlError) {
      console.error('Signed URL Error:', urlError);
      setError(`URL generation failed: ${urlError.message}`);
      return null;
    }

    console.log('Signed URL:', urlData.signedUrl);
    return urlData.signedUrl;
  };

  const handleSubmit = async () => {
    if (!session?.user?.id) {
      setError('You must be logged in to create a post.');
      return;
    }

    if (!caption && !imageFile) {
      setError('Please provide a caption or an image.');
      return;
    }

    if (!window.confirm('Create this post?')) return;

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
      const { error: insertError } = await supabase.from('posts').insert({
        caption: caption || null,
        content_url: contentUrl,
        user_id: session.user.id,
        created_at: now,
        updated_at: now,
      });

      if (insertError) throw insertError;
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
          <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
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
                onClick={() => document.getElementById('image-upload')?.click()}
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
  );
}
