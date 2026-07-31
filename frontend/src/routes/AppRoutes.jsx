import React from 'react';
import { Routes, Route } from 'react-router-dom';

import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import RoleGuard from './RoleGuard';

import Landing from '../pages/Landing';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import HackathonList from '../pages/Hackathons/HackathonList';
import HackathonDetail from '../pages/Hackathons/HackathonDetail';
import Unauthorized from '../pages/error/Unauthorized';
import NotFound from '../pages/error/NotFound';
import Profile from '../pages/Profile/Profile';
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import OrganizerDashboard from '../pages/dashboard/OrganizerDashboard';
import ParticipantDashboard from '../pages/dashboard/ParticipantDashboard';
import JudgeDashboard from '../pages/dashboard/JudgeDashboard';
import HackathonCreate from '../pages/Hackathons/HackathonCreate';
import HackathonEdit from '../pages/Hackathons/HackathonEdit';
import OrganizerResults from '../pages/Leaderboard/OrganizerResults';
import TeamManagement from '../pages/team/TeamManagement';
import ProjectSubmission from '../pages/Submission/ProjectSubmission';
import MyRegistrations from '../pages/registration/MyRegistrations';
import AssignedHackathons from '../pages/Judge/AssignedHackathons';
import EvaluateSubmission from '../pages/Judge/EvaluateSubmission';
import PublicLeaderboard from '../pages/Leaderboard/PublicLeaderboard';
import JudgeRegister from '../pages/invitations/JudgeRegister';
import InvitationRespond from '../pages/invitations/InvitationRespond';

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/hackathons" element={<HackathonList />} />
        <Route path="/hackathons/:slug" element={<HackathonDetail />} />
        <Route path="/hackathons/:hackathonId/leaderboard" element={<PublicLeaderboard />} />
        <Route path="/judge/register" element={<JudgeRegister />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/invitations/judge" element={<InvitationRespond type="judge" />} />
          <Route path="/invitations/team" element={<InvitationRespond type="team" />} />
        </Route>

        <Route element={<RoleGuard allowedRoles={['participant']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard/participant" element={<ParticipantDashboard />} />
            <Route path="/registrations/me" element={<MyRegistrations />} />
            <Route path="/hackathons/:hackathonId/team" element={<TeamManagement />} />
            <Route path="/hackathons/:hackathonId/submit" element={<ProjectSubmission />} />
          </Route>
        </Route>

        <Route element={<RoleGuard allowedRoles={['judge']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard/judge" element={<JudgeDashboard />} />
            <Route path="/judge/hackathons" element={<AssignedHackathons />} />
            <Route path="/judge/submissions/:submissionId/evaluate" element={<EvaluateSubmission />} />
          </Route>
        </Route>

        <Route element={<RoleGuard allowedRoles={['organizer']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/hackathons/create" element={<HackathonCreate />} />
            <Route path="/hackathons/:hackathonId/edit" element={<HackathonEdit />} />
          </Route>
        </Route>

        <Route element={<RoleGuard allowedRoles={['organizer', 'admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard/organizer" element={<OrganizerDashboard />} />
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/hackathons/:hackathonId/results" element={<OrganizerResults />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
