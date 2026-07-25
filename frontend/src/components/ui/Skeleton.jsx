import React from 'react';

const Skeleton = ({
  variant = 'text',
  className = '',
  count = 1,
}) => {
  const baseStyles = 'bg-slate-200 animate-pulse rounded';
  
  const variants = {
    text: 'h-4 w-full my-2',
    title: 'h-6 w-3/4 my-3',
    avatar: 'h-10 w-10 rounded-full',
    rect: 'h-32 w-full rounded-md',
  };

  const skeletons = Array.from({ length: count });

  return (
    <>
      {skeletons.map((_, idx) => (
        <div
          key={idx}
          className={`${baseStyles} ${variants[variant]} ${className}`}
        />
      ))}
    </>
  );
};

export default Skeleton;
