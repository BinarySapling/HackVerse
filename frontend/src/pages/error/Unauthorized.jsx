import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import Button from '../../components/ui/Button';

const Unauthorized = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 gap-6">
      <div className="p-4 bg-red-50 text-danger rounded-full">
        <ShieldAlert size={48} />
      </div>
      <div>
        <h1 className="text-3xl font-extrabold text-secondary leading-tight">Access Denied</h1>
        <p className="text-sm text-slate-500 mt-2 max-w-md">
          You do not have the required permissions or authentication scopes to view this page. If you believe this is an error, please contact your administrator.
        </p>
      </div>
      <div className="flex gap-3">
        <Link to="/">
          <Button variant="secondary">Go to Home</Button>
        </Link>
        <Link to="/login">
          <Button variant="primary">Login Account</Button>
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
