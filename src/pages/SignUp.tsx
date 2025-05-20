import { mockUsers } from "../mockData"; 

function SignUp() {
  console.log("SignUp loaded"); 
  //- Supabase auth logic
  const handleSubmit = () => {
    console.log("submit - Supabase"); 
    //- Supabase auth
  };

  return (
    <div>
      <h1>SIGN UP</h1>
      <ul>
        {mockUsers.map((user) => (
          <li key={user.id}>{user.name} ({user.username})</li> // simulate user data
        ))}
      </ul>
      <button onClick={handleSubmit}>Sign Up</button> {/* Sign up btn */}
    </div>
  );
}

export default SignUp;