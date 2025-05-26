import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon } from "lucide-react";

type SearchMode = "user" | "post";

type UserResult = {
  user_id: string;
  handle: string;
  avatar_url: string | null;
  first_name: string | null;
  last_name: string | null;
};

type PostResult = {
  id: string;
  caption: string | null;
  content_url: string;
  user_id: string;
  handle: string;
};

export default function Search({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("user");
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [postResults, setPostResults] = useState<PostResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching current user:", error);
      } else {
        setCurrentUserId(user?.id ?? null);
      }
    };
    fetchCurrentUser();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (searchMode === "user") {
        const { data, error } = await supabase
          .from("profiles")
          .select(
            `
            id,
            avatar_url,
            first_name,
            last_name,
            nick_name
          `
          )
          .or(
            `nick_name.ilike.%${searchQuery}%,first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`
          );

        if (error) throw error;
        setUserResults(
          (data?.map((item) => ({
            user_id: item.id,
            handle: item.nick_name || "",
            avatar_url: item.avatar_url,
            first_name: item.first_name ?? null,
            last_name: item.last_name ?? null,
          })) as UserResult[]) || []
        );
        setPostResults([]);
      } else {
        const { data, error } = await supabase
          .from("posts")
          .select(
            `
            id,
            caption,
            user_id,
            content_url,
            profiles (
              first_name,
              last_name,
              nick_name
            )
          `
          )
          .ilike("caption", `%${searchQuery}%`);

        if (error) throw error;
        setPostResults(
          (data?.map((item) => ({
            id: item.id,
            caption: item.caption,
            user_id: item.user_id,
            content_url: item.content_url,
            handle: item.profiles?.nick_name || "",
          })) as PostResult[]) || []
        );
        setUserResults([]);
      }
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred during search"
      );
      console.log("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserClick = (user_id: string) => {
    if (user_id === currentUserId) {
      console.log("Navigating to own profile:", user_id);
      navigate("/profile/me");
    } else {
      console.log("Navigating to profile of", user_id);
      navigate(`/profiles/${user_id}`);
    }
  };

  const handlePostClick = (postId: string) => {
    console.log("Navigating to post", postId);
    navigate(`/comments/${postId}`);
  };

  const imagePlaceholder = (
    <div className="w-16 h-16 bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 rounded-md">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7l9 6 9-6"
        />
      </svg>
    </div>
  );

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center p-4 bg-stone-200 dark:bg-stone-950",
        className
      )}
      {...props}
    >
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
                  placeholder={
                    searchMode === "user"
                      ? "Search by username or name"
                      : "Search by post content"
                  }
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
              <ul className="mt-4 space-y-4">
                {userResults.map((user) => (
                  <li
                    key={user.user_id}
                    className="flex items-center gap-4 cursor-pointer hover:bg-stone-300 dark:hover:bg-stone-800 p-2 rounded-md"
                    onClick={() => handleUserClick(user.user_id)}
                  >
                    <img
                      src={
                        user.avatar_url && !user.avatar_url.startsWith("http")
                          ? supabase.storage
                              .from("useruploads")
                              .getPublicUrl(user.avatar_url).data.publicUrl
                          : user.avatar_url || "/avatar-placeholder.png"
                      }
                      alt={`${user.handle} avatar`}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/avatar-placeholder.png";
                      }}
                    />
                    <div>
                      <p className="font-semibold">
                        {user.first_name || user.last_name
                          ? `${user.first_name || ""} ${
                              user.last_name || ""
                            }`.trim()
                          : user.handle}
                      </p>
                      {user.first_name || user.last_name ? (
                        <p className="text-sm text-muted-foreground">
                          @{user.handle}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {searchMode === "post" && postResults.length > 0 && (
              <ul className="mt-4 space-y-4">
                {postResults.map((post) => (
                  <li
                    key={post.id}
                    className="flex items-center gap-4 cursor-pointer hover:bg-stone-300 dark:hover:bg-stone-800 p-2 rounded-md"
                    onClick={() => handlePostClick(post.id)}
                  >
                    {post.content_url ? (
                      <img
                        src={post.content_url}
                        alt="Post preview"
                        className="w-16 h-16 rounded-md object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/image-placeholder.png";
                        }}
                      />
                    ) : (
                      imagePlaceholder
                    )}
                    <div>
                      <p className="font-semibold">
                        {post.caption || "(No caption)"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        by @{post.handle}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {searchMode === "user" &&
              userResults.length === 0 &&
              !isLoading &&
              searchQuery && (
                <p className="text-sm text-muted-foreground">No users found.</p>
              )}
            {searchMode === "post" &&
              postResults.length === 0 &&
              !isLoading &&
              searchQuery && (
                <p className="text-sm text-muted-foreground">No posts found.</p>
              )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
