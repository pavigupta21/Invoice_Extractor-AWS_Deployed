import { useEffect, useState } from "react";

const slides = [
  {
    label: "Upload invoices",
    image: "/slides/upload.png",
    alt: "Upload multiple PDF invoices",
  },
  {
    label: "Extracted data table",
    image: "/slides/table.png",
    alt: "Extracted invoice data shown in a table",
  },
  {
    label: "CSV download",
    image: "/slides/csv_download.png",
    alt: "Downloading table data as CSV",
  },
  {
    label: "Date filtering",
    image: "/slides/filter.png",
    alt: "Filtering invoice data by date",
  },
  {
    label: "History management",
    image: "/slides/history.png",
    alt: "Saved invoices with delete option",
  },
];

export default function PreviewSlides() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // start fade-out

      setTimeout(() => {
        setIndex((prev) => (prev + 1) % slides.length);
        setFade(true); // fade-in new slide
      }, 250);
    }, 2000); // change slide every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 overflow-hidden">

      {/* Label */}
      <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
        {slides[index].label}
      </p>

      {/* Image wrapper */}
      <div
        className={`transform transition-all duration-300 ease-out ${
          fade ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
        }`}
      >
        <img
          src={slides[index].image}
          alt={slides[index].alt}
          className="rounded-lg border dark:border-gray-700 w-full"
        />
      </div>

    </div>
  );
}
