import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import Button from '../../components/ui/Button';

const Unauthorized = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 gap-6 page-glow">
      <div className="p-4 bg-danger/12 ring-1 ring-danger/20 text-danger rounded-full">
        <ShieldAlert size={40} />
      </div>
      <div>
        <h1 className="text-3xl font-display font-semibold tracking-tight text-secondary">
          Access denied
        </h1>
        <p className="text-sm text-muted mt-3 max-w-md leading-relaxed">
          You do not have permission to view this page.
        </p>
      </div>
      <div className="flex gap-3">
        <Link to="/">
          <Button variant="secondary">Go home</Button>
        </Link>
        <Link to="/login">
          <Button>Log in</Button>
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
