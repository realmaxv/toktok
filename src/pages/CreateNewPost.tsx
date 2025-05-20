import { mockPosts } from "../mockData"; 

function CreateNewPost() {
  console.log("CreateNewPost loaded"); 

  const handleSubmit = () => {
    console.log("submit - Supabase"); 
    //- Supabase upload code
  };

  return (
    <div>
      <h1>NEW POST</h1>
      <button onClick={handleSubmit}>Post</button> {/* POST btn */}
    </div>
  );
}

export default CreateNewPost;