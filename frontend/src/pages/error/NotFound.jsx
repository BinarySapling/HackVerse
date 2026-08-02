import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import Button from '../../components/ui/Button';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 gap-6 page-glow">
      <div className="p-4 bg-white/[0.04] ring-1 ring-white/[0.06] text-muted rounded-full">
        <HelpCircle size={40} />
      </div>
      <div>
        <h1 className="text-3xl font-display font-semibold tracking-tight text-secondary">
          Page not found
        </h1>
        <p className="text-sm text-muted mt-3 max-w-md leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>
      <Link to="/">
        <Button>Return home</Button>
      </Link>
    </div>
  );
};

export default NotFound;
