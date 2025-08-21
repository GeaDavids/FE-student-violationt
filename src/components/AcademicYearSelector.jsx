import React, { useState, useEffect } from "react";
import { FiChevronDown, FiCalendar } from "react-icons/fi";
import academicYearAPI from "../api/academicYear";

const AcademicYearSelector = ({
  value,
  onChange,
  placeholder = "Pilih Tahun Ajaran",
  className = "",
  showCurrent = true,
}) => {
  const [academicYears, setAcademicYears] = useState([]);
  const [currentYear, setCurrentYear] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const fetchAcademicYears = async () => {
    try {
      setLoading(true);
      const [yearsResponse, currentResponse] = await Promise.all([
        academicYearAPI.getAll(),
        showCurrent
          ? academicYearAPI.getCurrent()
          : Promise.resolve({ data: { data: null } }),
      ]);

      setAcademicYears(yearsResponse.data.data || []);
      setCurrentYear(currentResponse.data.data);

      // If no value selected and we have a current year, auto-select it
      if (!value && currentResponse.data.data && onChange) {
        onChange(currentResponse.data.data.id);
      }
    } catch (error) {
      console.error("Error fetching academic years:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedYear = academicYears.find((year) => year.id === value);

  const handleSelect = (yearId) => {
    onChange(yearId);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 h-10 rounded-lg ${className}`}>
        <div className="flex items-center px-3 py-2 h-full">
          <FiCalendar className="w-5 h-5 text-gray-400 mr-2" />
          <div className="h-4 bg-gray-300 rounded w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-gray-400 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FiCalendar className="w-5 h-5 text-gray-400 mr-2" />
            <span className={selectedYear ? "text-gray-900" : "text-gray-500"}>
              {selectedYear ? selectedYear.tahunAjaran : placeholder}
            </span>
            {selectedYear && selectedYear.isActive && (
              <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Aktif
              </span>
            )}
          </div>
          <FiChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {showCurrent && currentYear && (
              <>
                <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b">
                  Tahun Ajaran Saat Ini
                </div>
                <button
                  type="button"
                  onClick={() => handleSelect(currentYear.id)}
                  className={`w-full px-3 py-2 text-left hover:bg-indigo-50 flex items-center justify-between ${
                    value === currentYear.id
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-900"
                  }`}
                >
                  <span>{currentYear.tahunAjaran}</span>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    Aktif
                  </span>
                </button>
                {academicYears.filter((year) => year.id !== currentYear.id)
                  .length > 0 && (
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b border-t">
                    Tahun Ajaran Lainnya
                  </div>
                )}
              </>
            )}

            {academicYears
              .filter((year) => !currentYear || year.id !== currentYear.id)
              .map((year) => (
                <button
                  key={year.id}
                  type="button"
                  onClick={() => handleSelect(year.id)}
                  className={`w-full px-3 py-2 text-left hover:bg-indigo-50 flex items-center justify-between ${
                    value === year.id
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-900"
                  }`}
                >
                  <span>{year.tahunAjaran}</span>
                  {year.isActive && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Aktif
                    </span>
                  )}
                </button>
              ))}

            {academicYears.length === 0 && (
              <div className="px-3 py-2 text-gray-500 text-center">
                Tidak ada tahun ajaran tersedia
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AcademicYearSelector;
