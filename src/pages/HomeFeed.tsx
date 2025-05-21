import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase/client";
import FeedList from "@/components/FeedList";

function HomeFeed() {
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault();

    const demo = await supabase.from("profiles").select("*");

    console.log(demo.data);
  };

  return (
    <main className="overflow-x-hidden">
      <Header />
      <FeedList />
      <Footer />
    </main>
  );
}

export default HomeFeed;
