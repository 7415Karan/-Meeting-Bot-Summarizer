import { useEffect, useState } from "react";
import { getMeetings, deleteMeeting } from "../api/meetingApi";
import { useNavigate } from "react-router";

export default function History() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      const data = await getMeetings();
      setMeetings(data);
    } catch (error) {
      console.error("Failed to load meetings", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this meeting?")) return;
    try {
      await deleteMeeting(id);
      // Update UI immediately by filtering out the deleted item
      setMeetings((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      console.error("Failed to delete", error);
      alert("Failed to delete meeting");
    }
  };

  const handleView = (meeting: any) => {
    try {
      // Backend stores JSON as string, so we parse it before sending to Result page
      let result = meeting.ai_output;
      if (typeof result === "string") {
        result = JSON.parse(result);
      }
      localStorage.setItem("meetingResult", JSON.stringify(result));
      navigate("/result");
    } catch (e) {
      console.error("Error parsing meeting data", e);
      alert("Could not load meeting details.");
    }
  };

  const filteredMeetings = meetings.filter((meeting) => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType ? meeting.meeting_type === filterType : true;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-3xl font-bold text-gray-900">Meeting History</h2>
          <button
            onClick={() => navigate("/")}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition shadow-sm"
          >
            + Create New
          </button>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="sr-only">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <label htmlFor="type" className="sr-only">Filter by Type</label>
            <select
              id="type"
              name="type"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Team Meeting">Team Meeting</option>
              <option value="Interview">Interview</option>
              <option value="Client Call">Client Call</option>
              <option value="Standup">Standup</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading history...</p>
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">No meetings found.</p>
            {meetings.length === 0 && (
              <button
                onClick={() => navigate("/")}
                className="mt-4 text-indigo-600 hover:underline"
              >
                Get started by creating one
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredMeetings.map((m) => (
              <div
                key={m.id}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className="w-full sm:flex-1 sm:min-w-0">
                  <h3 className="text-xl font-semibold text-gray-800 truncate">
                    {m.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {m.meeting_type}
                    </span>
                    <span className="text-gray-400 text-sm">
                      ID: #{m.id}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 w-sm sm:w-auto">
                  <button
                    onClick={() => handleView(m)}
                    className="flex-1 sm:flex-none text-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
                  >
                    View Report
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="flex-1 sm:flex-none text-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
