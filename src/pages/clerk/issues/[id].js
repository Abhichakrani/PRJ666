import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import withAuth from "@/utils/withAuth";
import dynamic from 'next/dynamic';
import NotificationBell from "@/components/shared/NotificationBell";
import SettingsMenu from "@/components/shared/SettingsMenu";

const MapDisplay = dynamic(() => import('@/components/MapDisplay'), { ssr: false });

const STATUS_COLORS = {
  'Pending Approval': 'bg-blue-200 text-blue-900',
  'Under Review': 'bg-yellow-100 text-yellow-900',
  'Resolved': 'bg-green-100 text-green-900',
  'Rejected': 'bg-red-100 text-red-900',
};

const PRIORITY_COLORS = {
  'Low': 'bg-gray-100 text-gray-800',
  'Medium': 'bg-blue-100 text-blue-800',
  'High': 'bg-orange-100 text-orange-800',
  'Critical': 'bg-red-100 text-red-800',
};

function ClerkIssueDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [updateText, setUpdateText] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchIssueDetails();
    const intervalId = setInterval(fetchIssueDetails, 5000);
    return () => clearInterval(intervalId);
  }, [id]);

  const fetchIssueDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return router.push("/login");
      const res = await fetch(`/api/issues/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setIssue(data.issue);
        setLoading(false);
        setMessage("");
        setNewStatus(prev => prev || data.issue.status);
      } else if ([401, 403].includes(res.status)) {
        router.push("/login");
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching issue details:", err);
      setMessage("Failed to load issue");
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || !updateText.trim()) {
      setMessage("Please provide both status and update text");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/issues/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          updateText: updateText.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Issue updated successfully!");
        setUpdateText("");
        fetchIssueDetails();
      } else {
        setMessage(data.message || "Failed to update issue");
      }
    } catch (err) {
      setMessage("Error updating issue");
    }
  };

  const handleClear = () => {
    setUpdateText("");
    setMessage("");
    setNewStatus(issue?.status || "");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f7f3] flex items-center justify-center">
        <div className="text-2xl font-bold text-orange-500">Loading...</div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-[#f8f7f3] flex items-center justify-center">
        <div className="text-2xl font-bold text-red-500">Issue not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#f8f7f3]">
      <div className="flex-1 p-8 pr-0 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-orange-500">Issue Details (Clerk)</h1>
          <div className="flex items-center gap-4 text-black">
            <NotificationBell />
            <SettingsMenu />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-8">
  {/* Updated Issue Information UI */}
  <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{issue.title}</h2>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full font-semibold">
            {issue.category}
          </span>
          <span className={`px-3 py-1 rounded-full font-semibold ${STATUS_COLORS[issue.status]}`}>
            {issue.status}
          </span>
        </div>
      </div>
      <div className="text-right text-gray-600">
        <p>Reported: {new Date(issue.createdAt).toLocaleDateString()}</p>
<p>ID: {issue._id?.slice(-8)}</p>
      </div>
    </div>
    
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
      <p className="text-gray-700 leading-relaxed">{issue.description}</p>
    </div>

    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Location</h3>
      <p className="text-gray-700 mb-4">{issue.location}</p>
      <div className="rounded-xl overflow-hidden border-2 border-gray-300">
        <MapDisplay lat={issue.latitude} lng={issue.longitude} interactive={false} />
      </div>
    </div>

    {issue.images?.length > 0 && (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Attached Files</h3>
        <button 
          onClick={() => window.open(issue.images[0], '_blank')} 
          className="w-full border border-gray-400 rounded-full py-2 flex items-center justify-center gap-2 text-lg font-semibold hover:bg-gray-100 transition"
        >
          <span>📎</span> Download Issue Files ({issue.images.length} file{issue.images.length > 1 ? 's' : ''})
        </button>
      </div>
    )}
  </div>

  {/* Feedback Section */}
  {issue.feedbacks?.length > 0 && (
    <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Feedback by Client</h2>
      <div className="space-y-4">
        {issue.feedbacks.map((fb, idx) => (
          <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              {[1, 2, 3, 4, 5].map(star => (
                <span key={star} className={`text-xl ${fb.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
              ))}
            </div>
            {fb.comment && <p className="text-gray-700">{fb.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  )}
</div>

      </div>

      <div className="w-1/3 bg-black text-white flex flex-col items-center p-12">
        <h2 className="text-[#FF9100] text-2xl font-bold mb-8 w-full text-left">Update Issue</h2>
        <div className="w-full mb-8">
          <label className="block text-lg mb-2">Select Status</label>
          <select
            className="w-full mb-4 bg-black border border-gray-600 rounded-md py-2 px-3 text-white"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            <option value="Pending Approval">Pending Approval</option>
            <option value="Under Review">Under Review</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <label className="block text-lg mb-2">Update Text</label>
          <textarea
            className="w-full mb-4 bg-black border border-gray-600 rounded-md py-2 px-3 text-white min-h-[120px]"
            placeholder="Enter update details..."
            value={updateText}
            onChange={(e) => setUpdateText(e.target.value)}
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
              onClick={handleStatusUpdate}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update'}
            </button>
          </div>
          {message && <div className={`mt-2 text-center ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>{message}</div>}
        </div>

        <div className="w-full border-b border-gray-700 mb-6"></div>
        <div className="w-full">
<h2 className="text-[#FF9100] text-2xl font-bold mb-8 w-full text-left">Issue Updates</h2>          <div className="space-y-6 mb-12">
          {issue.updates?.slice(0).reverse().map((update, i) => (
            <div key={i} className="text-lg">
              <p className="mb-3">
                • Update {String(issue.updates.length - i).padStart(2, "0")}: {update.text}
              </p>
              <div
                className={`inline-block px-4 py-2 rounded-full text-black font-bold text-sm ${
                  update.status === "Pending Approval"
                    ? "bg-blue-200 text-blue-900"
                    : update.status === "Under Review"
                    ? "bg-yellow-100 text-yellow-900"
                    : update.status === "Resolved"
                    ? "bg-green-100 text-green-900"
                    : update.status === "Rejected"
                    ? "bg-red-100 text-red-900"
                    : "bg-white"
                }`}
              >
                • {update.status}
              </div>
              <div>{update.timestamp && (
          <span className="text-gray-400 text-xs italic mt-1">
            {new Date(update.timestamp).toLocaleString()}
          </span>
        )}</div>
            </div>
            
          ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(ClerkIssueDetailsPage, ["clerk"]);
