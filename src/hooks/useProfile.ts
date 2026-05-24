import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { toggleLikeAsync } from "@/store/threadSlice";
import { API_URL } from "@/config/api";

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

  useEffect(() => {
    if (!token || !targetId) return;

    const fetchProfile = async () => {
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

    fetchProfile();
  }, [targetId, token]);

  // ✅ handleLike khusus untuk thread di halaman profile
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
