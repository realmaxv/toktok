import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { mockPosts, mockUsers } from "../mockData"; 

function HomeFeed() {
  console.log("HomeFeed loaded");
  // simulated ersetzt durch Supabase
  const posts = mockPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  console.log("dynamic posts:", posts); 

  return (
    <main className="">
      <Header /> 
    
      <h1>newst posts</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            {post.content} (user: {mockUsers.find((u) => u.id === post.userId)?.username}, likes: {post.likes}, comments: {post.comments})
          </li>
        ))}
      </ul>
      <Footer /> 
    </main>
  );
}

export default HomeFeed;