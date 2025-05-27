import Footer from "@/components/Footer";
import Header from "@/components/Header";
import FeedList from "@/components/FeedList";
import { ProtectedRoute } from "@/layouts/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function HomeFeed() {
  const navigate = useNavigate();

  const handleShuffleClick = () => {
    const confirmed = window.confirm("Switch to Shuffle mode?");
    if (confirmed) {
      navigate("/shuffle");
    }
  };

  return (
    <main className="overflow-x-hidden">
      <Header />
      <Button
        onClick={handleShuffleClick}
        className="bg-[var(--color-button-pink)] text-white hover:bg-[var(--color-brand-pink)] ml-2"
      >
        Shuffle
      </Button>

      <FeedList />
      <Footer />
    </main>
  );
}

export default function ProtectedHomeFeed() {
  return (
    <ProtectedRoute>
      <HomeFeed />
    </ProtectedRoute>
  );
}
