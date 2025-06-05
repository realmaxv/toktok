import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuthContext } from "@/contexts/auth-context";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Notification = {
  id: string;
  type: string;
  post_id: string | null;
  created_at: string | null;
  from_user_id: string;
  from_user: {
    nick_name: string | null;
    avatar_url: string | null;
  } | null;
};

export default function Notifications() {
  const { session } = useAuthContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!session?.user?.id) {
      navigate("/login");
      return;
    }

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select(
          `
          id,
          type,
          post_id,
          created_at,
          from_user_id,
          from_user:profiles!fk_notifications_from_user (
            nick_name,
            avatar_url
          )
        `
        )
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setError("Fehler beim Laden der Benachrichtigungen.");
        console.error(error);
      } else {
        setNotifications(data || []);
      }
    };

    fetchNotifications();
  }, [session?.user?.id, navigate]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = supabase
      .channel("realtime:notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${session.user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  const timeSince = (dateString: string) => {
    const then = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days >= 1) return `${days}d`;
    if (hours >= 1) return `${hours}h`;
    if (minutes >= 1) return `${minutes}m`;
    return `${seconds}s`;
  };

  const resolveAvatarUrl = (avatarPath: string | null) => {
    if (!avatarPath) return "/placeholder-avatar.png";
    if (avatarPath.startsWith("http")) return avatarPath;
    return (
      supabase.storage.from("useruploads").getPublicUrl(avatarPath).data
        .publicUrl || "/placeholder-avatar.png"
    );
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <Header key={"Notifications"} />
      <div className="mb-14"></div>
      {error && <p className="text-red-500">{error}</p>}
      {notifications.length === 0 ? (
        <p className="text-muted-foreground">Keine Benachrichtigungen.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((n) => (
            <li key={n.id}>
              {n.post_id ? (
                <Link
                  to={`/comments/${n.post_id}`}
                  className="flex items-start gap-3 hover:bg-accent p-2 rounded"
                >
                  <img
                    src={resolveAvatarUrl(n.from_user?.avatar_url || null)}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm">
                      <strong>@{n.from_user?.nick_name || "jemand"}</strong>{" "}
                      {n.type === "comment" &&
                        "hat deinen Beitrag kommentiert."}
                      {n.type === "like" && (
                        <>
                          hat deinen Beitrag{" "}
                          <span className="text-red-500">❤️</span> geliked.
                        </>
                      )}
                      {n.type !== "comment" &&
                        n.type !== "like" &&
                        "hat mit deinem Beitrag interagiert."}
                    </p>
                    {n.created_at && (
                      <div className="text-xs text-muted-foreground">
                        {timeSince(n.created_at)} ago
                      </div>
                    )}
                  </div>
                </Link>
              ) : (
                <div className="flex items-start gap-3 p-2 rounded bg-muted/40">
                  <img
                    src={resolveAvatarUrl(n.from_user?.avatar_url || null)}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Ungültige Benachrichtigung
                    </span>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <Footer />
    </div>
  );
}
