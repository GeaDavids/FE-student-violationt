import React from "react";
import { FiAlertTriangle, FiInfo } from "react-icons/fi";

const AcademicYearWarning = ({
  academicYear,
  className = "",
  showInfo = false,
}) => {
  if (!academicYear) {
    return (
      <div
        className={`bg-red-50 border border-red-200 rounded-lg p-4 mb-4 ${className}`}
      >
        <div className="flex items-start">
          <FiAlertTriangle
            className="text-red-500 mr-3 mt-0.5 flex-shrink-0"
            size={20}
          />
          <div>
            <h3 className="text-red-800 font-semibold text-sm">
              No Academic Year Available
            </h3>
            <p className="text-red-600 text-sm mt-1">
              No academic year has been set up. Please contact the administrator
              to create and activate an academic year before proceeding.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!academicYear.isActive) {
    return (
      <div
        className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 ${className}`}
      >
        <div className="flex items-start">
          <FiAlertTriangle
            className="text-yellow-500 mr-3 mt-0.5 flex-shrink-0"
            size={20}
          />
          <div>
            <h3 className="text-yellow-800 font-semibold text-sm">
              Historical Data View
            </h3>
            <p className="text-yellow-600 text-sm mt-1">
              You are viewing data for academic year{" "}
              <strong>{academicYear.tahunAjaran}</strong> (inactive). New
              reports and activities cannot be created for this period.
            </p>
            {showInfo && (
              <p className="text-yellow-600 text-xs mt-2">
                To create new reports, please select the active academic year or
                contact administrator.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (showInfo && academicYear.isActive) {
    return (
      <div
        className={`bg-green-50 border border-green-200 rounded-lg p-3 mb-4 ${className}`}
      >
        <div className="flex items-center">
          <FiInfo className="text-green-500 mr-2 flex-shrink-0" size={16} />
          <p className="text-green-700 text-sm">
            Active academic year: <strong>{academicYear.tahunAjaran}</strong>
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default AcademicYearWarning;
