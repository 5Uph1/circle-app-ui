import { API_URL } from "@/config/api";
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { axiosInstance as axios } from "@/lib/axios";

export interface FollowUser {
  id: number;
  username: string;
  full_name: string;
  photo_profile: string | null;
  bio: string | null;
}

interface FollowState {
  followers: FollowUser[];
  following: FollowUser[];
  myFollowers: FollowUser[];
  loadingFollowers: boolean;
  loadingFollowing: boolean;
  followingInProgress: number[];
  error: string | null;
}

const initialState: FollowState = {
  followers: [],
  following: [],
  myFollowers: [],
  loadingFollowers: false,
  loadingFollowing: false,
  followingInProgress: [],
  error: null,
};

export const fetchFollowers = createAsyncThunk(
  "follow/fetchFollowers",
  async (
    { userId, token }: { userId: number; token: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await axios.get(`${API_URL}/follow/followers/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data as FollowUser[];
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch followers",
      );
    }
  },
);

export const fetchFollowing = createAsyncThunk(
  "follow/fetchFollowing",
  async (
    { userId, token }: { userId: number; token: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await axios.get(`${API_URL}/follow/following/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data as FollowUser[];
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch following",
      );
    }
  },
);

export const fetchMyFollowers = createAsyncThunk(
  "follow/fetchMyFollowers",
  async (
    { userId, token }: { userId: number; token: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await axios.get(`${API_URL}/follow/followers/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data as FollowUser[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed");
    }
  },
);

// ✅ Sekarang terima targetUser dan token
export const followUser = createAsyncThunk(
  "follow/followUser",
  async (
    {
      followerId,
      followingId,
      targetUser,
      token,
    }: {
      followerId: number;
      followingId: number;
      targetUser: FollowUser;
      token: string;
    },
    { rejectWithValue },
  ) => {
    try {
      await axios.post(
        `${API_URL}/follow/follow`,
        { followerId, followingId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return targetUser; // ← kembalikan object user
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to follow user",
      );
    }
  },
);

export const unfollowUser = createAsyncThunk(
  "follow/unfollowUser",
  async (
    { followerId, followingId }: { followerId: number; followingId: number },
    { rejectWithValue },
  ) => {
    try {
      await axios.delete(`${API_URL}/follow/unfollow`, {
        data: { followerId, followingId },
      });
      return followingId;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to unfollow",
      );
    }
  },
);

const followSlice = createSlice({
  name: "follow",
  initialState,
  reducers: {
    clearFollowError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchFollowers
    builder
      .addCase(fetchFollowers.pending, (state) => {
        state.loadingFollowers = true;
        state.error = null;
      })
      .addCase(
        fetchFollowers.fulfilled,
        (state, action: PayloadAction<FollowUser[]>) => {
          state.loadingFollowers = false;
          state.followers = action.payload;
        },
      )
      .addCase(fetchFollowers.rejected, (state, action) => {
        state.loadingFollowers = false;
        state.error = action.payload as string;
      });

    // fetchFollowing
    builder
      .addCase(fetchFollowing.pending, (state) => {
        state.loadingFollowing = true;
        state.error = null;
      })
      .addCase(
        fetchFollowing.fulfilled,
        (state, action: PayloadAction<FollowUser[]>) => {
          state.loadingFollowing = false;
          state.following = action.payload;
        },
      )
      .addCase(fetchFollowing.rejected, (state, action) => {
        state.loadingFollowing = false;
        state.error = action.payload as string;
      });

    builder.addCase(fetchMyFollowers.fulfilled, (state, action) => {
      state.myFollowers = action.payload;
    });

    // followUser
    builder
      .addCase(followUser.pending, (state, action) => {
        state.followingInProgress.push(action.meta.arg.followingId);
        state.error = null;
      })
      // ✅ Sekarang payload adalah FollowUser, langsung push ke state.following
      .addCase(
        followUser.fulfilled,
        (state, action: PayloadAction<FollowUser>) => {
          state.followingInProgress = state.followingInProgress.filter(
            (id) => id !== action.payload.id,
          );
          if (!state.following.find((u) => u.id === action.payload.id)) {
            state.following.push(action.payload);
          }
        },
      )
      .addCase(followUser.rejected, (state, action) => {
        state.followingInProgress = state.followingInProgress.filter(
          (id) => id !== (action.meta.arg as any).followingId,
        );
        state.error = action.payload as string;
      });

    // unfollowUser
    builder
      .addCase(unfollowUser.pending, (state, action) => {
        state.followingInProgress.push(action.meta.arg.followingId);
        state.error = null;
      })
      .addCase(
        unfollowUser.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.followingInProgress = state.followingInProgress.filter(
            (id) => id !== action.payload,
          );
          state.following = state.following.filter(
            (u) => u.id !== action.payload,
          );
        },
      )
      .addCase(unfollowUser.rejected, (state, action) => {
        state.followingInProgress = state.followingInProgress.filter(
          (id) => id !== (action.meta.arg as any).followingId,
        );
        state.error = action.payload as string;
      });
  },
});

export const { clearFollowError } = followSlice.actions;
export default followSlice.reducer;
