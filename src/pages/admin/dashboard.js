import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import withAuth from '@/utils/withAuth';
import NotificationBell from "@/components/shared/NotificationBell";
import SettingsMenu from "@/components/shared/SettingsMenu";


const STATUS_ORDER = [
  { key: 'Pending Approval', label: 'Pending Approval', bg: '#d1ecf1' },
  { key: 'Under Review', label: 'Under Review', bg: '#fdf8d7' },
  { key: 'Resolved', label: 'Resolved', bg: '#d4edda' },
  { key: 'Rejected', label: 'Rejected', bg: '#f8d7da' },
];

const AdminDashboard = () => {
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
    fetchAllIssues();
  }, []);

  const fetchAllIssues = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch('/api/admin/all-issues', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setIssues(data.issues);
        setStats({
          total: data.stats.total,
          pendingApproval: data.stats.pendingApproval,
          underReview: data.stats.underReview,
          resolved: data.stats.resolved,
          rejected: data.stats.rejected
        });
      }
    } catch (error) {
      console.error('Error fetching all issues:', error);
    }
  };

  const groupedIssues = STATUS_ORDER.map(status => ({
    ...status,
    issues: issues.filter(issue => issue.status === status.key)
  }));

  return (
    <div className="flex min-h-screen font-sans">
      {/* Left - Issue Sections */}
      <div className="w-2/3 bg-[#fdfaf5] p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-bold text-orange-500">Admin Dashboard</h2>
          <div className="flex items-center gap-4 text-black">
            <NotificationBell />
            <SettingsMenu />
          </div>
        </div>

        {groupedIssues.map(({ key, label, bg, issues }) => (
          <div key={key} className="mb-6">
            <div className="text-lg font-medium mb-3 px-3 py-1" style={{ backgroundColor: bg, borderRadius: 8 }}>
              {label}
            </div>
            {issues.map(issue => (
              <div
                key={issue._id}
                onClick={() => router.push(`/admin/issues/${issue._id}`)}
                className="cursor-pointer bg-white p-4 mt-2 rounded-xl shadow-md flex justify-between items-center hover:shadow-lg"
              >
                <div>
                  <h4 className="font-bold text-black text-lg">{issue.title}</h4>
                  <p className="text-sm text-gray-600">Filed on: {new Date(issue.createdAt).toLocaleDateString()}</p>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            ))}
          </div>
        ))}
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
        <div><button
  onClick={() => router.push('/admin/reports')}
  className="mt-12 w-full py-2 rounded-full flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-semibold transition"
>
  View Reports
</button>
</div>
      </div>
    </div>
  );
};

export default withAuth(AdminDashboard, ['admin']);
