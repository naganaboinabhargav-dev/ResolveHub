import { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-void/50 backdrop-blur-sm animate-fadeUp" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} card max-h-[90vh] overflow-y-auto p-6 animate-fadeUp`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-black/5 hover:text-ink">
            <FiX size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
