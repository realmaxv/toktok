import { mockPosts } from "../mockData";

function Comments() {
  console.log("Comments loaded"); 
  const [postId, setPostId] = React.useState(1); // simulated ID

  // simulated ersetzt durch Supabase
  const post = mockPosts.find((p) => p.id === postId);
  console.log("post:", post); 

  const handleComment = () => {
    console.log("summit comment -Supabase"); 
    //- Supabase comment code
  };

  return (
    <div>
  
      <h1>COMMENTS</h1>
      {post && <p>Post: {post.content} (Comments {post.comments})</p>}
      <button onClick={handleComment}>Write a Comment</button> {/* comment btn */}
    </div>
  );
}

export default Comments;