import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  id: number;
  username: string;
  fullname: string;
  email?: string;
  bio?: string | null;
  photo_profile?: string | null;
  following: number;
  follower: number;
}

type AuthState = {
  token: string | null;
  user: UserState | null;
};

const initialState: AuthState = {
  token: localStorage.getItem("token"),
  user: (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })(),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    setUser: (state, action: PayloadAction<UserState>) => {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    updateUser: (state, action: PayloadAction<Partial<UserState>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.clear();
    },
  },
});

export const { setToken, setUser, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
