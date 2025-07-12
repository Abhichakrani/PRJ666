import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const STATUS_COLORS = {
  'Pending Approval': 'bg-blue-200 text-blue-900',
  'Under Review': 'bg-yellow-100 text-yellow-900',
  'Resolved': 'bg-green-100 text-green-900',
  'Rejected': 'bg-red-100 text-red-900',
};

const STATUS_OPTIONS = [
  'Pending Approval',
  'Under Review',
  'Resolved',
  'Rejected',
];

export default function AdminIssueDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [issue, setIssue] = useState(null);
  const [clerks, setClerks] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedClerk, setSelectedClerk] = useState('');
  const [updateText, setUpdateText] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchIssueDetails();
    fetchClerks();
  }, [id]);

  const fetchIssueDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`/api/admin/all-issues`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const found = data.issues.find((iss) => iss._id === id);
        setIssue(found || null);
        setSelectedStatus(found?.status || '');
        setSelectedClerk(found?.assignedClerk?._id || '');
      }
    } catch (e) {
      setIssue(null);
    }
  };

  const fetchClerks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('/api/admin/clerks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setClerks(data.clerks);
      }
    } catch (e) {
      setClerks([]);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    setMessage('');
    let didUpdate = false;
    try {
      const token = localStorage.getItem('token');
      // 1. Update clerk if changed
      if (selectedClerk && issue && selectedClerk !== (issue.assignedClerk?._id || '')) {
        const res = await fetch('/api/issues/assign', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ issueId: issue._id, clerkId: selectedClerk }),
        });
        if (!res.ok) {
          const data = await res.json();
          setMessage(data.message || 'Failed to assign clerk');
          setLoading(false);
          return;
        }
        didUpdate = true;
      }
      // 2. Update status or add update text if changed
      if ((selectedStatus && selectedStatus !== issue.status) || updateText.trim()) {
        const res = await fetch(`/api/issues/${issue._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: selectedStatus, updateText }),
        });
        if (!res.ok) {
          const data = await res.json();
          setMessage(data.message || 'Failed to update issue');
          setLoading(false);
          return;
        }
        didUpdate = true;
      }
      if (didUpdate) {
        setMessage('Issue updated successfully!');
        setUpdateText('');
        await fetchIssueDetails();
      } else {
        setMessage('No changes to update.');
      }
    } catch (e) {
      setMessage('Error updating issue.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setUpdateText('');
    setMessage('');
    setSelectedStatus(issue?.status || '');
    setSelectedClerk(issue?.assignedClerk?._id || '');
  };

  if (!issue) {
    return <div className="p-10 text-red-500">Issue not found or loading...</div>;
  }

  return (
    <div className="min-h-screen flex bg-[#f8f7f3]">
      {/* Left Panel */}
      <div className="flex-1 p-8 pr-0 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-[#FF9100]">Issue Details (Admin)</h1>
          <div className="flex items-center gap-4">
            {/* Bell Icon */}
            <button className="p-2"><svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"/><path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"/></svg></button>
            {/* Settings Icon */}
            <button className="p-2"><svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15A1.65 1.65 0 0 0 21 12.6a1.65 1.65 0 0 0-1.6-2.4 1.65 1.65 0 0 0-2.4-1.6A1.65 1.65 0 0 0 12.6 3a1.65 1.65 0 0 0-2.4 1.6A1.65 1.65 0 0 0 8.6 7.4a1.65 1.65 0 0 0-1.6 2.4A1.65 1.65 0 0 0 3 12.6a1.65 1.65 0 0 0 1.6 2.4A1.65 1.65 0 0 0 11.4 21a1.65 1.65 0 0 0 2.4-1.6 1.65 1.65 0 0 0 1.6-2.4 1.65 1.65 0 0 0 1.6-2.4z"/></svg></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto pr-8">
          <div className="mb-4">
            <div className="text-2xl font-bold mb-2">{issue.title}</div>
            <div className="flex items-center gap-4 mb-2">
              <div className="flex text-3xl text-black">
                {[1,2,3,4,5].map(i => <span key={i}>☆</span>)}
              </div>
              <div className="ml-auto italic text-lg text-gray-700">Filed On: {new Date(issue.createdAt).toLocaleDateString()}</div>
            </div>
            {issue.feedbacks && issue.feedbacks.length > 0 && (
              <div className="mb-2"><span className="font-bold">Feedback by client:</span> {issue.feedbacks[0].comment}</div>
            )}
            <div className="mb-2">{issue.category}</div>
            <div className="mb-4 text-gray-700">{issue.description}</div>
            <div className="mb-2 font-bold">Location</div>
            {/* Map placeholder */}
            <div className="rounded-2xl overflow-hidden border-2 border-gray-200 mb-4" style={{height: '140px', background:'#1a2236', display:'flex', alignItems:'center', justifyContent:'center'}}>
              <span className="text-white text-3xl font-bold">{issue.location}</span>
            </div>
            <button className="w-full border border-gray-400 rounded-full py-2 flex items-center justify-center gap-2 text-lg font-semibold mb-4 hover:bg-gray-100 transition">
              <span>↓</span> Download Issue Files
            </button>
          </div>
        </div>
      </div>
      {/* Right Panel */}
      <div className="w-[420px] bg-black text-white flex flex-col items-center p-12">
        <h2 className="text-[#FF9100] text-2xl font-bold mb-8 w-full text-left">Update Issue</h2>
        <div className="w-full mb-8">
          <label className="block text-lg mb-2">Select Status</label>
          <select
            className="w-full mb-4 bg-black border border-gray-600 rounded-md py-2 px-3 text-white"
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
          >
            <option value="">Select Status</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <label className="block text-lg mb-2">Current Clerk</label>
          <select
            className="w-full mb-4 bg-black border border-gray-600 rounded-md py-2 px-3 text-white"
            value={selectedClerk}
            onChange={e => setSelectedClerk(e.target.value)}
          >
            <option value="">{issue.assignedClerk ? 'Change Clerk' : 'Assign Clerk'}</option>
            {clerks.map(c => <option key={c._id} value={c._id}>{c.name} ({c.email})</option>)}
          </select>
          <label className="block text-lg mb-2">Update Text</label>
          <textarea
            className="w-full mb-4 bg-black border border-gray-600 rounded-md py-2 px-3 text-white min-h-[120px]"
            placeholder="Enter update details..."
            value={updateText}
            onChange={e => setUpdateText(e.target.value)}
          />
          <div className="flex gap-4 mt-2">
            <button
              className="flex-1 py-3 rounded-full border-2 border-[#FF9100] text-[#FF9100] text-xl font-bold hover:bg-[#ff91001a] transition"
              onClick={handleClear}
              disabled={loading}
            >
              Clear
            </button>
            <button
              className="flex-1 py-3 rounded-full bg-[#FF9100] text-white text-xl font-bold hover:bg-orange-600 transition"
              onClick={handleUpdate}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update'}
            </button>
          </div>
          {message && <div className={`mt-2 text-center ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>{message}</div>}
        </div>
        <div className="w-full border-b border-gray-700 mb-6"></div>
        <div className="w-full">
          <div className="text-[#FF9100] text-xl font-bold mb-4">Updates</div>
          <ul className="mb-6 space-y-2">
            {(issue.updates || []).map((u, idx) => (
              <li key={idx} className="text-white text-base flex flex-col gap-1">
                <span>• <span className="font-semibold">Update 0{(issue.updates.length-idx)}:</span> {u.text}</span>
                {u.status && (
                  <span className={`inline-block mt-1 px-3 py-1 rounded-md text-sm font-semibold ${STATUS_COLORS[u.status] || 'bg-gray-200 text-black'}`}>• {u.status}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
