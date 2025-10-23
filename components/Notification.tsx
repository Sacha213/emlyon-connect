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
    <div className={`fixed top-5 right-5 z-50 p-4 rounded-lg shadow-lg text-white flex items-center gap-4 ${bgColor} animate-fade-in-right`}>
      {notification.type === 'success' && <CheckIcon className="w-6 h-6" />}
      <span>{notification.message}</span>
      <button onClick={onClose} className="p-1 rounded-full hover:bg-black/20">
        <CloseIcon className="w-5 h-5" />
      </button>
      <style>{`
        @keyframes fade-in-right {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in-right {
          animation: fade-in-right 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default NotificationComponent;
