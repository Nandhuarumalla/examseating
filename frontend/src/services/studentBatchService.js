import axios from "axios";

const API = "http://localhost:5000/api/student-batches";

export const getBatches = () => axios.get(API);

export const addBatch = (data) => axios.post(`${API}/add`, data);  // FIXED

export const updateBatch = (id, data) =>
  axios.put(`${API}/${id}`, data);

export const deleteBatch = (id) =>
  axios.delete(`${API}/${id}`);

