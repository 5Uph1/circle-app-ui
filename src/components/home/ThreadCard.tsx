import { timeAgo } from "@/pages/Home";
import { Heart, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface ThreadProps {
  id: number;
  content: string;
  image?: string;
  created_at: string;
  user: {
    name: string;
    username: string;
    profile_picture: string;
  };
  likes: number;
  replies: number;
  isLiked: boolean;
  onLike: (id: number) => void;
}

export function ThreadCard({
  id,
  content,
  image,
  created_at,
  user,
  isLiked,
  likes,
  replies,
  onLike,
}: ThreadProps) {
  return (
    <div className="p-4 border-b border-gray-800 flex gap-3 hover:bg-[#222] transition cursor-pointer">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-blue-500 flex-shrink-0"></div>
      <div className="flex flex-col gap-1 w-full">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">{user.name}</span>
          <span className="text-gray-500 text-xs">
            @{user.username} • {timeAgo(created_at)}
          </span>
        </div>
        <p className="text-sm text-gray-200 leading-relaxed">{content}</p>
        {image && (
          <img
            src={`http://localhost:3000/uploads/${image}`}
            className="mt-3 rounded-xl border border-gray-700 w-full object-cover max-h-80"
          />
        )}
        <div className="flex gap-6 mt-3 text-gray-500 text-sm">
          <button
            onClick={(e) => {
              e.preventDefault();
              onLike(id);
            }}
            className="flex items-center gap-2 cursor-pointer hover:text-red-500"
          >
            <Heart
              size={18}
              fill={isLiked ? "currentColor" : "none"}
              className={isLiked ? "text-red-500" : ""}
            />{" "}
            {likes}
          </button>
          <Link to={`/replies/${id}`} className="flex">
            <span className="flex items-center gap-2 hover:text-blue-500">
              <MessageCircle size={18} /> {replies} Replies
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
