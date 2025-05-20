import { mockUsers } from "../mockData"; 

function SignIn() {
  console.log("SignIn loaded"); 
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  // simulated ersetzt durch Supabase
  const handleSubmit = () => {
    const user = mockUsers.find((u) => u.username === username);
    if (user) {
      console.log("login success, user(simulated):", user); 
    } else {
      console.log("login failed, user not found"); 
    }
    //- Supabase signin code
  };

  return (
    <div>
      <h1>SiGN IN</h1>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
      />
      <button onClick={handleSubmit}>SING IN</button> {/* Sign in btn */}
    </div>
  );
}

export default SignIn;