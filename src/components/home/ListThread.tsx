import { ImagePlus } from "lucide-react";
import { ThreadCard } from "./ThreadCard";

interface Thread {
  id: number;
  content: string;
  image?: string;
  user: {
    id: number;
    name: string;
    username: string;
    profile_picture: string;
  };
  likes: number;
  replies: number;
  isLiked: boolean;
  onLike: (id: number) => void;
}

interface ListThreadProps {
  onSubmit: (e: React.FormEvent) => void;
  content: string;
  setContent: (value: string) => void;
  image: File | null;
  setImage: (file: File | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  threads: Thread[];
  handleLike: (id: number | string) => void;
}

export function ListThread({
  onSubmit,
  content,
  setContent,
  image,
  setImage,
  fileInputRef,
  threads,
  handleLike,
}: ListThreadProps) {
  return (
    <main className="flex-1 border-x border-[#2f3336] min-h-screen">
      <div className="p-4">
        <h1 className="text-xl font-bold">Home</h1>
      </div>

      {/* Input Post */}
      <form onSubmit={onSubmit}>
        <div className="p-4 border-b border-gray-800 flex flex-col items-center">
          <div className="flex gap-4 items-center w-full h-full">
            <div className="w-10 h-10 rounded-full bg-yellow-500 flex-shrink-0"></div>
            <input
              type="text"
              placeholder="What is happening?!"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-transparent flex-1 outline-none text-gray-300"
            />

            {/* Hidden Input File */}
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
              {/* Pastikan ImagePlus sudah di-import dari lucide-react atau library lain */}
              <ImagePlus
                className="text-[#04a51e] cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              />
              <button
                disabled={!content.trim()}
                className="bg-green-600 px-5 py-1.5 rounded-full font-bold text-sm cursor-pointer hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
              >
                Post
              </button>
              {/* <button
                                type="submit"
                                disabled={!content.trim()}
                                className="bg-[#16a34a] text-white rounded-full px-4 py-1.5 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                            >
                            </button> */}
            </div>
          </div>

          {/* Preview Nama File Image */}
          {image && (
            <div className="w-full mt-3">
              <div className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded w-fit">
                <span>🖼️</span>
                <span className="text-sm text-gray-300">{image.name}</span>
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="text-red-400 font-bold ml-2 cursor-pointer hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* List Threads */}
      <div className="flex flex-col">
        {threads.length === 0 ? (
          <p className="text-gray-500 p-4 text-center">Belum ada thread</p>
        ) : (
          threads.map((thread) => (
            <ThreadCard
              key={thread.id}
              {...thread}
              onLike={() => handleLike(thread.id)}
            />
          ))
        )}
      </div>
    </main>
  );
}
