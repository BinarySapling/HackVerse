import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import Button from '../../components/ui/Button';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 gap-6">
      <div className="p-4 bg-slate-100 text-slate-400 rounded-full">
        <HelpCircle size={48} />
      </div>
      <div>
        <h1 className="text-3xl font-extrabold text-secondary leading-tight">Page Not Found</h1>
        <p className="text-sm text-slate-500 mt-2 max-w-md">
          The page you are looking for does not exist or has been moved. Check the URL or navigate back.
        </p>
      </div>
      <div>
        <Link to="/">
          <Button variant="primary">Return Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
