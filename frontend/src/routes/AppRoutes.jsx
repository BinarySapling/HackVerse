import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Guards
import ProtectedRoute from './ProtectedRoute';
import RoleGuard from './RoleGuard';

// Pages - Public
import Landing from '../pages/Landing';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import HackathonList from '../pages/hackathons/HackathonList';
import HackathonDetail from '../pages/hackathons/HackathonDetail';
import Unauthorized from '../pages/error/Unauthorized';
import NotFound from '../pages/error/NotFound';

// Pages - Protected Core
import Profile from '../pages/profile/Profile';

// Dashboards
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import OrganizerDashboard from '../pages/dashboard/OrganizerDashboard';
import ParticipantDashboard from '../pages/dashboard/ParticipantDashboard';
import JudgeDashboard from '../pages/dashboard/JudgeDashboard';

// Features - Organizer/Admin
import HackathonCreate from '../pages/hackathons/HackathonCreate';
import HackathonEdit from '../pages/hackathons/HackathonEdit';
import OrganizerResults from '../pages/leaderboard/OrganizerResults';

// Features - Participant
import TeamManagement from '../pages/team/TeamManagement';
import ProjectSubmission from '../pages/submission/ProjectSubmission';
import MyRegistrations from '../pages/registration/MyRegistrations';

// Features - Judge
import AssignedHackathons from '../pages/judge/AssignedHackathons';
import EvaluateSubmission from '../pages/judge/EvaluateSubmission';

// Features - Shared/Public
import PublicLeaderboard from '../pages/leaderboard/PublicLeaderboard';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/hackathons" element={<HackathonList />} />
        <Route path="/hackathons/:slug" element={<HackathonDetail />} />
        <Route path="/hackathons/:hackathonId/leaderboard" element={<PublicLeaderboard />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        {/* Core profile */}
        <Route element={<DashboardLayout />}>
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Participant Routes */}
        <Route element={<RoleGuard allowedRoles={['participant']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard/participant" element={<ParticipantDashboard />} />
            <Route path="/registrations/me" element={<MyRegistrations />} />
            <Route path="/hackathons/:hackathonId/team" element={<TeamManagement />} />
            <Route path="/hackathons/:hackathonId/submit" element={<ProjectSubmission />} />
          </Route>
        </Route>

        {/* Judge Routes */}
        <Route element={<RoleGuard allowedRoles={['judge']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard/judge" element={<JudgeDashboard />} />
            <Route path="/judge/hackathons" element={<AssignedHackathons />} />
            <Route path="/judge/submissions/:submissionId/evaluate" element={<EvaluateSubmission />} />
          </Route>
        </Route>

        {/* Organizer Routes */}
        <Route element={<RoleGuard allowedRoles={['organizer']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/hackathons/create" element={<HackathonCreate />} />
            <Route path="/hackathons/:hackathonId/edit" element={<HackathonEdit />} />
          </Route>
        </Route>

        {/* Organizer / Admin Routes */}
        <Route element={<RoleGuard allowedRoles={['organizer', 'admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard/organizer" element={<OrganizerDashboard />} />
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/hackathons/:hackathonId/results" element={<OrganizerResults />} />
          </Route>
        </Route>
      </Route>

      {/* 404 Catch All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
