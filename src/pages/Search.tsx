import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Search TokTok</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/home")}
            aria-label="Back to home"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  type="text"
                  placeholder={searchMode === "user" ? "Search by username or name" : "Search by post content"}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
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

              <Button type="submit" className="w-full" disabled={isLoading || !searchQuery}>
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
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}