import React, { forwardRef } from 'react';

const Textarea = forwardRef(({
  label,
  error,
  id,
  className = '',
  rows = 4,
  ...props
}, ref) => {
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-secondary">
          {label}
        </label>
      )}
      <textarea
        id={id}
        ref={ref}
        rows={rows}
        className={`px-3 py-2 border rounded-md text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:bg-hoverSurface disabled:text-slate-500 disabled:border-border resize-y ${
          error ? 'border-danger focus:ring-danger focus:border-danger' : 'border-border'
        }`}
        {...props}
      />
      {error && (
        <span className="text-xs text-danger font-medium">
          {error}
        </span>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
