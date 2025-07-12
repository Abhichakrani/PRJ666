import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import withAuth from '@/utils/withAuth';

const STATUS_ORDER = [
  { key: 'Pending Approval', label: 'Pending Approval', color: 'bg-blue-100', text: 'text-blue-900', bar: 'bg-blue-200' },
  { key: 'Under Review', label: 'Under Review', color: 'bg-yellow-100', text: 'text-yellow-900', bar: 'bg-yellow-200' },
  { key: 'Resolved', label: 'Resolved', color: 'bg-green-100', text: 'text-green-900', bar: 'bg-green-200' },
  { key: 'Rejected', label: 'Rejected', color: 'bg-red-100', text: 'text-red-900', bar: 'bg-red-200' },
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

  // Group issues by status
  const groupedIssues = STATUS_ORDER.map(statusObj => ({
    ...statusObj,
    issues: issues.filter(issue => issue.status === statusObj.key)
  }));

  return (
    <div className="min-h-screen flex bg-[#f8f7f3]">
      {/* Left Panel */}
      <div className="flex-1 p-8 pr-0 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-[#FF9100]">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            {/* Bell Icon */}
            <button className="p-2"><svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"/><path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"/></svg></button>
            {/* Settings Icon */}
            <button className="p-2"><svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15A1.65 1.65 0 0 0 21 12.6a1.65 1.65 0 0 0-1.6-2.4 1.65 1.65 0 0 0-2.4-1.6A1.65 1.65 0 0 0 12.6 3a1.65 1.65 0 0 0-2.4 1.6A1.65 1.65 0 0 0 8.6 7.4a1.65 1.65 0 0 0-1.6 2.4A1.65 1.65 0 0 0 3 12.6a1.65 1.65 0 0 0 1.6 2.4 1.65 1.65 0 0 0 2.4 1.6A1.65 1.65 0 0 0 11.4 21a1.65 1.65 0 0 0 2.4-1.6 1.65 1.65 0 0 0 1.6-2.4 1.65 1.65 0 0 0 1.6-2.4z"/></svg></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto pr-8">
          {groupedIssues.map(({ key, label, color, bar, issues }) => (
            <div key={key} className="mb-4">
              <div className={`rounded-md px-4 py-2 mb-2 font-medium ${bar}`}>{label}</div>
              {issues.length === 0 ? null : issues.map(issue => (
                <div
                  key={issue._id}
                  className="bg-white rounded-xl shadow-sm mb-4 flex items-center justify-between px-6 py-4 border border-gray-100 cursor-pointer hover:shadow-md transition"
                  onClick={() => router.push(`/admin/issues/${issue._id}`)}
                >
                  <div>
                    <div className="font-bold text-lg text-gray-900">{issue.title}</div>
                    <div className="text-gray-500 text-sm">Filed on: {new Date(issue.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      {/* Right Panel */}
      <div className="w-[420px] bg-black text-white flex flex-col items-center justify-center p-12">
        <h2 className="text-[#FF9100] text-3xl font-bold mb-12">Statistics</h2>
        <div className="grid grid-cols-2 gap-x-12 gap-y-8 mb-12 w-full">
          <div className="text-center">
            <div className="text-lg">Total Issues</div>
            <div className="text-3xl font-bold">{stats.total}</div>
          </div>
          <div className="text-center">
            <div className="text-lg">Pending Approval</div>
            <div className="text-3xl font-bold">{stats.pendingApproval}</div>
          </div>
          <div className="text-center">
            <div className="text-lg">Under Review</div>
            <div className="text-3xl font-bold">{stats.underReview}</div>
          </div>
          <div className="text-center">
            <div className="text-lg">Resolved</div>
            <div className="text-3xl font-bold">{stats.resolved}</div>
          </div>
          <div className="text-center col-span-2">
            <div className="text-lg">Rejected</div>
            <div className="text-3xl font-bold">{stats.rejected}</div>
          </div>
        </div>
        <button className="w-full py-4 rounded-full bg-[#FF9100] text-white text-xl font-bold shadow-lg hover:bg-orange-600 transition">View Reports</button>
      </div>
    </div>
  );
};

export default withAuth(AdminDashboard, ['admin']);
