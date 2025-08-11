import { useState } from "react";
import { PilihKelas } from "../pages/superadmin";

const ModalKelolaUser = ({ type, onClose }) => {
  const [subType, setSubType] = useState(null); // siswa | guru | bk

  const renderSubMenu = () => (
    <>
      <h2 className="text-xl font-bold mb-4 text-[#003366]">Manajemen User</h2>
      <div className="space-y-4">
        <button
          onClick={() => setSubType("siswa")}
          className="w-full bg-[#003366] text-white py-2 rounded"
        >
          Kelola Data Siswa
        </button>
        <button
          onClick={() => setSubType("guru")}
          className="w-full bg-[#003366] text-white py-2 rounded"
        >
          Kelola Data Guru
        </button>
        <button
          onClick={() => setSubType("bk")}
          className="w-full bg-[#003366] text-white py-2 rounded"
        >
          Kelola Data BK
        </button>
      </div>
    </>
  );

  const renderContent = () => {
    if (!subType) {
      return renderSubMenu();
    }

    if (subType === "siswa") {
      return (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#003366]">
              Kelola Data Siswa
            </h2>
            <button
              onClick={() => setSubType(null)}
              className="text-sm text-blue-600 hover:underline"
            >
              ← Kembali
            </button>
          </div>
          <PilihKelas />
        </>
      );
    }

    // Placeholder untuk guru dan bk
    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#003366]">
            Kelola Data {subType.toUpperCase()}
          </h2>
          <button
            onClick={() => setSubType(null)}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Kembali
          </button>
        </div>
        <p>Form kelola data {subType} akan ditampilkan di sini...</p>
      </>
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {renderContent()}

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalKelolaUser;
