import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import withAuth from "@/utils/withAuth";
import MapDisplay from "@/components/MapDisplay";
import NotificationBell from "@/components/shared/NotificationBell";
import SettingsMenu from "@/components/shared/SettingsMenu";
function IssueDetailsPage() {
  const { query } = useRouter();
  const { id } = query;

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(0);
  const [message, setMessage] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const settingsRef = useRef(null);
  const notificationsRef = useRef(null);

  useEffect(() => {
    if (!id) return;
    const fetchIssue = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/issues/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setIssue(data.issue);
        setLoading(false);
      } catch (err) {
        setMessage("Failed to load issue");
        setLoading(false);
      }
    };
    fetchIssue();
  }, [id]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleRating = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/issues/${id}/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rating: feedback, comment: feedbackText }),
    });
    const data = await res.json();
    setMessage(data.message);
  };

  const handleWithdraw = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/issues/${id}/withdraw`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setMessage(data.message);
    setTimeout(() => {
      window.location.href = "/resident/dashboard";
    }, 2000);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!settingsRef.current?.contains(e.target)) setShowSettings(false);
      if (!notificationsRef.current?.contains(e.target)) setShowNotifications(false);
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) return <p className="p-10">Loading...</p>;
  if (!issue) return <p className="p-10 text-red-500">Issue not found</p>;

  return (
    <div className="min-h-screen flex bg-[#f8f7f3]">
  <div className="flex-1 p-8 pr-0 flex flex-col">
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-4xl font-bold text-orange-500">Issue Details (User)</h1>
      <div className="flex items-center gap-4 text-black relative">
        <NotificationBell />
        <SettingsMenu />
      </div>
    </div>

    <div className="flex-1 overflow-y-auto pr-8">
      <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{issue.title}</h2>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full font-semibold">
                {issue.category}
              </span>
              <span className="px-3 py-1 rounded-full font-semibold bg-gray-200 text-gray-800">
                Filed
              </span>
            </div>
          </div>
          <div className="text-right text-gray-600">
            <p>Filed: {new Date(issue.createdAt).toLocaleDateString()}</p>
            <p>ID: {issue._id?.slice(-8) || 'N/A'}</p>
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
              onClick={() => window.open(issue.images[0], "_blank")}
              className="w-full border border-gray-400 rounded-full py-2 flex items-center justify-center gap-2 text-lg font-semibold hover:bg-gray-100 transition"
            >
              <span>📎</span> Download Issue Files ({issue.images.length} file{issue.images.length > 1 ? "s" : ""})
            </button>
          </div>
        )}
      </div>
    </div>
</div>

      {/* Right Panel - Updates & Feedback */}
      <div className="w-1/3 bg-black text-white flex flex-col items-center p-12">
        <h2 className="text-4xl font-bold text-orange-400 mb-8">Updates</h2>

        <div className="space-y-6 mb-12">
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

        {/* Feedback Section */}
        {/* Feedback Section */}
<div className="w-full mt-4">
  <h2 className="text-2xl font-bold text-orange-400 mb-4">Leave Feedback</h2>

  <textarea
    placeholder="Write your feedback..."
    className="w-full bg-black border border-gray-600 rounded-md p-4 text-white placeholder-gray-400 mb-4 focus:outline-none focus:border-white"
    value={feedbackText}
    onChange={(e) => setFeedbackText(e.target.value)}
  />

  <div className="flex items-center justify-between mb-6 w-full">
    <div className="flex space-x-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => setFeedback(star)}
          className="text-4xl focus:outline-none transition-all duration-200"
        >
          <span
            className={`${
              feedback >= star ? "text-yellow-400" : "text-transparent"
            }`}
            style={{
              WebkitTextStroke: feedback >= star ? "0" : "2px white",
              textStroke: feedback >= star ? "0" : "2px white",
            }}
          >
            ★
          </span>
        </button>
      ))}
    </div>
    <button
      onClick={handleRating}
      className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-full text-lg transition-colors"
    >
      Submit
    </button>
  </div>

  <button
    onClick={handleWithdraw}
    className="w-full border-2 border-red-400 text-red-400 font-bold py-4 rounded-full hover:bg-red-400 hover:text-white text-lg transition-all duration-200 mb-6"
  >
    Withdraw
  </button>

  {message && (
    <p className="text-green-400 text-lg font-medium">{message}</p>
  )}
</div>

      </div>
    </div>
    
  );
}

export default withAuth(IssueDetailsPage, ["resident"]);
