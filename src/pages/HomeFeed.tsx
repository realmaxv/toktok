import { mockPosts, mockUsers } from "../mockData"; 

function HomeFeed() {
  console.log("HomeFeed loaded");
  // simulated ersetzt durch Supabase
  const posts = mockPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  console.log("dynamic posts:", posts); 

  return (
    <div className="">
      <h1>newst posts</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            {post.content} (user: {mockUsers.find((u) => u.id === post.userId)?.username}, likes: {post.likes}, comments: {post.comments})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HomeFeed;