import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  type = 'text',
  error,
  id,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-secondary">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        type={type}
        className={`h-10 px-3 border rounded-md text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:bg-hoverSurface disabled:text-slate-500 disabled:border-border ${
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

Input.displayName = 'Input';

export default Input;
