import { X } from "lucide-react";
import { useFollow } from "@/hooks/useFollow";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_URL } from "@/config/api";

interface Props {
  type: "followers" | "following";
  profileUserId: number;
  onClose: () => void;
}

export function FollowModal({ type, profileUserId, onClose }: Props) {
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.auth.token);
  const currentUserId = useSelector(
    (state: RootState) => state.auth.user?.id ?? 0,
  );

  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // fetch followers/following milik profileUserId langsung
  useEffect(() => {
    const fetchList = async () => {
      setLoading(true);
      try {
        const endpoint =
          type === "followers"
            ? `${API_URL}/follow/followers/${profileUserId}`
            : `${API_URL}/follow/following/${profileUserId}`;

        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setList(data.data ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, [type, profileUserId, token]);

  // hook ini khusus untuk cek follow status current user
  const { isFollowing, isInProgress, isFollowBack, handleFollow } = useFollow(
    currentUserId,
    currentUserId, // ← pakai currentUserId agar isFollowBack akurat
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-[#262626] rounded-xl w-full max-w-sm mx-4 max-h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h2 className="font-bold capitalize">{type}</h2>
          <button onClick={onClose} className="cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto">
          {loading ? (
            <p className="text-gray-500 text-sm text-center py-8">Loading...</p>
          ) : list.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">
              No {type} yet.
            </p>
          ) : (
            list.map((user) => {
              const followed = isFollowing(user.id);
              const inProgress = isInProgress(user.id);
              const followBack = isFollowBack(user.id);
              const isSelf = user.id === currentUserId;

              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-white/5 border-b border-gray-800"
                >
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => {
                      navigate(`/profile/${user.id}`);
                      onClose();
                    }}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#3a3a3a] overflow-hidden flex items-center justify-center">
                      {user.photo_profile ? (
                        <img
                          src={user.photo_profile}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-sm font-bold">
                          {user.full_name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{user.full_name}</p>
                      <p className="text-xs text-gray-500">@{user.username}</p>
                    </div>
                  </div>

                  {!isSelf && (
                    <button
                      onClick={() => handleFollow(user.id, user)}
                      disabled={inProgress}
                      className={`text-xs font-semibold rounded-full px-4 py-1.5 transition cursor-pointer disabled:opacity-50
                        ${
                          followed
                            ? "bg-gray-700 text-gray-300"
                            : followBack
                              ? "border border-blue-400 text-blue-400"
                              : "border border-green-400 text-green-400"
                        }`}
                    >
                      {inProgress
                        ? "..."
                        : followed
                          ? "Following"
                          : followBack
                            ? "Follow Back"
                            : "Follow"}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
