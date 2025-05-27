import { useState, useEffect } from 'react';
import logo from '@/assets/logo.svg';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { UserRoundPen, Settings } from 'lucide-react';
import { BackButton } from './BackButton';

function Header() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isRoot = location.pathname === '/';
  // Prüft, ob wir uns auf der Profil-Detailseite befinden, z.B. "/profile/123"
  const isProfilePage = userId !== null && location.pathname === `/profile`;

  useEffect(() => {
    async function loadAvatar() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUserId(user.id);

      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching avatar:', fetchError.message);
        setAvatarUrl('/default-avatar.png');
        return;
      }

      let publicUrl = '/default-avatar.png';
      if (profileData?.avatar_url?.startsWith('http')) {
        publicUrl = profileData.avatar_url;
      } else if (profileData?.avatar_url) {
        const { data: urlData } = supabase.storage
          .from('useruploads')
          .getPublicUrl(profileData.avatar_url);
        publicUrl = urlData?.publicUrl ?? publicUrl;
      }
      setAvatarUrl(publicUrl);
    }

    loadAvatar();
  }, [navigate]);

  const pageTitle = isRoot
    ? 'TokTok'
    : (() => {
        const seg = location.pathname.split('/')[1] || '';
        return seg.charAt(0).toUpperCase() + seg.slice(1);
      })();

  return (
    <header className="flex items-center justify-between p-4 fixed top-0 left-0 right-0 z-50 shadow-md bg-white/70 dark:bg-black/70 backdrop-blur-lg border-b">
      <div className="flex items-center gap-3">
        {isRoot ? (
          <img src={logo} alt="toktok-logo" className="w-6 h-6 " />
        ) : (
          <BackButton />
        )}
        <h2 className="font-bold text-xl">{pageTitle}</h2>
      </div>

      {/* Rechts: Avatar oder Edit/Settings-Icons auf Profilseite */}
      {isProfilePage ? (
        <div className="flex items-center justify-center">
          <NavLink to="/profile-edit">
            <UserRoundPen className="w-8 h-8" />
          </NavLink>
          <NavLink to="/settings">
            <Settings className="w-8 h-8 ml-4" />
          </NavLink>
        </div>
      ) : (
        <NavLink to={userId ? `/profile/${userId}` : '/login'}>
          <img
            src={avatarUrl || '/avatar_placeholder.png'}
            alt="Avatar"
            className="w-8 h-8 rounded-full object-cover"
          />
        </NavLink>
      )}
    </header>
  );
}

export default Header;
