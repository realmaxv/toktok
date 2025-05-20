import { ModeToggle } from '@/components/DarkMode/mode-toggle';
import { mockUsers, mockPosts } from '../mockData';

function Profile() {
  console.log('Profile loaded');
  const currentUser = mockUsers.find((user) => user.username === 'john_doe'); // simulate current user

  // simulate user posts ersetzt durch Supabase
  const userPosts = mockPosts.filter(
    (post) => post.userId === (currentUser?.id || 1)
  );
  console.log('currentUser:', currentUser, 'userPosts:', userPosts);

  const handleEditClick = () => {
    console.log('click edit, navigate to /edit');
    // - navigate to /edit
  };

  return (
    <>
      
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1>User Profile</h1>
        {currentUser && (
          <div>
            <p>Username: {currentUser.username}</p>
            <p>Name: {currentUser.name}</p>
            <p>Role: {currentUser.role}</p>
            <p>Bio: {currentUser.bio}</p>
            <p>
              Website: <a href={currentUser.website}>{currentUser.website}</a>
            </p>
          </div>
        )}
        <h2>My Posts</h2>
        <ul>
          {userPosts.map((post) => (
            <li key={post.id}>
              {post.content} (Likes: {post.likes}, Comments: {post.comments})
            </li>
          ))}
        </ul>
        <button onClick={handleEditClick}>Edit</button> {/* Edit btn */}
        <div className="flex items-center justify-center">
          <ModeToggle />
        </div>
      </div>
    </>
  );
}

export default Profile;