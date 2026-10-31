// components/ProfileImageModal.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X } from "lucide-react";

export default function ProfileImageModal({
  open,
  onClose,
  src,
  name,
}: {
  open: boolean;
  onClose: () => void;
  src: string;
  name: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.75)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative flex flex-col items-center gap-4"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute -top-3 -right-3 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4 text-slate-700" />
            </button>

            {/* Full image */}
            <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden ring-4 ring-white/20">
              <Image
                src={src}
                alt={name}
                width={320}
                height={320}
                className="object-cover w-full h-full"
                priority
              />
            </div>

            <div className="text-center">
              <p className="text-white font-semibold text-lg">{name}</p>
              <p className="text-white/60 text-sm mt-0.5">Profile photo</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}