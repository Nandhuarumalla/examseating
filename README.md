# examseating
🪑 Exam Seating Arrangement System

A full-stack exam seating arrangement system that helps educational institutions automate the creation and management of exam seat plans — sorting students into classrooms and seats efficiently based on registration and exam data.

📌 Table of Contents

🔍 About the Project

🛠️ Features

📁 Project Structure

🚀 Technologies Used

🧱 Setup & Installation

🧠 How It Works

🧪 Usage Examples

🤝 Contributing

📝 License

📖 About the Project

Traditional manual creation of exam seating plans is time-consuming and error-prone — especially for large student groups. This project automates that process by providing:
```
✔ Student and exam data management
✔ Automated seat generation per exam hall
✔ A user-friendly frontend UI
✔ A backend API to power the logic
✔ Reports or assignments of students to seats
```
This improves accuracy, saves time, and removes human error from seating assignments.

✨ Features
```
📋 Add/Edit/View student records

🏫 Manage exam halls and capacities

🪑 Generate seating plans automatically

🚪 Assign students to specific seats in rooms

📦 Organized backend & frontend separation

🔐 Basic validation and status feedback
```
🗂️ Project Structure
```
examseating/
├── backend/                   # Backend API server
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── config/
│   └── server.js
├── frontend/                  # Frontend UI
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.js
│   └── package.json
├── .gitignore
├── package.json
└── README.md
```
💻 Technologies Used
```
Layer	Technologies
Backend	Node.js, Express.js,seating logic
Frontend	React.js
Database	MongoDB / MySQL (adjustable)
API	RESTful APIs
UI	HTML, CSS, JavaScript
State/HTTP	Axios or Fetch
```
You can adapt the database and API to fit your institution’s needs.

🧩 Setup & Installation
🧠 Backend

Open the backend/ folder

Install dependencies:

npm install


Create environment variables (e.g., .env):

PORT=5000



Start the backend server:

npm start

🌐 Frontend

Open the frontend/ folder

Install dependencies:

npm install


Start the frontend UI:

npm start


The frontend should now be live on http://localhost:3000
 (default).

Note: Make sure the backend server is running before using the UI.

⚙️ How It Works

Input Data

Student records

Exam hall capacities

Exam schedules

Process

Backend API performs seat allocation logic

Frontend calls API to generate seating plans

Output

Students aligned to rooms and specific seats

Status displayed in the frontend UI

🎓 Usage Examples
```
Operation	Description
Add Student	Add name, roll number, course, etc.
Add Exam Hall	Specify room number and total seats
Generate Seating	Run algorithm to assign students to seats
View Assignments	List all assigned seats by room
```
🤝 Contributing

Contributions are welcome! You can:
Improve UI/UX
Add analytics (like occupancy %)

Please submit an issue or pull request.

📄 License

This project is open-source and licensed under the MIT License.
