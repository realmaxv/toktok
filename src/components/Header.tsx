import { useState, useEffect } from "react";
import logo from "@/assets/logo.svg";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";

function Header() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadAvatar() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      setUserId(user.id);
      const { data: profileData, error: fetchError } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .single();
      if (fetchError) {
        console.error("Error fetching avatar:", fetchError.message);
        setAvatarUrl("/default-avatar.png");
        return;
      } else {
        let publicUrl = "/default-avatar.png";
        if (profileData?.avatar_url?.startsWith("http")) {
          publicUrl = profileData.avatar_url;
        } else if (profileData?.avatar_url) {
          const { data: urlData } = supabase.storage
            .from("useruploads")
            .getPublicUrl(profileData.avatar_url);
          publicUrl = urlData?.publicUrl ?? publicUrl;
        }
        setAvatarUrl(publicUrl);
      }
    }
    loadAvatar();
  }, [navigate]);

  return (
    <header className="flex items-center justify-between p-4 fixed top-0 left-0 right-0 z-50 shadow-md bg-white/70 dark:bg-black/70 backdrop-blur-lg rounded-b-lg border-b">
      <div className="flex items-center gap-3">
        <img src={logo} alt="toktok-logo" className="h-8 w-auto" />
        <h2 className="font-bold text-xl">TokTok</h2>
      </div>

      <NavLink to={userId ? `/profile/${userId}` : "/login"}>
        <img
          src={avatarUrl || "/default-avatar.png"}
          alt="Avatar"
          className="w-8 h-8 rounded-full object-cover border-2"
        />
      </NavLink>
    </header>
  );
}

export default Header;
