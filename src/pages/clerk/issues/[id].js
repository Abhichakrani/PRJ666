import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import withAuth from "@/utils/withAuth";
import MapDisplay from "@/components/MapDisplay";

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

    // Set up interval to fetch updates every 5 seconds
    const intervalId = setInterval(() => {
      fetchIssueDetails();
    }, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [id]);

  const fetchIssueDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`/api/issues/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (res.ok) {
        setIssue(data.issue);
        setNewStatus(data.issue.status);
      } else if (res.status === 401 || res.status === 403) {
        router.push("/login");
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching issue details:", err);
      setMessage("Failed to load issue");
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    // Clear any previous messages
    setMessage("");

    // Validate inputs
    if (!updateText.trim()) {
      setMessage("Please provide an update description");
      return;
    }

    if (!newStatus) {
      setMessage("Please select a status");
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
          updateText: updateText,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Fetch fresh data after update
        await fetchIssueDetails();
        setUpdateText("");
        setMessage("Issue updated successfully");
      } else {
        const data = await res.json();
        setMessage(data.message || "Failed to update issue");
      }
    } catch (error) {
      console.error("Error updating issue:", error);
      setMessage("Error updating issue. Please try again.");
    }
  };

  if (loading) return <p className="p-10">Loading...</p>;
  if (!issue) return <p className="p-10 text-red-500">Issue not found</p>;

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Issue Details */}
      <div className="w-2/3 p-8 bg-[#fdfaf5]">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-[#FF6B00] text-4xl font-bold">Issue Details (Clerk)</h1>
          <div className="flex items-center gap-4">
            <button>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-4xl font-bold mb-3 text-gray-900">{issue.title}</h2>
          <p className="text-xl text-gray-800">Filed on: {new Date(issue.createdAt).toLocaleDateString()}</p>
        </div>

        <div className="mb-10">
          <div className="flex items-center justify-between bg-white p-6 rounded-xl border-2 border-gray-200">
            <span className="text-2xl font-semibold text-gray-900">{issue.category}</span>
            <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="mb-10">
          <p className="text-xl text-gray-900 whitespace-pre-wrap leading-relaxed">{issue.description}</p>
        </div>

        <div className="mb-10">
          <h3 className="text-3xl font-bold mb-6 text-gray-900">Location</h3>
          <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
            <MapDisplay
              lat={issue.latitude}
              lng={issue.longitude}
              interactive={false}
            />
          </div>
          <p className="mt-4 text-xl text-gray-800">{issue.location}</p>
        </div>

        {issue.images?.length > 0 && (
          <button 
            className="w-full py-5 border-2 border-gray-900 rounded-full font-bold text-xl text-gray-900 hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 mt-8"
            onClick={() => window.open(issue.images[0], '_blank')}
          >
            <span className="text-2xl">↓</span>
            <span>Download Issue Files</span>
          </button>
        )}

        {/* Feedback Section */}
        {issue.feedbacks?.length > 0 && (
          <div className="mt-12">
            <h3 className="text-3xl font-bold mb-6 text-gray-900">Feedback by client</h3>
            {issue.feedbacks.map((feedback, index) => (
              <div key={index} className="bg-white p-8 rounded-xl border-2 border-gray-200 mb-6">
                <div className="flex items-center mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-3xl ${
                        feedback.rating >= star ? "text-yellow-400" : "text-gray-300"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                {feedback.comment && (
                  <p className="text-gray-700 mt-2">{feedback.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Panel - Update Issue */}
      <div className="w-1/3 bg-black text-white p-8">
        <h2 className="text-[#FF6B00] text-3xl font-bold mb-8">Update Issue</h2>

        <div className="mb-10">
          <label className="block text-2xl mb-4 text-white">Select Status</label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full bg-[#1f2937] text-white p-5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] text-xl"
          >
            <option value="Pending Approval">Pending Approval</option>
            <option value="Under Review">Under Review</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="mb-10">
          <label className="block text-2xl mb-4 text-white">Update Text</label>
          <textarea
            value={updateText}
            onChange={(e) => setUpdateText(e.target.value)}
            placeholder="Enter update details..."
            className="w-full bg-[#1f2937] text-white p-6 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] min-h-[180px] resize-none text-xl"
          />
        </div>

        <div className="space-y-6">
          <button
            onClick={handleUpdateStatus}
            className="w-full bg-[#FF6B00] text-white py-5 rounded-full font-bold text-xl hover:bg-[#FF8533] transition-colors"
          >
            Update
          </button>

          <button
            onClick={() => router.push('/clerk/dashboard')}
            className="w-full border-2 border-white text-white py-5 rounded-full font-bold text-xl hover:bg-white hover:text-black transition-colors"
          >
            Clear
          </button>
        </div>

        {message && (
          <p className={`mt-6 text-xl font-semibold ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </p>
        )}

        {/* Updates History */}
        <div className="mt-12">
          <h3 className="text-3xl font-bold mb-8 text-white">Updates</h3>
          <div className="space-y-8">
            {issue.updates?.slice(0).reverse().map((update, i) => (
              <div key={i} className="text-xl">
                <p className="mb-4 text-white">
                  • Update {String(issue.updates.length - i).padStart(2, "0")}: {update.text}
                </p>
                <div
                  className={`inline-block px-6 py-3 rounded-full text-black font-bold text-lg ${
                    update.status === "Pending Approval"
                      ? "bg-blue-300"
                      : update.status === "Under Review"
                      ? "bg-yellow-300"
                      : update.status === "Resolved"
                      ? "bg-green-300"
                      : "bg-red-300"
                  }`}
                >
                  • {update.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(ClerkIssueDetailsPage, ["clerk"]);
