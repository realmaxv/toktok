import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, User as UserIcon } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/Spinner';

type SearchMode = 'user' | 'post';

type UserResult = {
  user_id: string;
  handle: string;
  avatar_url: string | null;
  first_name: string | null;
  last_name: string | null;
  isFollowing: boolean;
};

type PostResult = {
  id: string;
  caption: string | null;
  content_url: string;
  handle: string;
};

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('user');
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [postResults, setPostResults] = useState<PostResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Aktuellen User holen
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id ?? null);
    });
  }, []);

  // Debounced Auto-Suche bei >= 2 Zeichen
  useEffect(() => {
    if (searchQuery.length < 2) {
      setUserResults([]);
      setPostResults([]);
      setError(null);
      setIsLoading(false);
      return;
    }
    setError(null);
    setIsLoading(true);
    const timer = setTimeout(() => {
      performSearch();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchMode]);

  // Follow-Status nachladen
  const fetchFollowStatus = async (
    profiles: Omit<UserResult, 'isFollowing'>[]
  ) => {
    if (!currentUserId)
      return profiles.map((p) => ({ ...p, isFollowing: false }));
    const { data: follows } = await supabase
      .from('followers')
      .select('following_id')
      .eq('follower_id', currentUserId)
      .in(
        'following_id',
        profiles.map((p) => p.user_id)
      );
    const followingSet = new Set(follows?.map((f) => f.following_id));
    return profiles.map((p) => ({
      ...p,
      isFollowing: followingSet.has(p.user_id),
    }));
  };

  // Kern-Suchfunktion
  const performSearch = async () => {
    try {
      if (searchMode === 'user') {
        const { data, error } = await supabase
          .from('profiles')
          .select(`id, avatar_url, first_name, last_name, nick_name`)
          .or(
            `nick_name.ilike.%${searchQuery}%,first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`
          );
        if (error) throw error;

        const base = (data ?? []).map((item) => ({
          user_id: item.id,
          handle: item.nick_name || '',
          avatar_url: item.avatar_url,
          first_name: item.first_name,
          last_name: item.last_name,
        }));
        const withFollow = await fetchFollowStatus(base);
        setUserResults(withFollow);
      } else {
        const { data, error } = await supabase
          .from('posts')
          .select(`id, caption, content_url, profiles(nick_name)`)
          .ilike('caption', `%${searchQuery}%`);
        if (error) throw error;

        setPostResults(
          (data ?? []).map((p) => ({
            id: p.id,
            caption: p.caption,
            content_url: p.content_url.startsWith('http')
              ? p.content_url
              : supabase.storage.from('useruploads').getPublicUrl(p.content_url)
                  .data.publicUrl,
            handle: p.profiles?.nick_name || '',
          }))
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Fehler bei der Suche');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Follow/Unfollow
  const handleFollowToggle = async (
    user_id: string,
    currentlyFollowing: boolean
  ) => {
    if (!currentUserId) return;
    if (currentlyFollowing) {
      await supabase
        .from('followers')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', user_id);
    } else {
      await supabase
        .from('followers')
        .insert({ follower_id: currentUserId, following_id: user_id });
    }
    setUserResults((prev) =>
      prev.map((u) =>
        u.user_id === user_id ? { ...u, isFollowing: !currentlyFollowing } : u
      )
    );
  };

  const handleUserClick = (user_id: string) => {
    navigate(user_id === currentUserId ? '/profile/me' : `/profile/${user_id}`);
  };
  const handlePostClick = (postId: string) => navigate(`/comments/${postId}`);

  return (
    <>
      <Header />
      <main className="w-full pt-22 pb-15">
        <div className="w-full max-w-3xl mx-auto px-4">
          {/* Search Input */}
          <div className="relative mb-4">
            <SearchIcon className="absolute inset-y-0 left-3 my-auto w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder={
                searchMode === 'user' ? 'Search users...' : 'Search posts...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-full border border-gray-300"
            />
          </div>

          {/* Tab-Nav */}
          <div className="flex mb-2">
            <button
              onClick={() => setSearchMode('user')}
              className={cn(
                'flex-1 py-3 text-center',
                searchMode === 'user'
                  ? 'border-b-2 border-[#FF4D67] text-[#FF4D67]'
                  : 'text-gray-500'
              )}
            >
              <UserIcon className="inline w-5 h-5 mr-1" /> Users
            </button>
            <button
              onClick={() => setSearchMode('post')}
              className={cn(
                'flex-1 py-3 text-center',
                searchMode === 'post'
                  ? 'border-b-2 border-[#FF4D67] text-[#FF4D67]'
                  : 'text-gray-500'
              )}
            >
              Posts
            </button>
          </div>

          {/* Error */}
          {error && <p className="px-4 text-red-500">{error}</p>}

          {/* Loading Spinner */}
          {isLoading && (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          )}

          {/* Ergebnisse */}
          {!isLoading && searchMode === 'user' && (
            <ul className="space-y-2">
              {userResults.length > 0 ? (
                userResults.map((u) => (
                  <li
                    key={u.user_id}
                    className="flex items-center justify-between rounded-lg p-4 hover:shadow"
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => handleUserClick(u.user_id)}
                    >
                      <img
                        src={
                          u.avatar_url && !u.avatar_url.startsWith('http')
                            ? supabase.storage
                                .from('useruploads')
                                .getPublicUrl(u.avatar_url).data.publicUrl
                            : u.avatar_url || '/avatar-placeholder.png'
                        }
                        alt=""
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) =>
                          (e.currentTarget.src = '/avatar-placeholder.png')
                        }
                      />
                      <div>
                        <p className="font-medium">
                          {u.first_name || u.last_name
                            ? `${u.first_name || ''} ${
                                u.last_name || ''
                              }`.trim()
                            : u.handle}
                        </p>
                        <p className="text-sm text-gray-500">@{u.handle}</p>
                      </div>
                    </div>
                    {currentUserId !== u.user_id && (
                      <Button
                        size="sm"
                        className={cn(
                          'px-4 py-1 rounded',
                          u.isFollowing
                            ? 'bg-[#FF4D67] text-white border border-[#FF4D67]'
                            : 'bg-white text-[#FF4D67] border border-[#FF4D67]'
                        )}
                        onClick={() =>
                          handleFollowToggle(u.user_id, u.isFollowing)
                        }
                      >
                        {u.isFollowing ? 'Unfollow' : 'Follow'}
                      </Button>
                    )}
                  </li>
                ))
              ) : (
                <p className="px-4 text-gray-500">No users found.</p>
              )}
            </ul>
          )}

          {!isLoading && searchMode === 'post' && (
            <ul className="space-y-2 px-4">
              {postResults.length > 0 ? (
                postResults.map((p) => (
                  <li
                    key={p.id}
                    onClick={() => handlePostClick(p.id)}
                    className="flex items-center gap-3 rounded-lg p-4 hover:shadow cursor-pointer"
                  >
                    <img
                      src={p.content_url}
                      alt=""
                      className="w-16 h-16 rounded-md object-cover"
                      onError={(e) =>
                        (e.currentTarget.src = '/image-placeholder.png')
                      }
                    />
                    <div>
                      <p className="font-medium">
                        {p.caption || '(No caption)'}
                      </p>
                      <p className="text-sm text-gray-500">@{p.handle}</p>
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-gray-500">No posts found.</p>
              )}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
