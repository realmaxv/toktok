import Footer from "@/components/Footer";
import Header from "@/components/Header";
import FeedList from "@/components/FeedList";

function HomeFeed() {
  return (
    <main className="overflow-x-hidden">
      <Header />
      <FeedList />
      <Footer />
    </main>
  );
}

export default HomeFeed;
