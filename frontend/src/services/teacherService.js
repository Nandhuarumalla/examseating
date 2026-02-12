import axios from "axios";

const API = (process.env.REACT_APP_API_URL || "") + "/api/teachers";

export const uploadTimetableCSV = (formData) =>
  axios.post(`${API}/upload-timetable`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

export const fetchTeacherDocs = () => axios.get(API);
export const fetchCombined = () => axios.get(`${API}/combined`);
