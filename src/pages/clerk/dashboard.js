import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import withAuth from '@/utils/withAuth';
import { FiArrowRight } from 'react-icons/fi';
import NotificationBell from "@/components/shared/NotificationBell";
import SettingsMenu from "@/components/shared/SettingsMenu";
const ClerkDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pendingApproval: 0,
    underReview: 0,
    resolved: 0,
    rejected: 0
  });
  const router = useRouter();

  useEffect(() => {
    fetchAssignedIssues();
    const intervalId = setInterval(fetchAssignedIssues, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const fetchAssignedIssues = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/issues/assigned', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIssues(data.issues);

        const computedStats = {
          total: data.issues.length,
          pendingApproval: data.issues.filter(issue => issue.status === 'Pending Approval').length,
          underReview: data.issues.filter(issue => issue.status === 'Under Review').length,
          resolved: data.issues.filter(issue => issue.status === 'Resolved').length,
          rejected: data.issues.filter(issue => issue.status === 'Rejected').length
        };
        setStats(computedStats);
      } else if (response.status === 401 || response.status === 403) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching assigned issues:', error);
    }
  };

  const grouped = issues.reduce((acc, issue) => {
    if (!acc[issue.status]) acc[issue.status] = [];
    acc[issue.status].push(issue);
    return acc;
  }, { 'Pending Approval': [], 'Under Review': [], 'Resolved': [], 'Rejected': [] });

  const statusColors = {
    'Pending Approval': '#d1ecf1',
    'Under Review': '#fdf8d7',
    'Resolved': '#d4edda',
    'Rejected': '#f8d7da'
  };

  const renderSection = (status) => (
    <div key={status} className="mb-6">
      <div className="text-lg font-medium mb-3 px-3 py-1" style={{ backgroundColor: statusColors[status], borderRadius: 8 }}>
        {status}
      </div>
      {(grouped[status] || []).map(issue => (
        <div
          key={issue._id}
          onClick={() => router.push(`/clerk/issues/${issue._id}`)}
          className="cursor-pointer bg-white p-4 mt-2 rounded-xl shadow-md flex justify-between items-center hover:shadow-lg"
        >
          <div>
            <h4 className="font-bold text-black text-lg">{issue.title}</h4>
            <p className="text-sm text-gray-600">Filed on: {new Date(issue.createdAt).toLocaleDateString()}</p>
          </div>
          <FiArrowRight size={20} />
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-screen font-sans">
      {/* Left - Issue Sections */}
      <div className="w-2/3 bg-[#fdfaf5] p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-bold text-orange-500">Clerk Dashboard</h2>
          <div className="flex items-center gap-4 text-black">
            <NotificationBell />
            <SettingsMenu />
          </div>
        </div>

        {renderSection('Pending Approval')}
        {renderSection('Under Review')}
        {renderSection('Resolved')}
        {renderSection('Rejected')}
      </div>

      {/* Right - Statistics */}
      <div className="w-1/3 bg-black text-white p-12">
        <h3 className="text-3xl font-bold text-orange-500 mb-8">Statistics</h3>
        <div className="grid grid-cols-2 gap-y-8 text-lg">
          <div>
            <p>Total Issues</p>
            <p className="font-bold text-2xl">{stats.total}</p>
          </div>
          <div>
            <p>Pending Approval</p>
            <p className="font-bold text-2xl">{stats.pendingApproval}</p>
          </div>
          <div>
            <p>Under Review</p>
            <p className="font-bold text-2xl">{stats.underReview}</p>
          </div>
          <div>
            <p>Resolved</p>
            <p className="font-bold text-2xl">{stats.resolved}</p>
          </div>
          <div>
            <p>Rejected</p>
            <p className="font-bold text-2xl">{stats.rejected}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(ClerkDashboard, ['clerk']);
