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
  fetchMyFollowers,
} from "../store/followSlice";
import { updateUser } from "@/store/authSlice";
import { API_URL } from "@/config/api";
import { socket } from "@/lib/socket";

export const useFollow = (currentUserId: number, profileUserId: number) => {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);

  const {
    followers,
    following,
    myFollowers,
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

  // useEffect 2 — fetch myFollowers
  useEffect(() => {
    if (!currentUserId || !token) return;
    dispatch(fetchMyFollowers({ userId: currentUserId, token }));
  }, [dispatch, currentUserId, token]);

  // useEffect 3 — socket listener
  useEffect(() => {
    if (!token) return;

    const handleFollowUpdate = (data: any) => {
      if (data.followingId === currentUserId) {
        dispatch(fetchMyFollowers({ userId: currentUserId, token }));
        dispatch(fetchFollowers({ userId: profileUserId, token }));
      }
    };

    socket.on("follow-updated", handleFollowUpdate);

    return () => {
      socket.off("follow-updated", handleFollowUpdate);
    };
  }, [currentUserId, profileUserId, token, dispatch]);

  // ← isFollowing harus didefinisikan SEBELUM isFollowBack
  const isFollowing = useCallback(
    (targetUserId: number) => following.some((u) => u.id === targetUserId),
    [following],
  );

  const isInProgress = useCallback(
    (targetUserId: number) => followingInProgress.includes(targetUserId),
    [followingInProgress],
  );

  // ← pakai myFollowers, bukan followers
  const isFollowBack = useCallback(
    (targetUserId: number) =>
      myFollowers.some((u) => u.id === targetUserId) &&
      !isFollowing(targetUserId),
    [myFollowers, isFollowing],
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

      const meRes = await fetch(`${API_URL}/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const meData = await meRes.json();
      dispatch(
        updateUser({
          following: meData.data._count.follower,
          follower: meData.data._count.following,
        }),
      );

      dispatch(fetchFollowing({ userId: currentUserId, token }));
      dispatch(fetchMyFollowers({ userId: currentUserId, token }));

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
    isFollowBack,
    handleFollow,
  };
};
