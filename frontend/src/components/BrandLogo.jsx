import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/hackverse-logo.png';

const BrandLogo = ({
  to = '/',
  size = 'md',
  showText = false,
  className = '',
  imgClassName = '',
}) => {
  const sizes = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
    xl: 'h-20',
  };

  const content = (
    <span className={`inline-flex items-center gap-2 select-none ${className}`}>
      <img
        src={logo}
        alt="HackVerse"
        className={`${sizes[size] || sizes.md} w-auto object-contain ${imgClassName}`}
      />
      {showText && (
        <span className="font-bold text-lg tracking-tight">HackVerse</span>
      )}
    </span>
  );

  if (!to) return content;

  return (
    <Link to={to} className="inline-flex items-center" aria-label="HackVerse home">
      {content}
    </Link>
  );
};

export default BrandLogo;
