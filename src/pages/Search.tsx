import React from 'react'; 
import { mockUsers, mockPosts } from "../mockData"; 

function Search() {
  console.log("Search loaded"); 
  const [searchQuery, setSearchQuery] = React.useState(""); 

  // simulated ersetzt durch Supabase
  const searchResults = mockUsers.filter((user) =>
    user.username.includes(searchQuery) || user.name.includes(searchQuery)
  );
  console.log("search results:", searchResults); 

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    console.log("searching - Supabase"); 
    //- Supabase search code
  };

  return (
    <div>
      
      <h1>Search</h1>
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearch}
        placeholder="input username or name"
      />
      <ul>
        {searchResults.map((user) => (
          <li key={user.id}>{user.name} ({user.username})</li>
        ))}
      </ul>
    </div>
  );
}

export default Search;