import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import type { AppDispatch, RootState } from "@/store/store";
import {
  fetchReply,
  postReply,
  addReply,
  clearReplies,
} from "@/store/replySlice";
import { socket } from "@/lib/socket";

export const useReplyManager = () => {
  const { id } = useParams();
  const threadId = Number(id);

  const dispatch = useDispatch<AppDispatch>();

  const token = useSelector((state: RootState) => state.auth.token);
  const replies = useSelector((state: RootState) => state.reply.list);
  const loading = useSelector((state: RootState) => state.reply.loading);
  const posting = useSelector((state: RootState) => state.reply.posting);
  const thread = useSelector((state: RootState) =>
    state.thread.list.find((t) => t.id === threadId),
  );

  // State form
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!token || !threadId || isNaN(threadId)) return;

    // Fetch replies awal
    dispatch(fetchReply({ token, id: threadId }));

    // ✅ Join room thread ini supaya hanya terima reply thread ini
    socket.emit("join-thread", threadId);

    const handleNewReply = (data: any) => {
      dispatch(addReply(data));
    };

    socket.on("new-reply", handleNewReply);

    return () => {
      // ✅ Leave room dan cleanup saat keluar halaman
      socket.emit("leave-thread", threadId);
      socket.off("new-reply", handleNewReply);
      dispatch(clearReplies());
    };
  }, [token, threadId, dispatch]);

  const onSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !token) return;

    const result = await dispatch(
      postReply({
        token,
        threadId,
        content,
        image,
      }),
    );

    if (postReply.fulfilled.match(result)) {
      setContent("");
      setImage(null);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return {
    thread,
    replies,
    loading,
    posting,
    content,
    setContent,
    image,
    setImage,
    fileInputRef,
    onSubmitReply,
  };
};
