import React, { forwardRef } from 'react';

const Select = forwardRef(({
  label,
  options = [],
  error,
  id,
  className = '',
  placeholder = 'Select an option',
  ...props
}, ref) => {
  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-secondary">
          {label}
        </label>
      )}
      <select
        id={id}
        ref={ref}
        className={`h-10 px-3 border rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:bg-hoverSurface disabled:text-slate-500 disabled:border-border ${
          error ? 'border-danger focus:ring-danger focus:border-danger' : 'border-border'
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
      {error && (
        <span className="text-xs text-danger font-medium">
          {error}
        </span>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
