import React from 'react';

const Badge = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border';
  
  const variants = {
    default: 'bg-hoverSurface text-surfaceDark border-border',
    primary: 'bg-teal-50 text-primary border-teal-200',
    success: 'bg-green-50 text-success border-green-200',
    danger: 'bg-red-50 text-danger border-red-200',
    warning: 'bg-orange-50 text-warning border-orange-200',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
