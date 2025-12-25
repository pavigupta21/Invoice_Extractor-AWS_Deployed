// src/pages/WelcomePage.jsx
import PreviewSlides from "../components/PreviewSlides";


export default function WelcomePage({ onStart,user,goToDashboard}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-100">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

          {/* LEFT COLUMN — Hero Section */}
          <div>
            <h2 className="text-4xl font-extrabold text-gray-900 leading-tight dark:text-white">
              Extract key details from PDF invoices in seconds
            </h2>

            <p className="mt-4 text-lg text-gray-600 dark:text-white">
              Extracts fields like vendor name, invoice number, totals,
and line items where available.
              Built mainly for students and small businesses.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => {
                    if (user) {
                    goToDashboard();  // use React Router navigation
                    } else {
                    onStart(); // open login/register modal
                    }
                }}
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 focus:outline-none"
                >
                Get Started
                </button>
            </div>

            <ul className="mt-8 space-y-3 text-black dark:text-white">
              <li>•  Serverless backend using AWS Lambda and API Gateway </li>
              <li>• Authentication and invoice storage using DynamoDB</li>
              <li>• OCR-based field extraction from PDF invoices</li>
            </ul>
          </div>

          {/* RIGHT COLUMN — New Visual Workflow Panel */}
          <div>
            <PreviewSlides />
          </div>
        </div>

        {/* How it works section */}
        <section id="how-it-works" className="mt-20 bg-white rounded-lg p-6 shadow-sm dark:bg-gray-800">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">How it works</h3>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold">1. Upload</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Upload one or more PDF invoices at a time.</p>
            </div>

            <div>
              <h4 className="font-semibold">2. Extract</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Invoice details are extracted and shown in a clean, tabular format.</p>
            </div>

            <div>
              <h4 className="font-semibold">3. Save</h4>
              <p className="text-sm text-gray- dark:text-gray-300">Invoices are saved automatically. Filter by date, download CSV files, or delete history items.
</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
