import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";
import {
  fetchFollowers,
  fetchFollowing,
  followUser,
  unfollowUser,
  clearFollowError,
  type FollowUser,
} from "../store/followSlice";
import { updateUser } from "@/store/authSlice";
import { API_URL } from "@/config/api";
import { socket } from "@/lib/socket";

export const useFollow = (currentUserId: number, profileUserId: number) => {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);

  const {
    followers,
    following,
    loadingFollowers,
    loadingFollowing,
    followingInProgress,
    error,
  } = useSelector((state: RootState) => state.follow);

  // useEffect 1 — fetch awal
  useEffect(() => {
    if (!profileUserId || !token) return;
    dispatch(fetchFollowers({ userId: profileUserId, token }));
    dispatch(fetchFollowing({ userId: currentUserId, token }));
  }, [dispatch, profileUserId, currentUserId, token]);

  // useEffect 2 — socket listener
  useEffect(() => {
    if (!token) return;

    const handleFollowUpdate = (data: any) => {
      if (
        data.followerId === currentUserId ||
        data.followingId === currentUserId
      ) {
        dispatch(fetchFollowing({ userId: currentUserId, token }));
        dispatch(fetchFollowers({ userId: profileUserId, token }));
      }
    };

    socket.on("follow-updated", handleFollowUpdate);

    return () => {
      socket.off("follow-updated", handleFollowUpdate);
    };
  }, [currentUserId, profileUserId, token, dispatch]);

  const isFollowing = useCallback(
    (targetUserId: number) => following.some((u) => u.id === targetUserId),
    [following],
  );

  const isInProgress = useCallback(
    (targetUserId: number) => followingInProgress.includes(targetUserId),
    [followingInProgress],
  );

  // ✅ Follow Back: dia ada di followers kita, tapi kita belum follow balik
  const isFollowBack = useCallback(
    (targetUserId: number) =>
      followers.some((u) => u.id === targetUserId) &&
      !isFollowing(targetUserId),
    [followers, isFollowing],
  );

  const handleFollow = useCallback(
    async (targetUserId: number, targetUser?: FollowUser) => {
      if (!token) return;
      if (isInProgress(targetUserId)) return;

      if (isFollowing(targetUserId)) {
        await dispatch(
          unfollowUser({
            followerId: currentUserId,
            followingId: targetUserId,
          }),
        );
      } else {
        await dispatch(
          followUser({
            followerId: currentUserId,
            followingId: targetUserId,
            targetUser: targetUser ?? {
              id: targetUserId,
              username: "",
              full_name: "",
              photo_profile: null,
              bio: null,
            },
            token,
          }),
        );
      }

      // 🔥 fetch sekali setelah follow/unfollow selesai
      const meRes = await fetch(`${API_URL}/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const meData = await meRes.json();
      dispatch(
        updateUser({
          following: meData.data._count.following,
          follower: meData.data._count.follower,
        }),
      );

      dispatch(fetchFollowing({ userId: currentUserId, token }));

      if (profileUserId !== currentUserId) {
        dispatch(fetchFollowers({ userId: profileUserId, token }));
      }
    },
    [dispatch, token, currentUserId, profileUserId, isFollowing, isInProgress],
  );

  const clearError = useCallback(() => {
    dispatch(clearFollowError());
  }, [dispatch]);

  return {
    followers,
    following,
    loadingFollowers,
    loadingFollowing,
    error,
    clearError,
    isFollowing,
    isInProgress,
    isFollowBack, // ✅ baru
    handleFollow,
  };
};
