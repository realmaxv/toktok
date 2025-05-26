import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { nanoid } from 'nanoid';
import { SquarePen } from 'lucide-react';

interface ProfileData {
  first_name: string | null;
  last_name: string | null;
  nick_name: string | null;
  job_title: string | null;
  website_url: string | null;
  avatar_url: string | null;
  bio: string | null;
}

export default function ProfileEdit() {
  const [profile, setProfile] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    nick_name: '',
    job_title: '',
    website_url: '',
    avatar_url: null,
    bio: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // Load existing profile
  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select(
          'first_name,last_name,nick_name,job_title,website_url,avatar_url,profile_bio:bio'
        )
        .eq('id', user.id)
        .single();
      if (fetchError) {
        console.error('Error loading profile:', fetchError.message);
        setLoading(false);
        return;
      }
      if (profileData) {
        setProfile({
          ...profileData,
          bio: profileData.profile_bio,
        });
      }
      setLoading(false);
    }
    load();
  }, [navigate]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAvatarFile(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    let avatar_url = profile.avatar_url;

    // Wenn neuer Avatar gewählt, erst uploaden
    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop();
      const fileName = `avatar_${nanoid()}.${ext}`;
      const filePath = `${user.id}/${fileName}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('useruploads')
        .upload(filePath, avatarFile, { cacheControl: '3600' });
      if (uploadError) {
        console.error('Avatar upload error', uploadError.message);
      } else if (uploadData?.path) {
        avatar_url = uploadData.path;
      }
    }

    // Profil aktualisieren
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        first_name: profile.first_name,
        last_name: profile.last_name,
        nick_name: profile.nick_name,
        job_title: profile.job_title,
        website_url: profile.website_url,
        avatar_url,
        bio: profile.bio,
      })
      .eq('id', user.id);
    if (updateError) {
      console.error('Profile update error', updateError.message);
    }
    setSaving(false);
    navigate('/profile');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pt-9 pb-20">
      <Header />

      <form
        onSubmit={handleSubmit}
        className="mt-20 px-6 flex flex-col items-center space-y-6"
      >
        {/* Avatar picker mit SquarePen */}
        <div className="relative">
          <img
            src={
              avatarFile
                ? URL.createObjectURL(avatarFile)
                : profile.avatar_url && !profile.avatar_url.startsWith('http')
                ? supabase.storage
                    .from('useruploads')
                    .getPublicUrl(profile.avatar_url).data.publicUrl
                : profile.avatar_url || '/default-avatar.png'
            }
            alt="Avatar"
            className="w-32 h-32 rounded-full object-cover mb-2"
          />
          <input
            id="avatarInput"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="absolute inset-0 opacity-0 cursor-pointer rounded-full"
          />
          <label
            htmlFor="avatarInput"
            className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow cursor-pointer"
          >
            <SquarePen className="w-5 h-5 text-[var(--color-brand-pink)]" />
          </label>
        </div>

        {/* Form fields */}
        <div className="w-full max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium">First Name</label>
            <input
              type="text"
              className="mt-1 block w-full border rounded p-2"
              value={profile.first_name || ''}
              onChange={(e) =>
                setProfile({ ...profile, first_name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Last Name</label>
            <input
              type="text"
              className="mt-1 block w-full border rounded p-2"
              value={profile.last_name || ''}
              onChange={(e) =>
                setProfile({ ...profile, last_name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Nickname</label>
            <input
              type="text"
              className="mt-1 block w-full border rounded p-2"
              value={profile.nick_name || ''}
              onChange={(e) =>
                setProfile({ ...profile, nick_name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Job Title</label>
            <input
              type="text"
              className="mt-1 block w-full border rounded p-2"
              value={profile.job_title || ''}
              onChange={(e) =>
                setProfile({ ...profile, job_title: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Website URL</label>
            <input
              type="url"
              className="mt-1 block w-full border rounded p-2"
              value={profile.website_url || ''}
              onChange={(e) =>
                setProfile({ ...profile, website_url: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Bio</label>
            <textarea
              className="mt-1 block w-full border rounded p-2"
              rows={4}
              value={profile.bio || ''}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            />
          </div>
        </div>

        {/* Save button */}
        <Button
          type="submit"
          disabled={saving}
          className="w-full max-w-md py-3 bg-[var(--color-brand-pink)] text-white font-semibold rounded hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </form>

      <Footer />
    </div>
  );
}
