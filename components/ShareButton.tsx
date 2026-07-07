"use client";

import { useState } from "react";
import ShareModal from "./ShareModal";

interface ShareButtonProps {
  slug: string;
  name: string;
  title: string;
  bio?: string;
  avatar?: string;
}

export default function ShareButton({
  slug,
  name,
  title,
  bio,
  avatar,
}: ShareButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-sm px-4 py-2 rounded-xl bg-amethyst-500/20 text-amethyst-300 border border-amethyst-500/30 hover:bg-amethyst-500/30 transition-colors flex items-center gap-1.5"
      >
        <span>📤</span> 分享
      </button>
      {showModal && (
        <ShareModal
          url={`/memorial/${slug}`}
          title={title}
          name={name}
          bio={bio}
          avatar={avatar}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
