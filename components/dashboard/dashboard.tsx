'use client';

import React, { useEffect, useState } from 'react';
import { createClientComponentClient, User } from '@supabase/auth-helpers-nextjs';
import { getProfileRole } from '@/lib/actions/user.actions';
import ProfileDashboard from "@/components/student/ProfileDashboard"
import StudentDashboard from '@/components/student/StudentDashboard';
import TutorDashboard from '@/components/tutor/DashboardContent';
import AdminDashboard from '@/components/admin/DashboardContent';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/contexts/profileContext';

const Dashboard = () => {
  const { profile, setProfile } = useProfile()
  const router = useRouter();

  if (!profile || !profile.role) {
    router.push('/login');
    return null;
  }

  // Layout with Sidebar and Navbar
  return (
    <main>
      {profile.role === 'Student' && <StudentDashboard/>}
      {profile.role === 'Tutor' && <TutorDashboard />}
      {profile.role === 'Admin' && <AdminDashboard />}
    </main>
  );
};

export default Dashboard;
