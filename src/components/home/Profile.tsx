import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { ThreadCard } from "./ThreadCard";
import { DialogDemo } from "../part/dialogProfile";
import { useUpdateManager } from "@/hooks/useAuth";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { API_URL } from "@/config/api";
import { useFollow } from "@/hooks/useFollow";

export function ProfileContent() {
  const { profileUser, threads, loading, isOwnProfile, handleLike } =
    useProfile();
  const { handleUpdate } = useUpdateManager();

  // 🔥 ambil user login dari redux
  const { user } = useSelector((state: RootState) => state.auth);

  // 🔥 tentukan user yang ditampilkan
  const displayUser = isOwnProfile ? user : profileUser;

  console.log("========================================== masuk");
  console.log(displayUser);
  // if(!displayUser)
  // {
  //     throw new Error ("Terjadi error")
  // }

  // 🔥 state tab
  const [activeTab, setActiveTab] = useState<"all" | "media">("all");

  // 🔥 filter thread
  const filteredThreads =
    activeTab === "media" ? threads.filter((t) => t.image) : threads;

  // 🔥 FOLLOW LOGIC
  const currentUserId = user?.id ?? 0;

  const { isFollowing, isInProgress, isFollowBack, handleFollow } = useFollow(
    currentUserId,
    displayUser?.id ?? 0,
  );

  const followed = displayUser ? isFollowing(displayUser.id) : false;
  const inProgress = displayUser ? isInProgress(displayUser.id) : false;
  const followBack = displayUser ? isFollowBack(displayUser.id) : false;

  if (loading) return <p className="text-gray-400 p-4">Loading...</p>;
  if (!displayUser)
    return <p className="text-gray-400 p-4">User tidak ditemukan</p>;

  return (
    <main className="flex-1 border-x border-[#2f3336] min-h-screen">
      {/* HEADER */}
      <div className="p-4 border-b border-gray-800 flex items-center gap-3">
        <h1 className="text-xl font-bold">Profile</h1>
      </div>

      {/* BANNER */}
      <div className="h-32 bg-gradient-to-r from-green-300 to-yellow-300 relative">
        <div className="absolute -bottom-12 left-4">
          <div className="w-20 h-20 rounded-full border-4 border-black bg-yellow-500" />
        </div>
      </div>

      {/* INFO USER */}
      <div className="pt-14 px-4 border-b border-gray-800 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold">
              {isOwnProfile ? user?.fullname : (profileUser as any)?.full_name}
            </h2>
            <p className="text-gray-400">
              @{isOwnProfile ? user?.username : profileUser?.username}
            </p>
          </div>

          {/* 🔥 BUTTON */}
          {isOwnProfile ? (
            <DialogDemo
              userId={user?.id ?? null}
              fullname={user?.fullname ?? null}
              username={user?.username ?? null}
              bio={user?.bio ?? null}
              onSubmit={handleUpdate}
            />
          ) : (
            <button
              onClick={() =>
                profileUser &&
                handleFollow(profileUser.id, {
                  id: profileUser.id,
                  username: profileUser.username,
                  full_name: profileUser.full_name,
                  photo_profile: profileUser.photo_profile,
                  bio: profileUser.bio ?? null,
                })
              }
              disabled={inProgress}
              className={`px-4 py-1 rounded-full text-sm font-bold transition cursor-pointer disabled:opacity-50
            ${
              followed
                ? "bg-gray-800 border border-gray-800 text-gray-400"
                : followBack
                  ? "border border-blue-400 text-blue-400"
                  : "bg-white text-black hover:bg-gray-200"
            }
        `}
            >
              {inProgress
                ? "Loading..."
                : followed
                  ? "Following"
                  : followBack
                    ? "Follow Back"
                    : "Follow"}
            </button>
          )}
        </div>

        <p className="mt-2 text-gray-300 text-sm">
          {displayUser.bio || "no bio yet"}
        </p>

        <div className="flex gap-4 mt-2 text-sm text-gray-400">
          <span>
            <b className="text-white">
              {isOwnProfile
                ? user?.following
                : (profileUser?._count?.following ?? 0)}
            </b>{" "}
            Following
          </span>
          <span>
            <b className="text-white">
              {isOwnProfile
                ? user?.follower
                : (profileUser?._count?.follower ?? 0)}
            </b>{" "}
            Followers
          </span>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-gray-800">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex-1 py-3 text-center cursor-pointer ${
            activeTab === "all"
              ? "border-b-2 border-green-500 font-semibold"
              : "text-gray-500 hover:text-white"
          }`}
        >
          All Post
        </button>

        <button
          onClick={() => setActiveTab("media")}
          className={`flex-1 py-3 text-center cursor-pointer ${
            activeTab === "media"
              ? "border-b-2 border-green-500 font-semibold"
              : "text-gray-500 hover:text-white"
          }`}
        >
          Media
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex flex-col">
        {filteredThreads.length === 0 ? (
          <p className="text-gray-500 p-4 text-center">
            {activeTab === "media" ? "Belum ada media" : "Belum ada thread"}
          </p>
        ) : activeTab === "media" ? (
          // 🔥 GRID MEDIA
          <div className="grid grid-cols-3 gap-1 p-1">
            {filteredThreads.map((t) => (
              <img
                key={t.id}
                src={`${API_URL}/uploads/${t.image}`}
                className="w-full h-32 object-cover"
              />
            ))}
          </div>
        ) : (
          // 🔥 THREAD LIST
          filteredThreads.map((thread) => (
            <ThreadCard key={thread.id} {...thread} onLike={handleLike} />
          ))
        )}
      </div>
    </main>
  );
}
