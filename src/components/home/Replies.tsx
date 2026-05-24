import { useReplyManager } from "@/hooks/useReply";
import { timeAgo } from "@/pages/Home";
import { ArrowLeft, Heart, ImagePlus, MessageCircle, X } from "lucide-react";

const AVATAR_COLORS = [
  "#6366f1",
  "#e879f9",
  "#f97316",
  "#22c55e",
  "#a78bfa",
  "#4a90d9",
  "#f43f5e",
  "#14b8a6",
];

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({
  src,
  initials,
  color,
  size = 40,
}: {
  src?: string;
  initials: string;
  color?: string;
  size?: number;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={initials}
        style={{ width: size, height: size }}
        className="rounded-full object-cover shrink-0"
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: size * 0.32,
      }}
      className="rounded-full shrink-0 flex items-center justify-center font-bold text-white"
    >
      {initials}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonReply() {
  return (
    <div className="flex gap-3 px-4 py-3 border-b border-[#2f3336] animate-pulse">
      <div className="w-10 h-10 rounded-full bg-[#2f3336] shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3 bg-[#2f3336] rounded w-32" />
        <div className="h-3 bg-[#2f3336] rounded w-full" />
        <div className="h-3 bg-[#2f3336] rounded w-2/3" />
      </div>
    </div>
  );
}

// ─── Reply Card ───────────────────────────────────────────────────────────────
function ReplyCard({ reply, index }: { reply: any; index: number }) {
  const avatarSrc = reply.user?.profile_picture ?? undefined;

  return (
    <div className="flex gap-3 px-4 py-3 border-b border-[#2f3336]">
      <Avatar
        src={avatarSrc}
        initials={(reply.user?.name ?? "?").slice(0, 2).toUpperCase()}
        color={AVATAR_COLORS[index % AVATAR_COLORS.length]}
        size={38}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[#e7e9ea] text-sm font-bold">
            {reply.user?.name}
          </span>
          <span className="text-[#71767b] text-sm">
            @{reply.user?.username} · {timeAgo(reply.created_at)}
          </span>
        </div>

        <p className="text-[#e7e9ea] text-sm leading-relaxed mt-1 mb-2 whitespace-pre-wrap break-words">
          {reply.content}
        </p>

        {reply.image && (
          <img
            src={reply.image}
            alt="attachment"
            className="rounded-xl max-h-72 object-cover w-full mb-2"
          />
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function Replies() {
  const {
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
  } = useReplyManager();

  const threadAvatarSrc = thread?.user?.profile_picture ?? undefined;

  return (
    <main className="flex-1 border-x border-[#2f3336] min-h-screen">
      {/* ── Header ── */}
      <div className="sticky top-0 z-10 bg-[#1d1d1d]/80 backdrop-blur-md border-b border-[#2f3336] px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => history.back()}
          className="text-[#e7e9ea] hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="text-[#e7e9ea] text-lg font-bold">Status</span>
      </div>

      {/* ── Main Post ── */}
      {thread ? (
        <div className="px-4 py-4 border-b border-[#2f3336]">
          <div className="flex gap-3 mb-3">
            <Avatar
              src={threadAvatarSrc}
              initials={(thread.user?.name ?? "?").slice(0, 2).toUpperCase()}
              color="#b5651d"
              size={40}
            />
            <div>
              <p className="text-[#e7e9ea] font-bold text-sm">
                {thread.user?.name}
              </p>
              <p className="text-[#71767b] text-sm">@{thread.user?.username}</p>
            </div>
          </div>

          <p className="text-[#e7e9ea] text-lg leading-relaxed mb-3">
            {thread.content}
          </p>

          {/* ✅ Image thread jika ada */}
          {thread.image && (
            <img
              src={thread.image}
              alt="thread attachment"
              className="rounded-xl w-full object-cover max-h-80 mb-3 border border-[#2f3336]"
            />
          )}

          <div className="border-t border-[#2f3336] pt-3 flex gap-6">
            <button className="flex items-center gap-1.5 text-[#71767b] text-sm">
              <MessageCircle size={17} />
              {thread.replies} Replies
            </button>
            <button
              className="flex items-center gap-1.5 text-sm"
              style={{ color: thread.isLiked ? "#f91880" : "#71767b" }}
            >
              <Heart
                size={17}
                fill={thread.isLiked ? "#f91880" : "none"}
                stroke={thread.isLiked ? "#f91880" : "#71767b"}
              />
              {thread.likes}
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 py-4 border-b border-[#2f3336] animate-pulse">
          <div className="flex gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#2f3336]" />
            <div className="space-y-2 pt-1">
              <div className="h-3 bg-[#2f3336] rounded w-28" />
              <div className="h-3 bg-[#2f3336] rounded w-20" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-[#2f3336] rounded w-full" />
            <div className="h-4 bg-[#2f3336] rounded w-3/4" />
          </div>
        </div>
      )}

      {/* ── Reply Input ── */}
      <form onSubmit={onSubmitReply} className="border-b border-[#2f3336]">
        <div className="flex items-center gap-3 px-4 py-3">
          <Avatar initials="Y" color="#4a90d9" size={36} />

          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your reply!"
            className="flex-1 bg-transparent outline-none text-[#e7e9ea] text-sm placeholder:text-[#71767b]"
          />

          {/* ✅ Hidden file input */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setImage(e.target.files[0]);
              }
            }}
          />

          <div className="flex items-center gap-3">
            <button type="button" onClick={() => fileInputRef.current?.click()}>
              <ImagePlus size={18} className="text-[#04a51e]" />
            </button>

            <button
              type="submit"
              disabled={!content.trim() || posting}
              className="bg-[#16a34a] text-white rounded-full px-4 py-1.5 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {posting ? "Posting..." : "Reply"}
            </button>
          </div>
        </div>

        {/* ✅ Preview image yang dipilih */}
        {image && (
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 bg-[#2f3336] px-3 py-1.5 rounded-lg w-fit">
              <span>🖼️</span>
              <span className="text-sm text-[#e7e9ea]">{image.name}</span>
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-red-400 hover:text-red-600 ml-1"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}
      </form>

      {/* ── Replies List ── */}
      <div>
        {loading ? (
          <>
            <SkeletonReply />
            <SkeletonReply />
            <SkeletonReply />
          </>
        ) : replies.length === 0 ? (
          <p className="text-center text-[#71767b] text-sm py-10">
            Belum ada reply. Jadilah yang pertama!
          </p>
        ) : (
          replies.map((reply, index) => (
            <ReplyCard key={reply.id} reply={reply} index={index} />
          ))
        )}
      </div>
    </main>
  );
}
