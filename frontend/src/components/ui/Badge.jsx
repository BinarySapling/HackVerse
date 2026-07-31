import React from 'react';

const Badge = ({ children, variant = 'default', className = '' }) => {
  const baseStyles =
    'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide border';

  const variants = {
    default: 'bg-white/[0.04] text-muted border-white/[0.08]',
    primary: 'bg-primary/12 text-primary-soft border-primary/20',
    success: 'bg-success/12 text-success border-success/20',
    danger: 'bg-danger/12 text-danger border-danger/20',
    warning: 'bg-warning/12 text-warning border-warning/20',
  };

  return <span className={`${baseStyles} ${variants[variant]} ${className}`}>{children}</span>;
};

export default Badge;
