import FeedCard from "./FeedCard";

function FeedList() {
  return (
    <div
      style={{
        msOverflowStyle: "none",
        scrollbarWidth: "none",
      }}
      className="flex flex-col pt-22 pb-22 gap-6 w-full h-screen overflow-scroll scroll-smooth"
    >
      <FeedCard />
      <FeedCard />
      <FeedCard />
      <FeedCard />
      <FeedCard />
      <FeedCard />
      <FeedCard />
      <FeedCard />
      <FeedCard />
      <FeedCard />
    </div>
  );
}

export default FeedList;
