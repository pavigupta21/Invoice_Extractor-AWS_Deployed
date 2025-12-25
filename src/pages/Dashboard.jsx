import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";

export default function Dashboard({user}) {
  const [files, setFiles] = useState([]);
  const [extracting, setExtracting] = useState(false);
  const [allResults, setAllResults] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [toast, setToast] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const navigate = useNavigate();

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };
  // Handle file upload
  const handleFileChange = (e) => {
  const selectedFiles = Array.from(e.target.files).filter(
    (f) => f.type === "application/pdf"
  );


  const enhancedFiles = selectedFiles.map(file => ({
    file,
    previewUrl: URL.createObjectURL(file)
  }));

  setFiles(prev => [...prev, ...enhancedFiles]);
};


  // Remove selected file
const handleRemoveFile = (index) => {
  setFiles(prev => {
    const updated = prev.filter((_, i) => i !== index);

    // ✅ Only clear results when ALL files are removed
    if (updated.length === 0) {
      setAllResults([]);
      setExpandedRows({});
      setStartDate("");
      setEndDate("");
      showToast("All files removed. Results cleared.", "success");
    }

    return updated;
  });
};
const handleClearAllFiles = () => {
  setFiles([]);
  setAllResults([]);
  setExpandedRows({});
  setStartDate("");
  setEndDate("");
  showToast("All files removed. Results cleared.", "success");
};

  const convertToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
    });

  // Extract invoices
const handleExtract = async () => {
  if (!files.length) {
    showToast("Please upload at least one PDF before extracting.", "error");
    return;
  }
    setExtracting(true);

    try {
      const payload = await Promise.all(
      files.map(async (f) => ({
        fileName: f.file.name,
        file: await convertToBase64(f.file),
        originalFileUrl: f.previewUrl
      }))
    );


      const res = await fetch(
        "https://yleli2plp0.execute-api.us-east-1.amazonaws.com/prod/extract",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user?.email || null,
            files: payload }),
        }
      );

      const data = await res.json();
      setAllResults(data.invoices || []);
    } catch (err) {
      console.error("Extraction failed:", err);
      showToast("Extraction failed!", "error");
      //alert("Extraction failed!");
    }

    setExtracting(false);
  };

const normalizeDate = (dateStr) => {
  if (!dateStr) return "";

  // Handle formats like: "22 April 2022"
  const parsed = Date.parse(dateStr);

  if (isNaN(parsed)) return "";

  const d = new Date(parsed);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};



const filteredResults = allResults.filter(inv => {
  if (!startDate && !endDate) return true;

  const invoiceDate = normalizeDate(inv.date);

  if (startDate && invoiceDate < startDate) return false;
  if (endDate && invoiceDate > endDate) return false;

  return true;
});




