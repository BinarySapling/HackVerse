import React, { forwardRef } from 'react';

const Select = forwardRef(
  (
    {
      label,
      options = [],
      error,
      id,
      className = '',
      placeholder = 'Select an option',
      ...props
    },
    ref
  ) => {
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
        <select
          id={id}
          ref={ref}
          className={`h-11 px-3.5 rounded-xl text-sm bg-white/[0.03] text-secondary ring-1 focus:outline-none focus:ring-primary/50 focus:bg-white/[0.05] disabled:bg-white/[0.02] disabled:text-muted disabled:ring-white/[0.04] transition-all duration-200 ${
            error ? 'ring-danger/50 focus:ring-danger' : 'ring-white/[0.08]'
          }`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-danger font-medium">{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
