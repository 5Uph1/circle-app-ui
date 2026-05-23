import { ListThread } from "@/components/home/ListThread";
import { Replies } from "@/components/home/Replies";
import { SearchUser } from "@/components/home/Search";
import { ProfileContent } from "@/components/home/Profile";
import Follows from "@/components/home/Follow";
import { useThreadManager } from "@/hooks/useThread";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { House, Search, SquareUser, UserStar } from "lucide-react";
import { Route, Routes, NavLink, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import { getSuggestedUsers } from "@/store/userSlice";
import { API_URL } from "@/config/api";
import { DialogDemo } from "@/components/part/dialogProfile";
import { useUpdateManager } from "@/hooks/useAuth";
import { useFollow } from "@/hooks/useFollow";

export function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  return `${days} hari lalu`;
}

export function Home() {
  const {
    content,
    threads,
    image,
    fileInputRef,
    setContent,
    setImage,
    handleLike,
    handleLogout,
    onSubmit,
  } = useThreadManager();

  const { handleUpdate } = useUpdateManager();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.auth.user);
  const suggested = useSelector(
    (state: RootState) => state.user.suggested.list,
  );
  const token = useSelector((state: RootState) => state.auth.token);

  const { handleFollow, isFollowing, isInProgress } = useFollow(
    user?.id ?? 0,
    user?.id ?? 0,
  );

  useEffect(() => {
    if (token) dispatch(getSuggestedUsers());
  }, [token]);

  const navItems = [
    { to: "/", label: "Home", icon: <House /> },
    { to: "/search", label: "Search", icon: <Search /> },
    { to: `/follows/${user?.id}`, label: "Follows", icon: <UserStar /> },
    { to: `/profile/${user?.id}`, label: "Profile", icon: <SquareUser /> },
  ];

  return (
    <div className="min-h-screen bg-[#1d1d1d] text-white flex justify-center">
      <div className="flex w-full max-w-[1200px]">
        {/* --- SIDEBAR KIRI (desktop only) --- */}
        <aside className="hidden lg:flex w-[20%] p-6 sticky top-0 h-screen flex-col gap-6 border-r border-gray-800">
          <h1 className="text-[#04a51e] text-4xl font-bold mb-4">waduh</h1>
          <nav className="flex flex-col gap-4 text-lg">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 cursor-pointer ${isActive ? "font-bold text-green-400" : "text-gray-300 hover:text-white"}`
                }
              >
                {item.icon} {item.label}
              </NavLink>
            ))}
          </nav>
          <button
            onClick={() => navigate("/")}
            className="bg-[#04a51e] py-2 rounded-full font-bold mt-4"
          >
            Create Post
          </button>
          <button
            className="mt-auto flex items-center gap-3 text-gray-400 cursor-pointer"
            onClick={handleLogout}
          >
            Logout
          </button>
        </aside>

        {/* --- FEED TENGAH --- */}
        <main className="flex-1 min-w-0 pb-20 lg:pb-0">
          <Routes>
            <Route
              path="/"
              element={
                <ListThread
                  onSubmit={onSubmit}
                  content={content}
                  setContent={setContent}
                  image={image}
                  setImage={setImage}
                  fileInputRef={
                    fileInputRef as React.RefObject<HTMLInputElement>
                  }
                  threads={threads.map((t) => ({ ...t, onLike: handleLike }))}
                  handleLike={(id) =>
                    handleLike(typeof id === "string" ? parseInt(id) : id)
                  }
                />
              }
            />
            <Route path="/replies/:id" element={<Replies />} />
            <Route path="/search" element={<SearchUser />} />
            <Route path="/profile/:id" element={<ProfileContent />} />
            <Route
              path="/follows/:id"
              element={
                <Follows
                  currentUserId={user?.id ?? 0}
                  profileUserId={user?.id ?? 0}
                />
              }
            />
          </Routes>
        </main>

        {/* --- WIDGET KANAN (desktop only) --- */}
        <aside className="hidden lg:flex w-[30%] p-4 flex-col gap-4 sticky top-0 h-screen overflow-y-auto">
          {/* Profile Card */}
          <div className="bg-[#262626] rounded-xl p-4">
            <h2 className="font-bold mb-3">My Profile</h2>
            <div className="relative mb-12">
              <div className="h-16 bg-gradient-to-r from-green-200 to-blue-300 rounded-lg" />
              <div className="w-16 h-16 rounded-full border-4 border-[#262626] absolute -bottom-12 left-1 bg-yellow-500" />
              <div className="absolute -bottom-10 right-0">
                <DialogDemo
                  userId={user?.id ?? null}
                  fullname={user?.fullname ?? null}
                  username={user?.username ?? null}
                  bio={user?.bio ?? null}
                  onSubmit={handleUpdate}
                />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg">{user?.fullname}</h3>
              <p className="text-gray-500 text-sm">@{user?.username}</p>
              <p className="text-sm mt-2 text-gray-400">
                {user?.bio || "no bio yet"}
              </p>
              <div className="flex gap-4 mt-2 text-sm">
                <span>
                  <b className="text-white">{user?.follower ?? 0}</b>{" "}
                  <span className="text-gray-500">Following</span>
                </span>
                <span>
                  <b className="text-white">{user?.following ?? 0}</b>{" "}
                  <span className="text-gray-500">Followers</span>
                </span>
              </div>
            </div>
          </div>

          {/* Suggested Follow */}
          <div className="bg-[#262626] rounded-xl p-4">
            <h2 className="font-bold mb-4">Suggested for you</h2>
            {suggested.length === 0 ? (
              <p className="text-gray-500 text-sm text-center">
                No suggestions
              </p>
            ) : (
              suggested.map((u) => {
                const followed = isFollowing(u.id);
                const inProgress = isInProgress(u.id);
                return (
                  <div
                    key={u.id}
                    className="flex items-center justify-between mb-4"
                  >
                    <div
                      className="flex gap-3 cursor-pointer"
                      onClick={() => navigate(`/profile/${u.id}`)}
                    >
                      <div className="w-10 h-10 bg-red-600 rounded-full overflow-hidden">
                        {u.photo_profile && (
                          <img
                            src={`${API_URL}/uploads/${u.photo_profile}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold leading-none">
                          {u.full_name}
                        </p>
                        <p className="text-xs text-gray-500">@{u.username}</p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handleFollow(u.id, {
                          id: u.id,
                          username: u.username,
                          full_name: u.full_name,
                          photo_profile: u.photo_profile ?? null,
                          bio: u.bio ?? null,
                        })
                      }
                      disabled={inProgress}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition disabled:opacity-50 cursor-pointer
                        ${followed ? "bg-gray-700 text-gray-300" : "border border-gray-500 text-gray-300 hover:bg-gray-800"}
                      `}
                    >
                      {inProgress ? "..." : followed ? "Following" : "Follow"}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* --- BOTTOM NAVBAR (mobile & tablet only) --- */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1d1d1d] border-t border-gray-800 flex justify-around items-center py-3 px-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-xs ${isActive ? "text-green-400" : "text-gray-500"}`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 text-xs text-gray-500"
          >
            <SquareUser />
            <span>Logout</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
