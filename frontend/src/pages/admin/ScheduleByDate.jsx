import { useState, useEffect } from "react";
import axios from "axios";

function ScheduleByDate() {
  const [dates, setDates] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [activeDate, setActiveDate] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/api/exams/dates").then((res) => {
      setDates(res.data);
    });
  }, []);

  const loadSchedule = async (date) => {
    setActiveDate(date);
    const res = await axios.get(`http://localhost:5000/api/exams/schedule/${date}`);
    setSchedule(res.data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 p-8">

      {/* Title */}
      <h2 className="text-4xl font-extrabold text-blue-700 text-center mb-10">
        📅 Exam Schedule (Tabular View)
      </h2>

      {/* Date Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {dates.map((date, i) => (
          <button
            key={i}
            onClick={() => loadSchedule(date)}
            className={`px-5 py-2.5 rounded-xl text-lg font-semibold shadow-md transition-all duration-300
              ${
                activeDate === date
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white scale-110 shadow-xl"
                  : "bg-white/70 hover:bg-white/90 border border-blue-300 hover:scale-105"
              }`}
          >
            {date}
          </button>
        ))}
      </div>

      {/* TABLE BOX GRID */}
      <div className="max-w-4xl mx-auto bg-white/80 rounded-2xl shadow-2xl p-6">
        <h3 className="text-2xl font-bold text-gray-700 mb-5">
          {activeDate ? `Schedule for ${activeDate}` : "Select a date to view schedule"}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full border border-gray-700 border-collapse">

            {/* Header */}
            <thead>
              <tr className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <th className="border border-gray-700 p-4 text-left">Branch</th>
                <th className="border border-gray-700 p-4 text-left">Subject</th>
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {schedule.length === 0 ? (
                <tr>
                  <td
                    colSpan="2"
                    className="text-center p-6 text-gray-500 italic border border-gray-700"
                  >
                    No schedule loaded.
                  </td>
                </tr>
              ) : (
                schedule.map((item, i) => (
                  <tr key={i} className="hover:bg-blue-50 transition-all duration-200">
                    <td className="border border-gray-700 p-4 font-medium text-gray-700">
                      {item.branch}
                    </td>
                    <td className="border border-gray-700 p-4 text-gray-600">
                      {item.subject}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>

      </div>
    </div>
  );
}

export default ScheduleByDate;
