import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import logo from '@/assets/logo.svg';
import { Search as SearchIcon } from 'lucide-react';

type SearchMode = "user" | "post";

interface UserResult {
  user_id: string;
  handle: string;
  first_name: string | null;
  last_name: string | null;
}

interface PostResult {
  id: string;
  caption: string | null;
  user_id: string;
  handle: string;
}

export default function Search({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("user");
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [postResults, setPostResults] = useState<PostResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (searchMode === "user") {
        const { data, error } = await supabase
          .from("public_profiles")
          .select(`
            user_id,
            handle,
            profiles (first_name, last_name)
          `)
          .or(
            `handle.ilike.%${searchQuery}%,first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`,
            { referencedTable: "profiles" }
          );

        if (error) throw error;
        setUserResults(
          (data as any[])?.map((item) => ({
            user_id: item.user_id,
            handle: item.handle,
            first_name: item.profiles?.first_name,
            last_name: item.profiles?.last_name,
          })) || []
        );
        setPostResults([]);
      } else {
        const { data, error } = await supabase
          .from("posts")
          .select(`
            id,
            caption,
            user_id,
            public_profiles (handle)
          `)
          .ilike("caption", `%${searchQuery}%`);

        if (error) throw error;
        setPostResults(
          (data as any[])?.map((item) => ({
            id: item.id,
            caption: item.caption,
            user_id: item.user_id,
            handle: item.public_profiles?.handle,
          })) || []
        );
        setUserResults([]);
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred during search");
      console.log("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("min-h-screen flex items-center justify-center p-4 bg-stone-200 dark:bg-stone-950", className)} {...props}>
      <Card className="w-full max-w-md flex flex-col border-none shadow-none bg-stone-200 dark:bg-stone-950">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-3xl p-4">Search</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/home")}
            aria-label="Back to home"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </CardHeader>
        {/* <div className="flex items-center justify-center p-4">
          <img src={logo} alt="TokTok Logo" className="w-[25px] h-[25px]" />
        </div> */}
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <SearchIcon className="w-4 h-4 text-muted-foreground" />
                </span>
                <Input
                  id="search"
                  type="text"
                  placeholder={searchMode === "user" ? "Search by username or name" : "Search by post content"}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-13"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant={searchMode === "user" ? "default" : "outline"}
                onClick={() => setSearchMode("user")}
              >
                Username/Name
              </Button>
              <Button
                type="button"
                variant={searchMode === "post" ? "default" : "outline"}
                onClick={() => setSearchMode("post")}
              >
                Post
              </Button>
            </div>

            <Button
              type="submit"
              className="text-lg mt-2 h-13 w-full bg-[var(--color-button-pink)] text-white hover:bg-[var(--color-brand-pink)]"
              disabled={isLoading || !searchQuery}
            >
              {isLoading ? "Searching..." : "Search"}
            </Button>

            {error && <p className="text-sm text-red-500">{error}</p>}

            {searchMode === "user" && userResults.length > 0 && (
              <ul className="mt-4 space-y-2">
                {userResults.map((user) => (
                  <li key={user.user_id} className="text-sm">
                    {user.first_name || user.last_name
                      ? `${user.first_name || ""} ${user.last_name || ""} (@${user.handle})`
                      : `@${user.handle}`}
                  </li>
                ))}
              </ul>
            )}

            {searchMode === "post" && postResults.length > 0 && (
              <ul className="mt-4 space-y-2">
                {postResults.map((post) => (
                  <li key={post.id} className="text-sm">
                    {post.caption} (by @{post.handle})
                  </li>
                ))}
              </ul>
            )}

            {searchMode === "user" && userResults.length === 0 && !isLoading && searchQuery && (
              <p className="text-sm text-muted-foreground">No users found.</p>
            )}
            {searchMode === "post" && postResults.length === 0 && !isLoading && searchQuery && (
              <p className="text-sm text-muted-foreground">No posts found.</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}