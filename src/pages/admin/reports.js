// /pages/admin/reports.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import withAuth from '@/utils/withAuth';
import NotificationBell from "@/components/shared/NotificationBell";
import SettingsMenu from "@/components/shared/SettingsMenu";

const AdminReports = () => {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({ status: '', category: '', dateFrom: '', dateTo: '' });
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/all-issues', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      let filteredIssues = data.issues;

      if (filters.status) {
        filteredIssues = filteredIssues.filter(issue => issue.status === filters.status);
      }
      if (filters.category) {
        filteredIssues = filteredIssues.filter(issue => issue.category === filters.category);
      }
      if (filters.dateFrom) {
        filteredIssues = filteredIssues.filter(issue => new Date(issue.createdAt) >= new Date(filters.dateFrom));
      }
      if (filters.dateTo) {
        filteredIssues = filteredIssues.filter(issue => new Date(issue.createdAt) <= new Date(filters.dateTo));
      }

      setIssues(filteredIssues);
      setStats(data.stats);
    } catch (err) {
      console.error('Error loading reports:', err);
    }
  };

  const handleExportCSV = () => {
    const csv = [
      ['Title', 'Category', 'Location', 'Created At', 'Status', 'Reported By', 'Assigned Clerk'],
      ...issues.map(i => [
        i.title,
        i.category,
        i.location,
        new Date(i.createdAt).toLocaleDateString(),
        i.status,
        i.userId?.email || 'N/A',
        i.assignedClerk?.email || 'Unassigned'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'admin_report.csv';
    link.click();
  };

  return (
    <div className="flex min-h-screen font-sans">
      {/* Left - Report List */}
      <div className="w-2/3 bg-[#fdfaf5] p-8 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-4xl font-bold text-orange-500">Reports (Admin)</h2>
          <div className="flex items-center gap-4 text-black">
           <NotificationBell />
           <SettingsMenu />
         </div>
      </div>


        {/* Filters */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <select className="p-2 border rounded" onChange={e => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All Status</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Under Review">Under Review</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <input type="text" placeholder="Category" className="p-2 border rounded" onChange={e => setFilters({ ...filters, category: e.target.value })} />
          <div className="flex gap-2">
            <input type="date" className="p-2 border rounded" onChange={e => setFilters({ ...filters, dateFrom: e.target.value })} />
            <input type="date" className="p-2 border rounded" onChange={e => setFilters({ ...filters, dateTo: e.target.value })} />
          </div>
        </div>

        {/* Issue List */}
        {issues.map((issue, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow mb-4">
            <h4 className="font-bold text-lg">{issue.title}</h4>
            <p className="text-sm text-gray-700">Category: {issue.category}</p>
            <p className="text-sm text-gray-700">Location: {issue.location}</p>
            <p className="text-sm text-gray-700">Date: {new Date(issue.createdAt).toLocaleDateString()}</p>
            <p className="text-sm text-gray-700">Status: {issue.status}</p>
            <p className="text-sm text-gray-700">User: {issue.userId?.email || 'N/A'}</p>
            <p className="text-sm text-gray-700">Clerk: {issue.assignedClerk?.email || 'Unassigned'}</p>
          </div>
        ))}
      </div>

      {/* Right - Statistics & Export */}
      <div className="w-1/3 bg-black text-white p-12">
        <h3 className="text-3xl font-bold text-orange-500 mb-8">Statistics</h3>
        <div className="grid grid-cols-2 gap-y-8 text-lg">
          <div><p>Total Issues</p><p className="font-bold text-2xl">{stats.total || 0}</p></div>
          <div><p>Pending Approval</p><p className="font-bold text-2xl">{stats.pendingApproval || 0}</p></div>
          <div><p>Under Review</p><p className="font-bold text-2xl">{stats.underReview || 0}</p></div>
          <div><p>Resolved</p><p className="font-bold text-2xl">{stats.resolved || 0}</p></div>
          <div><p>Rejected</p><p className="font-bold text-2xl">{stats.rejected || 0}</p></div>
        </div>
        <button onClick={handleExportCSV} className="mt-12 w-full py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold transition">
          Download CSV
        </button>
        <button onClick={() => window.print()} className="mt-4 w-full py-2 rounded-full border border-white text-white hover:bg-white hover:text-black transition">
          Print Report
        </button>
      </div>
    </div>
  );
};

export default withAuth(AdminReports, ['admin']);
