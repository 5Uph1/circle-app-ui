import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";

import {
  fetchThreads,
  postThread,
  toggleLike,
  toggleLikeAsync,
  addThread,
  updateLikeRealtime,
  incrementReplyCount,
} from "../store/threadSlice";

import { logout } from "@/store/authSlice";
import { socket } from "@/lib/socket";

export const useThreadManager = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const token = useSelector((state: RootState) => state.auth.token);
  const threads = useSelector((state: RootState) => state.thread.list);

  const fullname = localStorage.getItem("fullname");
  const username = localStorage.getItem("username");

  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!token) return;

    dispatch(fetchThreads(token));

    socket.connect();

    const handleConnect = () => {
      console.log("Connected:", socket.id);
    };

    const handleNewThread = (data: any) => {
      console.log("Realtime thread:", data);
      dispatch(addThread(data));
    };

    // ✅ FIX: handler khusus like
    const handleLikeUpdate = (data: any) => {
      console.log("Realtime like:", data);
      dispatch(updateLikeRealtime(data));
    };

    const handleNewReply = (data: any) => {
      dispatch(incrementReplyCount(data.thread_id));
    };

    socket.on("connect", handleConnect);
    socket.on("new-thread", handleNewThread);
    socket.on("like-updated", handleLikeUpdate);
    socket.on("reply-created", handleNewReply);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("new-thread", handleNewThread);
      socket.off("like-updated", handleLikeUpdate);
      socket.off("reply-created", handleNewReply);

      socket.disconnect();
    };
  }, [token, dispatch]);

  // ✅ klik like (optimistic)
  const handleLike = (id: number) => {
    if (!token) return;

    dispatch(toggleLike(id));
    dispatch(toggleLikeAsync({ id, token }));
  };

  const handleLogout = () => {
    localStorage.clear();
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const handlePost = async (content: string, image: File | null) => {
    return await dispatch(postThread({ content, image }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPosting) return; // guard double submit

    setIsPosting(true);
    const result = await handlePost(content, image);

    if (postThread.fulfilled.match(result)) {
      setContent("");
      setImage(null);
    }
    setIsPosting(false);
  };

  return {
    content,
    threads,
    fullname,
    username,
    fileInputRef,
    image,
    setImage,
    setContent,
    onSubmit,
    handleLike,
    handleLogout,
    handlePost,
    isPosting,
    isLoggedIn: !!token,
  };
};
