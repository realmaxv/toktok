import bild from "@/assets/image_demo.jpg";
import { Heart, MessageCircleMore } from "lucide-react";
import { Link } from "react-router";

type FeedCardProps = {
  id: string;
  name: string;
  jobTitle: string;
  imagePath: string;
  likes: string;
  comments: string;

  owner: {
    id: string;
    userName: string | null;
  };
};

function FeedCard({
  name,
  jobTitle,
  imagePath,
  likes,
  comments,
}: FeedCardProps) {
  return (
    <main className="flex flex-col items-center w-full h-full px-6 ">
      <div className="flex flex-col items-center gap-4 px-2">
        <header className=" flex items-start w-full gap-4 ">
          <div
            style={{
              backgroundImage: `url(${bild})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            className="size-12 rounded-full"
          ></div>
          <div className="flex flex-col items-start">
            <p className="font-medium">anny_wilson</p>
            <p className="font-extralight">Webdeveloper</p>
          </div>
        </header>
        <div
          style={{
            backgroundImage: `url(${bild})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          className="size-90 rounded-4xl shadow shadow-accent"
        ></div>
        <div className="flex items-center justify-start w-full gap-4 ">
          <div className="flex items-center gap-2">
            <Heart className="w-7 h-7" />
            <p className="font-semibold">44.389</p>
          </div>
          <Link to={"/comments"} className="flex items-center gap-2">
            <MessageCircleMore className="w-7 h-7" />
            <p className="font-semibold">26.352</p>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default FeedCard;
