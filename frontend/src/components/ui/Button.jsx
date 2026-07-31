import React from 'react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background transition-all duration-300 disabled:opacity-60 disabled:pointer-events-none';

  const variants = {
    primary:
      'bg-primary/90 text-white hover:bg-primary focus:ring-primary border border-transparent shadow-[0_0_28px_rgba(124,58,237,0.25)] hover:shadow-[0_0_36px_rgba(124,58,237,0.4)]',
    secondary:
      'bg-white/[0.04] text-secondary hover:bg-white/[0.08] focus:ring-primary border border-transparent ring-1 ring-white/[0.06]',
    danger:
      'bg-danger/90 text-white hover:bg-danger focus:ring-danger border border-transparent',
    success:
      'bg-success/90 text-white hover:bg-success focus:ring-success border border-transparent',
    outline:
      'bg-transparent text-secondary hover:bg-white/[0.04] focus:ring-primary ring-1 ring-white/[0.1] hover:ring-primary/35',
  };

  const sizes = {
    sm: 'h-8 px-3.5 text-xs',
    md: 'h-10 px-5 text-sm',
    lg: 'h-11 px-6 text-sm',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
