import useSWR from 'swr';

const ClerkDashboard = () => {
  const { data: issues, mutate } = useSWR('/api/issues/clerk');
  
  const handleAcknowledge = async (issueId) => {
    try {
      await fetch('/api/issues/clerk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          issueId, 
          clerkId: currentUser.id 
        })
      });
      mutate(); // Refresh the list
    } catch (error) {
      console.error("Failed to acknowledge:", error);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Assigned Issues</h1>
      {issues?.map(issue => (
        <div key={issue._id} className="p-4 border rounded-lg">
          <div className="flex justify-between">
            <div>
              <h3 className="font-semibold">{issue.category}</h3>
              <p>{issue.location}</p>
              <p className="text-sm text-gray-500">
                {new Date(issue.createdAt).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => handleAcknowledge(issue._id)}
              disabled={issue.status !== 'Pending'}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              {issue.status === 'Acknowledged' ? 'Acknowledged' : 'Acknowledge'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};