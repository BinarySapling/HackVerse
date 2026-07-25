import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({
  title = 'No data found',
  description = 'There are no items to display at this time.',
  icon: Icon = Inbox,
  children,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 bg-white border border-border rounded-lg text-center ${className}`}>
      <div className="p-3 bg-slate-50 text-slate-400 rounded-full mb-4">
        <Icon size={32} />
      </div>
      <h3 className="text-base font-semibold text-secondary mb-1">
        {title}
      </h3>
      <p className="text-sm text-slate-500 max-w-sm mb-4">
        {description}
      </p>
      {children}
    </div>
  );
};

export default EmptyState;
