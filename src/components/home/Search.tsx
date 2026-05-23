import { useFollow } from "@/hooks/useFollow";
import { useSearchUser } from "@/hooks/useSearchUser";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export function SearchUser() {
  const { query, setQuery, users, loading } = useSearchUser();
  const currentUserId = useSelector((state: any) => state.auth.user?.id);
  const Navigate = useNavigate();

  // ✅ Hook selalu dipanggil sebelum early return
  const { handleFollow, isFollowing, isInProgress, isFollowBack } = useFollow(
    currentUserId,
    currentUserId,
  );

  if (!currentUserId) {
    return <p className="text-gray-400 p-4 text-center">Loading user...</p>;
  }

  return (
    <main className="flex-1 border-x border-[#2f3336] min-h-screen">
      <div className="p-4 border-b border-gray-800">
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-gray-900 text-gray-300 px-4 py-2 rounded-full outline-none"
        />
      </div>

      {loading && <p className="text-gray-400 p-4 text-center">Loading...</p>}

      <div className="flex flex-col">
        {users.length === 0 && !loading ? (
          <p className="text-gray-500 p-4 text-center">User tidak ditemukan</p>
        ) : (
          users.map((user: any) => {
            const followed = isFollowing(user.id);
            const inProgress = isInProgress(user.id);
            const followBack = isFollowBack(user.id); // ✅
            const isSelf = user.id === currentUserId;

            return (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border-b border-gray-800 hover:bg-gray-900 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-500" />
                  <div className="flex flex-col">
                    <span
                      onClick={() => Navigate(`/profile/${user.id}`)}
                      className="text-white font-semibold cursor-pointer"
                    >
                      {user.full_name}
                    </span>
                    <span className="text-gray-500 text-sm">
                      @{user.username}
                    </span>
                    {user.bio && (
                      <span className="text-gray-400 text-sm">{user.bio}</span>
                    )}
                  </div>
                </div>

                {!isSelf && (
                  <button
                    onClick={() => handleFollow(user.id, user)} // ✅ pass user object
                    disabled={inProgress}
                    className={`px-4 py-1 rounded-full text-sm font-semibold transition
                      ${
                        followed
                          ? "bg-gray-700 text-gray-300"
                          : followBack
                            ? "bg-blue-600 text-white" // ✅ warna beda untuk Follow Back
                            : "bg-white text-black"
                      }
                      ${inProgress ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                  >
                    {inProgress
                      ? followed
                        ? "Unfollowing..."
                        : "Following..."
                      : followed
                        ? "Following"
                        : followBack
                          ? "Follow Back" // ✅
                          : "Follow"}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
