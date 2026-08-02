import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, type = 'text', error, id, className = '', ...props }, ref) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-[11px] font-medium text-muted/90 uppercase tracking-[0.16em]"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        type={type}
        className={`h-11 px-3.5 rounded-xl text-sm bg-white/[0.03] text-secondary placeholder-muted/60 ring-1 focus:outline-none focus:ring-primary/50 focus:bg-white/[0.05] disabled:bg-white/[0.02] disabled:text-muted disabled:ring-white/[0.04] transition-all duration-200 ${
          error ? 'ring-danger/50 focus:ring-danger' : 'ring-white/[0.08]'
        }`}
        {...props}
      />
      {error && <span className="text-xs text-danger font-medium">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
