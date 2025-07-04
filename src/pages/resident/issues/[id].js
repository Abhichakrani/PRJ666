import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import withAuth from "@/utils/withAuth";
import MapDisplay from "@/components/MapDisplay";

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
    <div className="flex min-h-screen">
      {/* Left Side - Issue Details */}
      <div className="w-2/3 p-8 bg-[#fdfaf5]">
        <div className="flex justify-between items-start mb-6 relative">
          <h1 className="text-4xl font-bold text-orange-500">Issue Details (User)</h1>
          <div className="flex items-center gap-4 text-black relative">
            {/* Notifications */}
            <div ref={notificationsRef} className="relative">
              <span
                className="text-2xl cursor-pointer"
                onClick={() => setShowNotifications((prev) => !prev)}
              >
                🔔
              </span>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-56 bg-white text-black border rounded shadow-md z-20">
                  <div className="p-4 text-sm text-gray-700">No new notifications</div>
                </div>
              )}
            </div>

            {/* Settings */}
            <div ref={settingsRef} className="relative">
              <span
                className="text-2xl cursor-pointer"
                onClick={() => setShowSettings((prev) => !prev)}
              >
                ⚙️
              </span>
              {showSettings && (
                <div className="absolute right-0 mt-2 w-40 bg-white text-black border rounded shadow-md z-20">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-black mb-4">{issue.title}</h2>

        {/* Filed Date */}
        <p className="text-lg text-gray-600 mb-6">
          Filed On: {new Date(issue.createdAt).toLocaleDateString()}
        </p>

        {/* Category */}
        <div className="mb-8">
          <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg border">
            <span className="text-lg text-gray-700">{issue.category}</span>
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Description */}
        <p className="text-lg text-gray-700 leading-relaxed mb-8">
          {issue.description}
        </p>

        {/* Location Section */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-black mb-4">Location</h3>
          <MapDisplay
            lat={issue.latitude}
            lng={issue.longitude}
            interactive={false}
          />
        </div>

        {/* Download Files */}
        {issue.images?.length > 0 && (
          <a
            href={issue.images[0]}
            className="block text-center border-2 border-black py-4 w-full rounded-full font-bold text-lg hover:bg-gray-100 transition-colors"
            download
          >
            ↓ Download Issue Files
          </a>
        )}
      </div>

      {/* Right Panel - Updates & Feedback */}
      <div className="w-1/3 bg-black text-white p-8">
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
                    ? "bg-blue-300"
                    : update.status === "Under Review"
                    ? "bg-yellow-300"
                    : update.status === "Resolved"
                    ? "bg-green-300"
                    : update.status === "Rejected"
                    ? "bg-red-300"
                    : "bg-white"
                }`}
              >
                • {update.status}
              </div>
            </div>
          ))}
        </div>

        {/* Feedback Section */}
        <div className="border-gray-600 pt-8">
          <textarea
            placeholder="Feedback"
            className="w-full bg-transparent border-b border-white-400 focus:outline-none focus:border-white py-2 placeholder-gray-300"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
          />

          <div className="flex items-center justify-between mb-6">
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
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-full text-lg transition-colors"
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
