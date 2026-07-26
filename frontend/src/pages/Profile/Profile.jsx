import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { User, Mail, ShieldAlert } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-secondary">My Profile</h2>
        <p className="text-xs text-slate-400">View your current registration profiles and access roles.</p>
      </div>

      <Card className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-primary text-white rounded-full flex items-center justify-center font-bold text-2xl">
            {user.firstName[0].toUpperCase()}{user.lastName[0].toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-secondary">
              {user.firstName} {user.lastName}
            </h3>
            <Badge variant="primary" className="capitalize mt-1">
              {user.role}
            </Badge>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="text-slate-400" size={18} />
            <div>
              <span className="text-xs text-slate-400 block font-semibold">Email Address</span>
              <span className="text-secondary font-medium">{user.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <ShieldAlert className="text-slate-400" size={18} />
            <div>
              <span className="text-xs text-slate-400 block font-semibold">Role Control Scope</span>
              <span className="text-secondary font-medium capitalize">{user.role} Authorization</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
