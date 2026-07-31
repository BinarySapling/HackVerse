import React, { useEffect, useState } from 'react';
import api from '../config/axios';
import { getApiList } from '../utils/apiResponse';
import { Bell } from 'lucide-react';

const NotificationsBell = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  const load = async () => {
    try {
      const res = await api.get('/notifications/me');
      setItems(getApiList(res).slice(0, 8));
    } catch {
      // ignore - bell is optional
    }
  };

  useEffect(() => {
    load();
  }, []);

  const unread = items.filter((n) => !n.isRead).length;

  const markAll = async () => {
    try {
      await api.patch('/notifications/read-all');
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) load();
        }}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-muted hover:text-secondary hover:bg-white/5"
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl ring-1 ring-white/[0.08] bg-[#121018]/95 backdrop-blur-md shadow-[0_24px_80px_rgba(0,0,0,0.5)] z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <p className="text-sm font-semibold">Notifications</p>
            <button type="button" onClick={markAll} className="text-xs text-primary-soft hover:underline">
              Mark all read
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-xs text-muted px-4 py-6 text-center">No notifications yet.</p>
            ) : (
              items.map((n) => (
                <div
                  key={n._id}
                  className={`px-4 py-3 border-b border-white/5 ${n.isRead ? 'opacity-70' : ''}`}
                >
                  <p className="text-sm font-medium">{n.title || 'Update'}</p>
                  <p className="text-xs text-muted mt-1">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsBell;
