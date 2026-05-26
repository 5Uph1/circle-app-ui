import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { toggleLikeAsync } from "@/store/threadSlice";
import { API_URL } from "@/config/api";
import { socket } from "@/lib/socket";
import { updateUser } from "@/store/authSlice";

interface ProfileUser {
  id: number;
  full_name: string;
  username: string;
  bio: string;
  photo_profile: string | null;
  _count: {
    following: number;
    follower: number;
    threadsCreated: number;
  };
}

interface ProfileThread {
  id: number;
  content: string;
  image?: string;
  user: {
    id: number;
    name: string;
    username: string;
    profile_picture: string;
  };
  likes: number;
  replies: number;
  isLiked: boolean;
}

export const useProfile = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
  const user = useSelector((state: RootState) => state.auth.user);

  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [threads, setThreads] = useState<ProfileThread[]>([]);
  const [loading, setLoading] = useState(true);

  const targetId = id ?? currentUserId;
  const isOwnProfile = !id || Number(id) === currentUserId;
  const fetchProfile = async () => {
    if (!token || !targetId) return;
    setLoading(true);

    try {
      let userData;
      let threadData;

      // ✅ PROFILE SENDIRI
      if (targetId === currentUserId) {
        userData = { data: user };

        const threadRes = await fetch(`${API_URL}/thread/user/${targetId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        threadData = await threadRes.json();
      }
      // ✅ PROFILE ORANG LAIN
      else {
        const [userRes, threadRes] = await Promise.all([
          fetch(`${API_URL}/user/profile/${targetId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/thread/user/${targetId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        userData = await userRes.json();
        threadData = await threadRes.json();
      }

      setProfileUser(userData.data);
      setThreads(threadData.data?.threads ?? []);
    } catch (err) {
      console.error("Gagal fetch profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [targetId, token]);

  useEffect(() => {
    if (!token || !targetId) return;

    const handleFollowUpdate = (data: any) => {
      const targetIdNum = Number(targetId);

      if (data.followingId === targetIdNum) {
        setProfileUser((prev) => {
          if (!prev) return prev;
          const delta = data.action === "follow" ? 1 : -1;
          return {
            ...prev,
            _count: {
              ...prev._count,
              following: prev._count.following + delta,
            },
          };
        });

        if (isOwnProfile) {
          dispatch(
            updateUser({
              follower:
                (user?.follower ?? 0) + (data.action === "follow" ? 1 : -1),
            }),
          );
        }
      }

      if (data.followerId === targetIdNum) {
        setProfileUser((prev) => {
          if (!prev) return prev;
          const delta = data.action === "follow" ? 1 : -1;
          return {
            ...prev,
            _count: { ...prev._count, follower: prev._count.follower + delta },
          };
        });

        // ← tambah ini untuk own profile
        if (isOwnProfile) {
          dispatch(
            updateUser({
              following:
                (user?.following ?? 0) + (data.action === "follow" ? 1 : -1),
            }),
          );
        }
      }
    };

    socket.on("follow-updated", handleFollowUpdate);

    return () => {
      socket.off("follow-updated", handleFollowUpdate);
    };
  }, [token, targetId]);

  // handleLike khusus untuk thread di halaman profile
  // Update state lokal, bukan Redux store (karena ini bukan feed utama)
  const handleLike = (id: number) => {
    if (!token) return;

    // Update UI secara optimistic di state lokal
    setThreads((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              isLiked: !t.isLiked,
              likes: t.isLiked ? t.likes - 1 : t.likes + 1,
            }
          : t,
      ),
    );

    // Tetap kirim request ke API
    dispatch(toggleLikeAsync({ id, token }))
      .unwrap()
      .catch(() => {
        // Rollback jika gagal
        setThreads((prev) =>
          prev.map((t) =>
            t.id === id
              ? {
                  ...t,
                  isLiked: !t.isLiked,
                  likes: t.isLiked ? t.likes - 1 : t.likes + 1,
                }
              : t,
          ),
        );
      });
  };

  return { user, profileUser, threads, loading, isOwnProfile, handleLike };
};
