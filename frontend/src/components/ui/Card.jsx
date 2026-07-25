import React from 'react';

const Card = ({
  children,
  className = '',
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-border rounded-lg shadow-sm p-5 transition-colors duration-200 ${
        onClick ? 'cursor-pointer hover:bg-hoverSurface' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
