import { supabase } from '@/lib/supabase/client';
import { useNavigate } from 'react-router-dom';

export default function Logout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    // Optional: clear your app's local storage
    localStorage.removeItem('user');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    } else {
      navigate('/login');
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-600 text-white text-lg px-3 py-1 rounded-4xl"
    >
      Logout
    </button>
  );
}
