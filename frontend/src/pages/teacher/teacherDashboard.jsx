import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [seatingData, setSeatingData] = useState(null);
  const [examDate, setExamDate] = useState("");
  const [searchTeacherName, setSearchTeacherName] = useState("");
  const [filteredRoom, setFilteredRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [allRooms, setAllRooms] = useState([]);

  // Fetch seating plan based on exam date
  const fetchSeatingPlan = async () => {
    if (!examDate) {
      setError("Please select an exam date");
      return;
    }

    setLoading(true);
    setError("");
    setFilteredRoom(null);

    try {
      // Convert from YYYY-MM-DD to DD-MM-YYYY format
      const [yyyy, mm, dd] = examDate.split("-");
      const formattedDate = `${dd}-${mm}-${yyyy}`;

      console.log("Input date:", examDate, "Formatted date:", formattedDate);

      // First, try to fetch existing seating plan from database
      let response;
      try {
        response = await axios.get(
          `http://localhost:5000/api/seating/by-date/${formattedDate}`
        );
        console.log("Fetched from database:", response.data);
      } catch (fetchError) {
        // If not found, generate a new one
        if (fetchError.response?.status === 404) {
          console.log("Seating plan not found, available dates:", fetchError.response?.data?.availableDates);
          console.log("Generating new one...");
          response = await axios.post(
            "http://localhost:5000/api/seating/generate",
            { examDate: formattedDate }
          );
        } else {
          throw fetchError;
        }
      }

      if (response.data.success || response.data.seatingPlan) {
        const seatingPlanData = response.data.seatingPlan;
        setSeatingData(seatingPlanData);
        setAllRooms(Object.entries(seatingPlanData));
        
        // Extract unique teachers from the seating plan
        const uniqueTeachers = new Set();
        Object.values(seatingPlanData).forEach((room) => {
          if (room.teachers.invigilator1 && room.teachers.invigilator1 !== "TBD") {
            uniqueTeachers.add(room.teachers.invigilator1);
          }
          if (room.teachers.invigilator2 && room.teachers.invigilator2 !== "TBD") {
            uniqueTeachers.add(room.teachers.invigilator2);
          }
        });
        setTeachers(Array.from(uniqueTeachers).sort());
      }
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to fetch seating plan");
      setSeatingData(null);
      setAllRooms([]);
    } finally {
      setLoading(false);
    }
  };

  // Search room by teacher name
  const searchByTeacher = () => {
    if (!searchTeacherName.trim()) {
      setError("Please enter a teacher name");
      setFilteredRoom(null);
      return;
    }

    if (!seatingData) {
      setError("Please generate seating plan first");
      return;
    }

    const matchedRoom = Object.entries(seatingData).find(([_, roomData]) => {
      const invigilator1 = roomData.teachers.invigilator1 || "";
      const invigilator2 = roomData.teachers.invigilator2 || "";
      return (
        invigilator1.toLowerCase().includes(searchTeacherName.toLowerCase()) ||
        invigilator2.toLowerCase().includes(searchTeacherName.toLowerCase())
      );
    });

    if (matchedRoom) {
      setFilteredRoom({
        roomNumber: matchedRoom[0],
        roomData: matchedRoom[1],
      });
      setError("");
    } else {
      setError(`No room found for teacher: ${searchTeacherName}`);
      setFilteredRoom(null);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchTeacherName("");
    setFilteredRoom(null);
    setError("");
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header with Navigation */}
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-5xl font-bold text-indigo-800">
            👨‍🏫 Teacher Invigilation Dashboard
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition shadow-lg"
            >
              ← Back
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition shadow-lg"
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Date Selector Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-12 mb-12 border-l-8 border-indigo-600">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div>
              <label className="block text-lg font-bold text-gray-700 mb-3">
                📅 Select Exam Date
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-6 py-4 text-lg border-3 border-indigo-300 rounded-xl focus:outline-none focus:border-indigo-600 transition"
              />
            </div>
            <button
              onClick={fetchSeatingPlan}
              disabled={loading}
              className="px-12 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-lg rounded-xl hover:shadow-xl transition disabled:opacity-50"
            >
              {loading ? "⏳ Loading..." : "🔍 Get Plan"}
            </button>
            <div>
              {seatingData && (
                <p className="text-green-600 font-bold text-lg">
                  ✓ Plan loaded for {examDate}
                </p>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && seatingData === null && (
            <div className="mt-6 p-4 bg-red-100 border-l-4 border-red-600 text-red-700 rounded-lg">
              ❌ {error}
            </div>
          )}
        </div>

        {/* Search by Teacher Name */}
        {seatingData && (
          <div className="bg-white rounded-3xl shadow-2xl p-12 mb-12 border-l-8 border-green-600">
            <h2 className="text-3xl font-bold text-indigo-800 mb-8">
              🔎 Search Room by Teacher Name
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div className="md:col-span-2">
                <label className="block text-lg font-bold text-gray-700 mb-3">
                  Teacher Name
                </label>
                <input
                  type="text"
                  placeholder="Enter teacher name..."
                  value={searchTeacherName}
                  onChange={(e) => setSearchTeacherName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") searchByTeacher();
                  }}
                  className="w-full px-6 py-4 text-lg border-3 border-indigo-300 rounded-xl focus:outline-none focus:border-indigo-600 transition"
                />
              </div>
              <button
                onClick={searchByTeacher}
                className="px-10 py-4 bg-green-600 text-white font-bold text-lg rounded-xl hover:shadow-xl transition"
              >
                Search
              </button>
              {filteredRoom && (
                <button
                  onClick={clearSearch}
                  className="px-10 py-4 bg-gray-600 text-white font-bold text-lg rounded-xl hover:shadow-xl transition"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Teacher Suggestions */}
            {teachers.length > 0 && !filteredRoom && (
              <div className="mt-6">
                <p className="text-gray-600 font-semibold mb-3">Available Teachers:</p>
                <div className="flex flex-wrap gap-2">
                  {teachers.map((teacher, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSearchTeacherName(teacher);
                      }}
                      className="px-4 py-2 bg-indigo-100 border-2 border-indigo-400 text-indigo-700 rounded-lg font-semibold hover:bg-indigo-200 transition"
                    >
                      {teacher}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && filteredRoom === null && (
              <div className="mt-6 p-4 bg-red-100 border-l-4 border-red-600 text-red-700 rounded">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Room Details - Filtered View */}
        {filteredRoom && (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-12">
            <div className="bg-gradient-to-r from-green-700 to-emerald-800 text-white p-10 text-center">
              <h3 className="text-4xl font-bold mb-6">{filteredRoom.roomData.roomInfo}</h3>
              <div className="grid grid-cols-2 gap-8">
                <div className="bg-black bg-opacity-20 p-6 rounded-xl">
                  <p className="text-green-200 font-bold text-lg mb-2">Invigilator 1</p>
                  <p className="text-3xl font-bold">{filteredRoom.roomData.teachers.invigilator1}</p>
                </div>
                <div className="bg-black bg-opacity-20 p-6 rounded-xl">
                  <p className="text-green-200 font-bold text-lg mb-2">Invigilator 2</p>
                  <p className="text-3xl font-bold">{filteredRoom.roomData.teachers.invigilator2}</p>
                </div>
              </div>
            </div>

            <div className="p-12 overflow-x-auto">
              <h4 className="text-2xl font-bold text-gray-800 mb-6">Seating Arrangement</h4>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="bg-indigo-200 border-4 border-indigo-400 px-6 py-4 text-lg font-bold">
                      Row
                    </th>
                    {filteredRoom.roomData.rawTable[0].map((_, i) => (
                      <th
                        key={i}
                        className="bg-indigo-100 border-4 border-indigo-300 px-6 py-4 text-lg font-bold"
                      >
                        Col {i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRoom.roomData.rawTable.map((row, rIdx) => (
                    <tr key={rIdx}>
                      <td className="bg-indigo-50 border-4 border-indigo-300 px-6 py-4 font-bold text-center">
                        {rIdx + 1}
                      </td>
                      {row.map((seat, sIdx) => (
                        <td
                          key={sIdx}
                          className="border-4 border-gray-300 px-6 py-4 text-center bg-white hover:bg-blue-50 transition"
                        >
                          {seat ? (
                            <div className="font-bold text-sm">
                              <div className="text-indigo-700">{seat.rollNo}</div>
                              <div className="text-gray-600 text-xs">({seat.branch})</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* All Rooms View */}
        {seatingData && !filteredRoom && (
          <div className="space-y-12">
            <h2 className="text-3xl font-bold text-indigo-800">All Rooms for {examDate}</h2>
            {allRooms.map(([roomNumber, roomData]) => (
              <div
                key={roomNumber}
                className="bg-white rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition"
              >
                <div className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white p-10 text-center">
                  <h3 className="text-4xl font-bold mb-6">{roomData.roomInfo}</h3>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="bg-black bg-opacity-20 p-6 rounded-xl">
                      <p className="text-yellow-300 font-bold text-lg mb-2">Invigilator 1</p>
                      <p className="text-2xl font-bold">{roomData.teachers.invigilator1}</p>
                    </div>
                    <div className="bg-black bg-opacity-20 p-6 rounded-xl">
                      <p className="text-yellow-300 font-bold text-lg mb-2">Invigilator 2</p>
                      <p className="text-2xl font-bold">{roomData.teachers.invigilator2}</p>
                    </div>
                  </div>
                </div>

                <div className="p-10 overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr>
                        <th className="bg-indigo-200 border-4 border-indigo-400 px-4 py-3 font-bold">
                          Row
                        </th>
                        {roomData.rawTable[0].map((_, i) => (
                          <th
                            key={i}
                            className="bg-indigo-100 border-4 border-indigo-300 px-4 py-3 font-bold"
                          >
                            C{i + 1}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {roomData.rawTable.map((row, rIdx) => (
                        <tr key={rIdx}>
                          <td className="bg-indigo-50 border-4 border-indigo-300 px-4 py-3 font-bold text-center">
                            R{rIdx + 1}
                          </td>
                          {row.map((seat, sIdx) => (
                            <td
                              key={sIdx}
                              className="border-4 border-gray-300 px-4 py-3 text-center text-xs bg-white hover:bg-blue-50 transition"
                            >
                              {seat ? (
                                <div>
                                  <div className="font-bold text-blue-700">{seat.rollNo}</div>
                                  <div className="text-gray-600">{seat.branch}</div>
                                </div>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
