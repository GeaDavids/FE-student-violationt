import React, { useState, useEffect } from "react";
import {
  FiCalendar,
  FiBarChart2,
  FiUsers,
  FiUser,
  FiFileText,
  FiAward,
} from "react-icons/fi";
import AcademicYearSelector from "../components/AcademicYearSelector";
import AcademicYearManagement from "../components/AcademicYearManagement";
import superadminAPI from "../api/superadmin";

const SuperadminAcademicYear = () => {
  const [selectedYear, setSelectedYear] = useState(null);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("management");

  useEffect(() => {
    if (selectedYear) {
      fetchData();
    }
  }, [selectedYear]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsResponse, analyticsResponse] = await Promise.all([
        superadminAPI.getStatsByAcademicYear({ tahunAjaranId: selectedYear }),
        superadminAPI.getAnalyticsByAcademicYear({
          tahunAjaranId: selectedYear,
        }),
      ]);

      setStats(statsResponse.data);
      setAnalytics(analyticsResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    color = "indigo",
  }) => {
    const colorClasses = {
      blue: "from-blue-50 to-blue-100 border-blue-200 from-blue-500 to-blue-600",
      green:
        "from-green-50 to-green-100 border-green-200 from-green-500 to-green-600",
      purple:
        "from-purple-50 to-purple-100 border-purple-200 from-purple-500 to-purple-600",
      indigo:
        "from-indigo-50 to-indigo-100 border-indigo-200 from-indigo-500 to-indigo-600",
      red: "from-red-50 to-red-100 border-red-200 from-red-500 to-red-600",
      yellow:
        "from-yellow-50 to-yellow-100 border-yellow-200 from-yellow-500 to-yellow-600",
      gray: "from-gray-50 to-gray-100 border-gray-200 from-gray-500 to-gray-600",
    };

    const [bgGradient, borderColor, iconGradient] =
      colorClasses[color].split(" ");

    return (
      <div
        className={`bg-gradient-to-br ${bgGradient} shadow-md rounded-lg border ${borderColor} p-4`}
      >
        <div className="flex items-center">
          <div
            className={`flex-shrink-0 p-2.5 rounded-lg bg-gradient-to-r ${iconGradient} shadow-sm`}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="ml-3">
            <p className="text-xs font-medium text-gray-600">{title}</p>
            <p className="text-xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="space-y-5">
        {/* Header Section */}
        <div className="mb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg shadow-md">
              <FiCalendar className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Manajemen Tahun Ajaran
              </h1>
              <p className="text-gray-600 text-xs">
                Kelola tahun ajaran dan lihat statistik sistem
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("management")}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                activeTab === "management"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm"
              }`}
            >
              Manajemen
            </button>
          </div>
        </div>

        {/* Management Tab */}
        {activeTab === "management" && <AcademicYearManagement />}
      </div>
    </div>
  );
};

export default SuperadminAcademicYear;
