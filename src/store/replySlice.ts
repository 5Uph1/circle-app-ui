import { API_URL } from "@/config/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface Reply {
  id: number;
  content: string;
  image: string | null;
  created_at: string;
  user: {
    id: number;
    username: string;
    name: string;
    profile_picture: string;
  };
}

interface ReplyState {
  list: Reply[];
  loading: boolean;
  posting: boolean;
}

const initialState: ReplyState = {
  list: [],
  loading: false,
  posting: false,
};

// ─── Fetch replies ────────────────────────────────────────────────────────────
export const fetchReply = createAsyncThunk(
  "replies/fetchReplies",
  async ({ token, id }: { token: string; id: number }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/reply/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Gagal mengambil data");
      const data = await response.json();
      return data.data.replies;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

// ─── Post reply ───────────────────────────────────────────────────────────────
export const postReply = createAsyncThunk(
  "replies/postReply",
  async (
    {
      token,
      threadId,
      content,
      image,
    }: {
      token: string;
      threadId: number;
      content: string;
      image: File | null;
    },
    { rejectWithValue },
  ) => {
    try {
      const formData = new FormData();
      formData.append("content", content);
      if (image) formData.append("image", image);

      const response = await fetch(`${API_URL}/reply/${threadId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error("Gagal posting reply");
      const data = await response.json();
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

const replySlice = createSlice({
  name: "reply",
  initialState,
  reducers: {
    // ✅ Untuk terima reply realtime dari socket
    addReply: (state, action) => {
      const exists = state.list.find((r) => r.id === action.payload.id);
      if (!exists) {
        state.list.push(action.payload); // ← taruh di bawah
      }
    },
    // ✅ Reset list saat pindah thread
    clearReplies: (state) => {
      state.list = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReply.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchReply.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchReply.rejected, (state) => {
        state.loading = false;
      })
      .addCase(postReply.pending, (state) => {
        state.posting = true;
      })
      .addCase(postReply.fulfilled, (state) => {
        state.posting = false;
      })
      .addCase(postReply.rejected, (state) => {
        state.posting = false;
      });
  },
});

export const { addReply, clearReplies } = replySlice.actions;
export default replySlice.reducer;
