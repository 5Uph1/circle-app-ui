import { timeAgo } from "@/pages/Home";
import { Heart, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface ThreadProps {
  id: number;
  content: string;
  image?: string;
  created_at?: string;
  user: {
    id: number;
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
  const navigate = useNavigate();
  const [lightbox, setLightbox] = useState(false);
  return (
    <div className="p-4 border-b border-gray-800 flex gap-3 hover:bg-[#222] transition">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden bg-[#3a3a3a] flex items-center justify-center">
        {user?.profile_picture ? (
          <img
            src={user.profile_picture}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <span className="text-white text-sm font-bold">
            {user.name?.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1 w-full">
        <div className="flex items-center gap-2">
          <span
            onClick={() => navigate(`/profile/${user.id}`)}
            className="font-bold text-sm cursor-pointer cursor-pointer"
          >
            {user.name}
          </span>
          <span className="text-gray-500 text-xs">
            @{user.username} • {created_at ? timeAgo(created_at) : "-"}
          </span>
        </div>
        <p className="text-sm text-gray-200 leading-relaxed">{content}</p>
        {image && (
          <>
            <img
              src={image}
              onClick={() => setLightbox(true)}
              className="mt-3 rounded-xl border border-gray-700 w-full object-contain max-h-80 cursor-zoom-in bg-black/20"
            />

            {/* Lightbox */}
            {lightbox && (
              <div
                onClick={() => setLightbox(false)}
                className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center cursor-zoom-out"
              >
                <img
                  src={image}
                  className="max-h-screen max-w-screen object-contain p-4"
                />
              </div>
            )}
          </>
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
