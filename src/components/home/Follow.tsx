import { useState } from "react";
import { useFollow } from "../../hooks/useFollow";
import type { FollowUser } from "../../store/followSlice";
import { useNavigate } from "react-router-dom";

interface FollowsProps {
  currentUserId: number;
  profileUserId: number;
}

export default function Follows({
  currentUserId,
  profileUserId,
}: FollowsProps) {
  const [activeTab, setActiveTab] = useState<"followers" | "following">(
    "followers",
  );
  const Navigate = useNavigate();

  const {
    followers,
    following,
    loadingFollowers,
    loadingFollowing,
    isFollowing,
    isInProgress,
    isFollowBack, // ✅
    handleFollow,
    error,
  } = useFollow(currentUserId, profileUserId);

  const displayedUsers: FollowUser[] =
    activeTab === "followers" ? followers : following;
  const isLoading =
    activeTab === "followers" ? loadingFollowers : loadingFollowing;

  return (
    <main className="flex-1 border-x border-[#2f3336] min-h-screen">
      {/* HEADER */}
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">Follows</h1>

        {/* Tabs */}
        <div className="flex mt-4 border-b border-gray-800">
          {(["followers", "following"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-semibold capitalize relative cursor-pointer ${
                activeTab === tab ? "text-green-400" : "text-gray-500"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-green-400 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mx-4 mt-2 px-4 py-2 rounded-lg bg-red-900/40 border border-red-700 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* CONTENT */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-green-400 border-t-transparent animate-spin" />
        </div>
      ) : displayedUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500 text-sm">
          <p>No {activeTab} yet.</p>
        </div>
      ) : (
        <div className="divide-gray-800 divide-y border-gray-800 border-b">
          {displayedUsers.map((user) => {
            const followed = isFollowing(user.id);
            const inProgress = isInProgress(user.id);
            const followBack = isFollowBack(user.id);
            const isSelf = user.id === currentUserId;

            return (
              <div
                key={user.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition"
              >
                {/* LEFT: USER INFO */}
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={
                      user.photo_profile ||
                      `https://i.pravatar.cc/40?u=${user.id}`
                    }
                    className="w-10 h-10 rounded-full object-cover border border-gray-700"
                  />

                  <div className="min-w-0">
                    <span
                      onClick={() => Navigate(`/profile/${user.id}`)}
                      className="text-white text-sm font-semibold cursor-pointer truncate"
                    >
                      {user.full_name}
                    </span>
                    <p className="text-xs text-gray-500 truncate">
                      @{user.username}
                    </p>
                    {user.bio && (
                      <p className="text-xs text-gray-400 truncate">
                        {user.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* RIGHT: BUTTON (rapi & sejajar) */}
                {!isSelf && (
                  <div className="w-[110px] flex justify-end">
                    <button
                      onClick={() => handleFollow(user.id, user)}
                      disabled={inProgress}
                      className={`text-xs font-semibold rounded-full px-4 py-1.5 transition disabled:opacity-50
                        ${
                          followed
                            ? "bg-gray-800 border border-gray-800 text-gray-400"
                            : followBack
                              ? "border border-blue-400 text-blue-400"
                              : "border border-green-400 text-green-400"
                        }
                      `}
                    >
                      {inProgress ? (
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                          {followed ? "Unfollowing..." : "Following..."}
                        </span>
                      ) : followed ? (
                        "Following"
                      ) : followBack ? (
                        "Follow Back"
                      ) : (
                        "Follow"
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
