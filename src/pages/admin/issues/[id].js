import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
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

// Ontario Government Ministries and their responsibilities
const ONTARIO_MINISTRIES = {
  'Garbage': {
    name: 'Ministry of the Environment, Conservation and Parks',
    description: 'Responsible for waste management, recycling programs, and environmental protection',
    contact: '1-800-565-4923',
    website: 'https://www.ontario.ca/page/ministry-environment-conservation-parks'
  },
  'Pothole': {
    name: 'Ministry of Transportation',
    description: 'Responsible for road maintenance, highway infrastructure, and transportation safety',
    contact: '1-800-268-4686',
    website: 'https://www.ontario.ca/page/ministry-transportation'
  },
  'Streetlight': {
    name: 'Ministry of Energy',
    description: 'Responsible for public lighting infrastructure, energy efficiency, and electrical safety',
    contact: '1-800-565-4923',
    website: 'https://www.ontario.ca/page/ministry-energy'
  },
  'Illegal Dumping': {
    name: 'Ministry of the Environment, Conservation and Parks',
    description: 'Responsible for environmental protection, waste management enforcement, and pollution control',
    contact: '1-800-565-4923',
    website: 'https://www.ontario.ca/page/ministry-environment-conservation-parks'
  },
  'Water Issues': {
    name: 'Ministry of the Environment, Conservation and Parks',
    description: 'Responsible for water quality, drinking water safety, and water infrastructure',
    contact: '1-800-565-4923',
    website: 'https://www.ontario.ca/page/ministry-environment-conservation-parks'
  },
  'Parks and Recreation': {
    name: 'Ministry of Heritage, Sport, Tourism and Culture Industries',
    description: 'Responsible for parks, recreational facilities, and cultural heritage sites',
    contact: '1-800-565-4923',
    website: 'https://www.ontario.ca/page/ministry-heritage-sport-tourism-culture-industries'
  },
  'Public Safety': {
    name: 'Ministry of the Solicitor General',
    description: 'Responsible for public safety, emergency services, and law enforcement coordination',
    contact: '1-800-565-4923',
    website: 'https://www.ontario.ca/page/ministry-solicitor-general'
  }
};

export default function AdminIssueDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [issue, setIssue] = useState(null);
  const [clerks, setClerks] = useState([]);
  const [selectedClerk, setSelectedClerk] = useState('');
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

  const handleAssignClerk = async () => {
    if (!selectedClerk) {
      setMessage('Please select a clerk to assign');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/issues/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ issueId: issue._id, clerkId: selectedClerk }),
      });
      
      if (res.ok) {
        setMessage('Clerk assigned successfully!');
        await fetchIssueDetails();
      } else {
        const data = await res.json();
        setMessage(data.message || 'Failed to assign clerk');
      }
    } catch (e) {
      setMessage('Error assigning clerk.');
    } finally {
      setLoading(false);
    }
  };

  const getMinistryInfo = (category) => {
    return ONTARIO_MINISTRIES[category] || {
      name: 'Ministry of Municipal Affairs and Housing',
      description: 'Responsible for municipal governance, local government support, and community development',
      contact: '1-800-565-4923',
      website: 'https://www.ontario.ca/page/ministry-municipal-affairs-housing'
    };
  };

  if (!issue) {
    return <div className="p-10 text-red-500">Issue not found or loading...</div>;
  }

  const ministryInfo = getMinistryInfo(issue.category);

  return (
    <div className="min-h-screen flex bg-[#f8f7f3]">
      <div className="flex-1 p-8 pr-0 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-orange-500">Issue Details (Admin)</h1>
          <div className="flex items-center gap-4 text-black relative">
            <NotificationBell />
            <SettingsMenu />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-8">
          {/* Issue Information */}
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
                <p>ID: {issue._id.slice(-8)}</p>
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

          {/* Ministry Information */}
          <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Responsible Ministry</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">{ministryInfo.name}</h3>
              <p className="text-blue-800 mb-3">{ministryInfo.description}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div>
                  <span className="font-semibold text-blue-900">Contact:</span>
                  <a href={`tel:${ministryInfo.contact}`} className="text-blue-600 hover:text-blue-800 ml-2">
                    {ministryInfo.contact}
                  </a>
                </div>
                <div>
                  <span className="font-semibold text-blue-900">Website:</span>
                  <a href={ministryInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 ml-2">
                    Visit Ministry
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Assignment Panel */}
      <div className="w-1/3 bg-black text-white flex flex-col items-center p-12">
        <h2 className="text-[#FF9100] text-2xl font-bold mb-8 w-full text-left">Assign to Clerk</h2>
        
        <div className="w-full mb-8">
          <div className="mb-6">
            <label className="block text-lg mb-2 text-white">Current Assignment</label>
            <div className="bg-gray-800 rounded-lg p-3">
              {issue.assignedClerk ? (
                <div>
                  <p className="font-semibold text-white">{issue.assignedClerk.name}</p>
                  <p className="text-gray-400 text-sm">{issue.assignedClerk.email}</p>
                </div>
              ) : (
                <p className="text-gray-400">No clerk assigned</p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-lg mb-2 text-white">Assign New Clerk</label>
            <select
              className="w-full mb-4 bg-black border border-gray-600 rounded-md py-2 px-3 text-white"
              value={selectedClerk}
              onChange={e => setSelectedClerk(e.target.value)}
            >
              <option value="">Select a clerk...</option>
              {clerks.map(c => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              className="flex-1 py-3 rounded-full border-2 border-[#FF9100] text-[#FF9100] text-xl font-bold hover:bg-[#ff91001a] transition"
              onClick={() => setSelectedClerk('')}
              disabled={loading}
            >
              Clear
            </button>
            <button
              className="flex-1 py-3 rounded-full bg-[#FF9100] text-white text-lg font-semibold hover:bg-orange-600 transition"
              onClick={handleAssignClerk}
              disabled={loading || !selectedClerk}
            >
              {loading ? 'Assigning...' : 'Assign Clerk'}
            </button>
          </div>
          
          {message && (
            <div className={`mt-4 text-center p-3  ${
              message.includes('success') 
                ? ' text-green-300' 
                : ' text-red-300'
            }`}>
              {message}
            </div>
          )}
        </div>

        <div className="w-full border-b border-gray-700 mb-6"></div>
        
        {/* Issue Updates */}
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
