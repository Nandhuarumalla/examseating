// src/pages/admin/Teacher.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];

const Teacher = () => {
  // Upload state
  const [file, setFile] = useState(null);
  const [year, setYear] = useState("");
  const [branch, setBranch] = useState("");
  const [section, setSection] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  // Selector state
  const [selYear, setSelYear] = useState("");
  const [selBranch, setSelBranch] = useState("");
  const [selSection, setSelSection] = useState("");

  // Data
  const [allTeachers, setAllTeachers] = useState([]);
  const [displayData, setDisplayData] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/teachers");
      setAllTeachers(res.data || []);
    } catch (err) {
      setMessage("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  // Upload handler
  const handleUpload = async () => {
    if (!file || !year || !branch || !section) {
      setUploadMessage("All fields required");
      return;
    }
    const formData = new FormData();
    formData.append("csvFile", file);
    formData.append("year", year.trim());
    formData.append("branch", branch.trim().toUpperCase());
    formData.append("section", section.trim().toUpperCase());

    setUploading(true);
    setUploadMessage("Uploading...");
    try {
      const res = await axios.post(
        "http://localhost:5000/api/teachers/upload",
        formData
      );
      setUploadMessage("SUCCESS: " + res.data.message);
      fetchTeachers();
      setFile(null);
      setYear("");
      setBranch("");
      setSection("");
      document.getElementById("csvFile").value = "";
    } catch (err) {
      setUploadMessage(
        "ERROR: " + (err.response?.data?.message || "Upload failed")
      );
    } finally {
      setUploading(false);
    }
  };

  // Load teacher busy slots
  const loadData = () => {
    if (!selYear || !selBranch || !selSection) {
      setMessage("Please fill Year, Branch, Section");
      setDisplayData(null);
      return;
    }

    setMessage("");
    setDisplayData(null);

    const filteredPeriods = [];

    allTeachers.forEach((teacher) => {
      teacher.busyPeriods?.forEach((p) => {
        const yearMatch = String(p.year || "").trim() === String(selYear || "").trim();
        const branchMatch = String(p.branch || "").trim().toUpperCase() === String(selBranch || "").trim().toUpperCase();
        const sectionMatch = String(p.section || "").trim().toUpperCase() === String(selSection || "").trim().toUpperCase();

        if (yearMatch && branchMatch && sectionMatch) {
          filteredPeriods.push({
            teacherName: teacher.teacherName,
            subject: p.subject,
            day: p.day,
            startTime: p.startTime,
            endTime: p.endTime,
          });
        }
      });
    });

    if (filteredPeriods.length === 0) {
      console.log("Debug: No matching periods found", selYear, selBranch, selSection, allTeachers);
      setMessage(`No data found for ${selYear} ${selBranch}-${selSection}`);
    } else {
      setDisplayData(filteredPeriods);
    }
  };

  // Faculty busy slots view
  const renderFacultyView = () => {
    if (!displayData || displayData.length === 0) return null;

    const teachersMap = {};
    displayData.forEach((p) => {
      if (!teachersMap[p.teacherName]) {
        teachersMap[p.teacherName] = {};
        DAYS.forEach((d) => (teachersMap[p.teacherName][d] = []));
      }
      teachersMap[p.teacherName][p.day].push({
        startTime: p.startTime,
        endTime: p.endTime,
        subject: p.subject,
      });
    });

    return Object.entries(teachersMap).map(([name, dayMap]) => (
      <div key={name} className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h3 className="text-2xl font-bold text-indigo-700 mb-6">{name}</h3>
        {DAYS.map((day) => {
          const slots = dayMap[day] || [];
          slots.sort((a, b) => a.startTime.localeCompare(b.startTime));

          return (
            <div key={day} className="mb-4">
              <span className="font-bold text-lg">{day}:</span>
              <div className="flex flex-wrap gap-3 mt-2">
                {slots.length > 0 ? (
                  slots.map((slot, i) => (
                    <span
                      key={i}
                      className="bg-purple-100 text-purple-900 px-4 py-2 rounded-lg font-medium"
                    >
                      {slot.startTime}-{slot.endTime} → {slot.subject}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 ml-2">Free</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Upload Card */}
      <div className="max-w-6xl mx-auto py-10 px-6">
        <div className="bg-white rounded-xl shadow p-8 mb-10">
          <h2 className="text-2xl font-bold text-center mb-6">Upload Teacher Timetable</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <input
              placeholder="Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="border px-4 py-2 rounded"
            />
            <input
              placeholder="Branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="border px-4 py-2 rounded uppercase"
            />
            <input
              placeholder="Section"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="border px-4 py-2 rounded uppercase"
            />
            <input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files[0])}
              className="border px-4 py-2 rounded"
            />
          </div>
          <div className="text-center">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-green-600 hover:bg-green-700 text-white px-10 py-3 rounded font-bold"
            >
              {uploading ? "Uploading..." : "Upload & Save"}
            </button>
          </div>
          {uploadMessage && (
            <p
              className={`text-center mt-4 text-lg ${
                uploadMessage.includes("SUCCESS") ? "text-green-600" : "text-red-600"
              }`}
            >
              {uploadMessage}
            </p>
          )}
        </div>

        {/* Selector */}
        <div className="bg-white rounded-xl shadow p-8 mb-8">
          <h2 className="text-2xl font-bold text-center mb-6">Select Section to View</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            <input
              placeholder="Year (e.g. 4)"
              value={selYear}
              onChange={(e) => setSelYear(e.target.value)}
              className="border px-5 py-3 rounded-lg text-center"
            />
            <input
              placeholder="Branch (e.g. CSE)"
              value={selBranch}
              onChange={(e) => setSelBranch(e.target.value)}
              className="border px-5 py-3 rounded-lg text-center uppercase"
            />
            <input
              placeholder="Section (e.g. A)"
              value={selSection}
              onChange={(e) => setSelSection(e.target.value)}
              className="border px-5 py-3 rounded-lg text-center uppercase"
            />
          </div>
          <div className="text-center">
            <button
              onClick={loadData}
              className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-4 rounded-lg font-bold text-xl"
            >
              Load Busy Slots
            </button>
          </div>
        </div>

        {/* Display */}
        {loading && <p className="text-center text-lg text-gray-600">Loading teachers...</p>}
        {message && <p className="text-center text-xl text-red-600">{message}</p>}
        {displayData && renderFacultyView()}
      </div>
    </div>
  );
};

export default Teacher;
