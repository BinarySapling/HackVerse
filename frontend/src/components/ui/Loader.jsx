import React from 'react';

const Loader = ({ size = 'md', fullPage = false, className = '' }) => {
  const sizeStyles = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-4',
    lg: 'h-16 w-16 border-4',
  };

  const loaderContent = (
    <div
      className={`animate-spin rounded-full border-t-primary border-r-transparent border-b-transparent border-l-transparent ${sizeStyles[size]} ${className}`}
    />
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
        {loaderContent}
      </div>
    );
  }

  return <div className="flex items-center justify-center p-6">{loaderContent}</div>;
};

export default Loader;
