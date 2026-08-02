import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/hackverse-logo.png';

const BrandLogo = ({
  to = '/',
  size = 'md',
  showText = true,
  className = '',
  imgClassName = '',
}) => {
  const sizes = {
    sm: 'h-9 w-9',
    md: 'h-11 w-11',
    lg: 'h-16 w-16',
    xl: 'h-28 w-28',
    hero: 'h-40 w-40 sm:h-52 sm:w-52',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
    hero: 'text-4xl sm:text-5xl',
  };

  const content = (
    <span className={`inline-flex items-center gap-3 select-none group ${className}`}>
      <span className="relative inline-flex items-center justify-center">
        <span className="absolute inset-0 rounded-2xl bg-primary/30 blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
        <img
          src={logo}
          alt="HackVerse"
          className={`relative ${sizes[size] || sizes.md} object-contain drop-shadow-[0_0_18px_rgba(124,58,237,0.45)] transition-transform duration-300 group-hover:scale-105 ${imgClassName}`}
        />
      </span>
      {showText && (
        <span className={`font-display font-bold tracking-tight ${textSizes[size] || textSizes.md}`}>
          Hack<span className="text-primary-soft">Verse</span>
        </span>
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
