import { API_URL } from "@/config/api";
import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { axiosInstance as axios } from "@/lib/axios";

// ─── INTERFACE ─────────────────────────────
interface User {
  id: number;
  username: string;
  full_name: string;
  photo_profile?: string;
  bio?: string;
  isFollowing?: boolean;
}

interface UserState {
  search: {
    list: User[];
    loading: boolean;
  };
  suggested: {
    list: User[];
    loading: boolean;
  };
}

const initialState: UserState = {
  search: {
    list: [],
    loading: false,
  },
  suggested: {
    list: [],
    loading: false,
  },
};

// ─── SEARCH USER ─────────────────────────────
export const searchUsers = createAsyncThunk(
  "user/searchUsers",
  async (query: string, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token;

      const res = await axios.get(`${API_URL}/user/search?q=${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data.data as User[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Search failed");
    }
  },
);

// ─── SUGGEST USER ─────────────────────────────
export const getSuggestedUsers = createAsyncThunk(
  "user/getSuggestedUsers",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token;

      const res = await axios.get(`${API_URL}/user/suggested`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data.data as User[];
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch suggestions",
      );
    }
  },
);

// ─── SLICE ─────────────────────────────
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // ✅ Optimistic Follow Toggle
    toggleFollow: (state, action: PayloadAction<number>) => {
      const user = state.search.list.find((u) => u.id === action.payload);
      if (user) {
        user.isFollowing = !user.isFollowing;
      }
    },

    // clear search
    clearSearch: (state) => {
      state.search.list = [];
    },
  },

  extraReducers: (builder) => {
    builder
      // SEARCH
      .addCase(searchUsers.pending, (state) => {
        state.search.loading = true;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.search.loading = false;
        state.search.list = action.payload;
      })
      .addCase(searchUsers.rejected, (state) => {
        state.search.loading = false;
      })
      .addCase(getSuggestedUsers.pending, (state) => {
        state.suggested.loading = true;
      })
      .addCase(getSuggestedUsers.fulfilled, (state, action) => {
        state.suggested.loading = false;
        state.suggested.list = action.payload;
      })
      .addCase(getSuggestedUsers.rejected, (state) => {
        state.suggested.loading = false;
      });
  },
});

export const { toggleFollow, clearSearch } = userSlice.actions;

export default userSlice.reducer;
