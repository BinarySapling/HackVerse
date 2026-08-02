import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen = false, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative bg-[#121018]/95 backdrop-blur-md w-full ${sizes[size]} rounded-2xl ring-1 ring-white/[0.08] shadow-[0_24px_80px_rgba(0,0,0,0.55)] overflow-hidden z-10`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h3 className="text-base font-semibold font-display tracking-tight text-secondary">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-muted hover:text-secondary focus:outline-none rounded-full p-1 hover:bg-white/[0.05] transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-5 max-h-[75vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
