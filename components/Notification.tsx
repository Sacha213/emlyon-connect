import React from 'react';
import type { Notification } from '../types';
import { CloseIcon, CheckIcon } from './icons';

interface NotificationProps {
  notification: Notification;
  onClose: () => void;
}

const NotificationComponent: React.FC<NotificationProps> = ({ notification, onClose }) => {
  const bgColor = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
  }[notification.type];

  return (
    <div
      className={`fixed right-4 md:right-6 top-20 md:top-24 z-[1100] max-w-sm md:max-w-md w-[calc(100vw-2rem)] md:w-auto p-4 rounded-xl shadow-2xl ring-1 ring-white/10 text-white flex items-center gap-3 ${bgColor} animate-slide-down`}
      role="status"
      aria-live="polite"
    >
      {notification.type === 'success' && <CheckIcon className="w-6 h-6" />}
      <span>{notification.message}</span>
      <button onClick={onClose} className="p-1 rounded-full hover:bg-black/20">
        <CloseIcon className="w-5 h-5" />
      </button>
      <style>{`
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-down {
          animation: slide-down 220ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }
      `}</style>
    </div>
  );
};

export default NotificationComponent;
