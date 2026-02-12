import React, { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const SeatingPlan = () => {
  const [date, setDate] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!date) return alert("Please select exam date");

    const [year, month, day] = date.split("-");
    const formattedDate = `${day}-${month}-${year}`;

    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/seating/generate",
        { examDate: formattedDate }
      );
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "❌ No data found for selected exam date");
    } finally {
      setLoading(false);
    }
  };

  // ===== PDF EXPORT FUNCTION =====
  const exportPDF = () => {
    try {
      if (!result?.seatingPlan) {
        alert("No seating plan to export");
        return;
      }

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const [year, month, day] = date.split("-");
      const formattedDate = `${day}-${month}-${year}`;

      doc.setFontSize(18);
      doc.setFont(undefined, "bold");
      doc.text(`Seating Plan - ${formattedDate}`, doc.internal.pageSize.getWidth() / 2, 20, {
        align: "center",
      });

      let yOffset = 35;
      let pageCount = 1;

      Object.entries(result.seatingPlan).forEach(([roomNumber, data]) => {
        // Check if we need a new page
        if (yOffset > 220) {
          doc.addPage();
          yOffset = 20;
          pageCount++;
        }

        // Room title
        doc.setFontSize(14);
        doc.setFont(undefined, "bold");
        doc.text(`${data.roomInfo}`, 14, yOffset);

        // Invigilators
        yOffset += 8;
        doc.setFontSize(11);
        doc.setFont(undefined, "normal");
        doc.text(`Invigilator 1: ${data.teachers.invigilator1}`, 14, yOffset);
        doc.text(`Invigilator 2: ${data.teachers.invigilator2}`, 120, yOffset);

        // Create table data
        yOffset += 10;
        const tableData = [];
        data.rawTable.forEach((row, rIdx) => {
          const rowData = row.map(seat =>
            seat ? `${seat.rollNo}\n(${seat.branch})` : "—"
          );
          tableData.push([`R${rIdx + 1}`, ...rowData]);
        });

        // Add table
        autoTable(doc, {
  startY: yOffset,
  head: [["Row", ...data.rawTable[0].map((_, i) => `C${i + 1}`)]],
  body: tableData,
  theme: "grid",
  styles: {
    fontSize: 8,
    cellPadding: 2,
    overflow: "linebreak",
    halign: "center",
    valign: "middle",
  },
  headStyles: {
    fillColor: [79, 70, 229],
    textColor: 255,
    fontStyle: "bold",
  },
  alternateRowStyles: {
    fillColor: [245, 245, 245],
  },
});


        yOffset = doc.lastAutoTable.finalY + 20;
      });

      const fileName = `SeatingPlan_${formattedDate}.pdf`;
      doc.save(fileName);
      alert(`✅ PDF exported as ${fileName}`);
    } catch (err) {
      console.error("Export error:", err);
      alert(`❌ Error exporting PDF: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-5xl font-bold text-center text-indigo-800 mb-12">
          AI Seating Plan & Invigilation Duty
        </h1>

        {/* Date Picker Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center mb-16">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-10 py-5 text-xl border-4 border-indigo-300 rounded-2xl mb-8"
          />
          <br />
          <button
            onClick={generate}
            disabled={loading}
            className="px-20 py-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-2xl font-bold rounded-2xl hover:shadow-2xl transition mr-6"
          >
            {loading ? "Generating..." : "Generate Plan"}
          </button>

          {result && result.seatingPlan && (
            <button
              onClick={exportPDF}
              className="px-16 py-6 bg-green-600 hover:bg-green-700 text-white text-2xl font-bold rounded-2xl hover:shadow-2xl transition"
            >
              📥 Export PDF
            </button>
          )}
        </div>

        {/* Seating Plan Output */}
        {result && result.success && (
          <div className="space-y-20">
            {Object.entries(result.seatingPlan).map(([roomNumber, data]) => (
              <div
                key={roomNumber}
                className="bg-white rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white p-10 text-center">
                  <h3 className="text-4xl font-bold mb-4">{data.roomInfo}</h3>
                  <div className="grid grid-cols-2 gap-8 text-2xl">
                    <div>
                      <p className="text-yellow-300 font-bold">Invigilator 1</p>
                      <p className="text-3xl font-bold">{data.teachers.invigilator1}</p>
                    </div>
                    <div>
                      <p className="text-yellow-300 font-bold">Invigilator 2</p>
                      <p className="text-3xl font-bold">{data.teachers.invigilator2}</p>
                    </div>
                  </div>
                </div>

                <div className="p-12 overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="bg-indigo-200 border-4 border-indigo-400 px-8 py-6 text-xl font-bold">
                          Row
                        </th>
                        {data.rawTable[0].map((_, i) => (
                          <th
                            key={i}
                            className="bg-indigo-100 border-4 border-indigo-300 px-10 py-6 text-xl font-bold"
                          >
                            Col {i + 1}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.rawTable.map((row, rIdx) => (
                        <tr key={rIdx}>
                          <td className="bg-indigo-50 border-4 border-indigo-300 px-8 py-6 text-xl font-bold text-center">
                            Row {rIdx + 1}
                          </td>
                          {row.map((seat, cIdx) => (
                            <td
                              key={cIdx}
                              className={`border-4 border-gray-300 px-10 py-8 text-center text-lg font-bold ${
                                seat
                                  ? seat.branch === "CSE"
                                    ? "bg-green-50 text-green-900"
                                    : "bg-blue-50 text-blue-900"
                                  : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              {seat ? `${seat.rollNo} (${seat.branch})` : "—"}
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

export default SeatingPlan;
