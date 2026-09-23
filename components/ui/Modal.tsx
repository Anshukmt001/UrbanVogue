"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: string;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = "max-w-md",
}: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-6 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 12 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full ${maxWidth} border border-border bg-card`}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              {title ? (
                <h3 className="font-headline text-sm tracking-[0.14em] uppercase">
                  {title}
                </h3>
              ) : (
                <span />
              )}
              <button
                onClick={onClose}
                aria-label="Close"
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-6 py-5">{children}</div>
            {actions && (
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
                {actions}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}