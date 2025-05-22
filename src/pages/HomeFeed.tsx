import Footer from "@/components/Footer";
import Header from "@/components/Header";
import FeedList from "@/components/FeedList";
import { ProtectedRoute } from "@/layouts/ProtectedRoute";

export function HomeFeed() {
  return (
    <main className="overflow-x-hidden">
      <Header />
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
