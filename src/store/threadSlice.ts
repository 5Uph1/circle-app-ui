import { API_URL } from "@/config/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

interface Thread {
  id: number;
  content: string;
  image: string;
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

interface ThreadState {
  list: Thread[];
  loading: boolean;
}

const initialState: ThreadState = {
  list: [],
  loading: false,
};

// ─── FETCH THREAD ─────────────────────────────
export const fetchThreads = createAsyncThunk(
  "threads/fetchThreads",
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/thread/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Gagal mengambil data");

      const data = await response.json();
      return data.data.threads;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

// ─── TOGGLE LIKE (API) ─────────────────────────
export const toggleLikeAsync = createAsyncThunk(
  "threads/toggleLike",
  async ({ id, token }: { id: number; token: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/thread/${id}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Gagal update like");

      return id;
    } catch (err: any) {
      return rejectWithValue({ id, message: err.message });
    }
  },
);

// ─── POST THREAD ──────────────────────────────
export const postThread = createAsyncThunk(
  "threads/postThread",
  async (
    { content, image }: { content: string; image: File | null },
    { rejectWithValue },
  ) => {
    try {
      const formData = new FormData();
      formData.append("content", content);

      if (image) formData.append("image", image);

      const res = await axios.post(`${API_URL}/thread/post`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      return res.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Gagal posting");
    }
  },
);

const threadSlice = createSlice({
  name: "thread",
  initialState,
  reducers: {
    // ✅ Optimistic Like (klik user)
    toggleLike: (state, action) => {
      const thread = state.list.find((t) => t.id === action.payload);
      if (thread) {
        thread.isLiked = !thread.isLiked;
        thread.likes += thread.isLiked ? 1 : -1;
      }
    },

    // ✅ Realtime dari socket
    updateLikeRealtime: (state, action) => {
      const { thread_id, likes } = action.payload;

      const thread = state.list.find((t) => t.id === thread_id);
      if (thread) {
        thread.likes = likes;
      }
    },

    // ✅ Tambah thread realtime
    addThread: (state, action) => {
      const exists = state.list.find((t) => t.id === action.payload.id);

      if (!exists) {
        state.list.unshift(action.payload);
      }
    },

    incrementReplyCount: (state, action) => {
      const thread = state.list.find((t) => t.id === action.payload);
      if (thread) {
        thread.replies += 1;
      }
    },
  },

  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchThreads.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchThreads.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchThreads.rejected, (state) => {
        state.loading = false;
      })

      // rollback kalau gagal
      .addCase(toggleLikeAsync.rejected, (state, action: any) => {
        const { id } = action.payload;
        const thread = state.list.find((t) => t.id === id);

        if (thread) {
          thread.isLiked = !thread.isLiked;
          thread.likes += thread.isLiked ? 1 : -1;
        }
      })

      // post thread
      .addCase(postThread.pending, (state) => {
        state.loading = true;
      })
      .addCase(postThread.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(postThread.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const {
  toggleLike,
  updateLikeRealtime,
  addThread,
  incrementReplyCount,
} = threadSlice.actions;

export default threadSlice.reducer;
