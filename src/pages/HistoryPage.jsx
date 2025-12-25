import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import DeleteIcon from "../assets/deleteicon.png"
export default function HistoryPage({ user }) {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [deleteMode, setDeleteMode] = useState(""); // "single" or "all"
  const [selectedId, setSelectedId] = useState(null);



  const API_URL =
    "https://yleli2plp0.execute-api.us-east-1.amazonaws.com/prod/FetchInvoiceHistory"; 
  const DELETE_API_URL =
  "https://yleli2plp0.execute-api.us-east-1.amazonaws.com/prod/DeleteInvoiceHistory";


  // Fetch history from your Lambda
  const fetchHistory = async () => {
    if (!user?.email) return;

    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.email }),
      });

      const data = await res.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  // Normalize YYYY-MM-DD
  const normalizeDate = (d) => {
    if (!d) return "";
    const parsed = new Date(d);
    if (isNaN(parsed)) return d;
    return parsed.toISOString().split("T")[0];
  };

  // Date-range filter
  const filtered = history.filter((inv) => {
    const d = normalizeDate(inv.date);
    if (startDate && d < startDate) return false;
    if (endDate && d > endDate) return false;
    return true;
  });

  // Delete ONE invoice
const deleteOne = async (invoiceId) => {
  if (!user?.email) return;

  //if (!window.confirm("Delete this history entry?")) return;

  try {
    await fetch(DELETE_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.email,
        invoiceId: invoiceId
      }),
    });

    // Remove from UI instantly
    setHistory((prev) => prev.filter((h) => h.invoiceId !== invoiceId));
  } catch (err) {
    console.error("Delete failed:", err);
  }
};

// Delete ALL invoices
const deleteAll = async () => {
  if (!user?.email) return;

  //if (!window.confirm("Delete ALL invoice history? This cannot be undone.")) return;

  try {
    await fetch(DELETE_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.email,
        deleteAll: true
      }),
    });

    setHistory([]); // Clear instantly
  } catch (err) {
    console.error("Delete-all failed:", err);
  }
};


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-100 p-6 pt-24">
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Invoice History</h1>

          <Link
            to="/dashboard"
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300"
          >
            ← Back
          </Link>
        </div>
        


        {/* Filters */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-4">
          <div className="flex flex-col">
            <label className="text-sm mb-1">From Date</label>
            <input
              type="date"
              className="p-2 border rounded dark:bg-gray-800"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-1">To Date</label>
            <input
              type="date"
              className="p-2 border rounded dark:bg-gray-800"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          
        </div>
        <button
        //onClick={deleteAll}
         onClick={() => {
          setDeleteMode("all");
          setDialogMessage("Are you sure you want to delete ALL history entries?");
          setDialogOpen(true);
        }}
        className="p-2 mt-6 bg-red-600 text-white rounded hover:bg-red-700"
        >
        Clear All History
        </button>
      </div>
        

        {/* Loading */}
        {loading && <p className="text-gray-400">Loading history...</p>}

        {/* No History */}
        {!loading && filtered.length === 0 && (
          <p className="text-gray-400">No history found.</p>
        )}

        {/* Results */}
        {!loading && filtered.length > 0 && (
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
              {filtered.map((inv, i) => (
                <React.Fragment key={inv.invoiceId}>

                  {/* Row */}
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
                            setExpanded((prev) => ({
                              ...prev,
                              [i]: !prev[i],
                            }))
                          }
                          className="text-indigo-600 hover:underline"
                        >
                          {expanded[i] ? "Hide Items ▲" : "View Items ▼"}
                        </button>
                      )}
                    </td>
                    {/* Delete Icon */}
                {/* <button
                  onClick={() => deleteOne(inv.invoiceId)}
                  className="ml-3 text-red-600 hover:text-red-800"
                  title="Delete this record"
                >
                  🗑️
                </button> */}
                <button
                    //onClick={() => deleteOne(inv.invoiceId)}
                     onClick={() => {
                      setDeleteMode("single");
                      setSelectedId(inv.invoiceId);
                      setDialogMessage("Are you sure you want to delete this history entry?");
                      setDialogOpen(true);
                    }}
                    //className="ml-4 w-6 h-6 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                    // title="Delete this record"
                  >
                    <img src={DeleteIcon} alt="Delete" className="transition-transform duration-200 hover:scale-110 ml-1 w-6 h-6" />
                  </button>
                  </tr>

                  {/* Expandable Items */}
                  {expanded[i] && inv.items.length > 0 && (
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <td colSpan="6" className="border px-2 py-2">
                        <table className="w-full text-xs border-collapse">
                          <thead>
                            <tr className="bg-gray-300 dark:bg-gray-700">
                              {Object.keys(inv.items[0]).map((col) => (
                                <th className="border px-2 py-1" key={col}>
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>

                          <tbody>
                            {inv.items.map((item, idx) => (
                              <tr key={idx}>
                                {Object.values(item).map((val, j) => (
                                  <td className="border px-2 py-1" key={j}>
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
      <ConfirmDialog
      open={dialogOpen}
      message={dialogMessage}
      onCancel={() => setDialogOpen(false)}
      onConfirm={() => {
        setDialogOpen(false);
        if (deleteMode === "single") {
          deleteOne(selectedId);
        } else if (deleteMode === "all") {
          deleteAll();
        }
      }}
    />

    </div>
  );
}