const downloadCSV = () => {
  // If there's a searchQuery, export only filteredResults.
  // Otherwise, export allResults.
  const dataToExport =
  startDate || endDate ? filteredResults : allResults;

  if (!dataToExport || dataToExport.length === 0) {
    showToast("No data to export", "error");
    return;
  }

  const headers = [
    "File Name",
    "Vendor",
    "Invoice No",
    "Invoice Date",
    "Total",
    "ITEM",
    "QUANTITY",
    "UNIT_PRICE",
    "PRICE",
    "EXPENSE_ROW"
  ];

  const rows = [];

  dataToExport.forEach(inv => {
    if (inv.items && inv.items.length > 0) {
      // One CSV row per line item
      inv.items.forEach(item => {
        rows.push([
          inv.fileName || "",
          inv.vendor || "",
          inv.invoiceNo || "",
          inv.date || "",
          inv.total || "",
          item.ITEM || "",
          item.QUANTITY || "",
          item.UNIT_PRICE || "",
          item.PRICE || "",
          item.EXPENSE_ROW || ""
        ]);
      });
    } else {
      // Invoices without items still get one row
      rows.push([
        inv.fileName || "",
        inv.vendor || "",
        inv.invoiceNo || "",
        inv.date || "",
        inv.total || "",
        "",
        "",
        "",
        "",
        ""
      ]);
    }
  });

  const csv = [
    headers.join(","),                             // header row
    ...rows.map(row => row.map(v => `"${v}"`).join(",")) // data rows
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download =
    startDate || endDate
      ? `filtered_invoices_with_items.csv`
      : "all_invoices_with_items.csv";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};



  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900 dark:text-gray-100">
      {/* Toast */}
            {toast && (
              <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(null)}
              />
            )}
      
      <button
        onClick={() => navigate("/")}
        className="mb-4 mt-16 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500"
      >
        ← Back to Home
      </button>

      <h1 className="text-3xl font-bold mb-6">Invoice Extraction Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4">Upload Invoices (Multiple)</h2>

          <label className="w-full h-48 border-2 border-dashed rounded-md flex items-center justify-center cursor-pointer">
            <input
              type="file"
              className="hidden"
              accept="application/pdf"
              multiple
              onChange={handleFileChange}
            />
            <span className="text-gray-500">Click to Upload Multiple PDFs</span>
          </label>

          {files.length > 0 && (
            <ul className="mt-3 text-sm list-disc pl-4 space-y-1">
              {files.map((file, idx) => (
                <li key={idx} className="flex justify-between items-center">
                  <span>{file.file.name}</span>
                  <button
                    onClick={() => handleRemoveFile(idx)}
                    className="ml-4 w-6 h-6 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                    title="Remove file"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
          {files.length > 0 && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleClearAllFiles}
              className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Clear All Files
            </button>
          </div>
        )}

          <button
          disabled={files.length === 0 || extracting}
          onClick={handleExtract}
          className={`mt-5 w-full py-2 rounded-md text-white transition ${
            files.length === 0 || extracting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {extracting ? "Extracting All..." : "Extract All Invoices"}
        </button>
        </div>

        {/* Results Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border dark:bg-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Batch Results</h2>
            <button
              onClick={downloadCSV}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Download CSV
            </button>
          </div>

          <div className="flex items-end gap-4 mb-4">
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="p-2 border rounded-md dark:bg-gray-800"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="p-2 border rounded-md dark:bg-gray-800"
              />
            </div>
          </div>



          {allResults.length === 0 ? (
            <p className="text-gray-400">No batch extraction yet.</p>
          ) : (
            <table className="w-full table-auto border-collapse text-sm">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700">
                  <th className="border px-2 py-1">File</th>
                  <th className="border px-2 py-1">Vendor</th>
                  <th className="border px-2 py-1">Invoice No</th>
                  <th className="border px-2 py-1">Date</th>
                  <th className="border px-2 py-1">Total</th>
                  <th className="border px-2 py-1">Items</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults
                  .map((inv, i) => (
                    <React.Fragment key={i}>
                      <tr>
                        <td className="border px-2 py-1">
                <a
                  href={inv.originalFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  📄 {inv.fileName}
                </a>
              </td>

                        <td className="border px-2 py-1">{inv.vendor}</td>
                        <td className="border px-2 py-1">{inv.invoiceNo}</td>
                        <td className="border px-2 py-1">{normalizeDate(inv.date)}</td>
                        <td className="border px-2 py-1">{inv.total}</td>
                        <td className="border px-2 py-1 text-center">
                          {inv.items && inv.items.length > 0 && (
                            <button
                              onClick={() =>
                                setExpandedRows((prev) => ({
                                  ...prev,
                                  [i]: !prev[i],
                                }))
                              }
                              className="text-indigo-600 hover:underline text-sm"
                            >
                              {expandedRows[i]
                                ? "Hide Items ▲"
                                : "View Items ▼"}
                            </button>
                          )}
                        </td>
                      </tr>

                      {expandedRows[i] && inv.items && inv.items.length > 0 && (
                        <tr className="bg-gray-50 dark:bg-gray-800">
                          <td colSpan="6" className="border px-2 py-2">
                            <table className="w-full text-xs border-collapse">
                              <thead>
                                <tr className="bg-gray-300 dark:bg-gray-700">
                                  {Object.keys(inv.items[0]).map((col) => (
                                    <th
                                      key={col}
                                      className="border px-2 py-1"
                                    >
                                      {col}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {inv.items.map((item, idx) => (
                                  <tr key={idx}>
                                    {Object.values(item).map((val, j) => (
                                      <td
                                        key={j}
                                        className="border px-2 py-1"
                                      >
                                        {val}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}