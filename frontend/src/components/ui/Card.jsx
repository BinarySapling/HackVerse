import React from 'react';

const Card = ({ children, className = '', onClick, ...props }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-[#121018]/70 rounded-2xl p-5 ring-1 ring-white/[0.06] transition-all duration-300 ${
        onClick
          ? 'cursor-pointer hover:bg-[#18151f]/90 hover:ring-primary/20 hover:-translate-y-0.5'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
