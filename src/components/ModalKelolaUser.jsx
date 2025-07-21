import KelolaSiswa from "../pages/superadmin/KelolaSiswa";

const ModalKelolaUser = ({ type, onClose }) => {
  const getTitle = () => {
    switch (type) {
      case "siswa": return "Kelola Data Siswa";
      case "guru": return "Kelola Data Guru";
      case "bk": return "Kelola Data BK";
      default: return "Kelola User";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-[#003366]">{getTitle()}</h2>

        {type === "siswa" && <KelolaSiswa />}
        {type === "guru" && <p>Form input guru sementara...</p>}
        {type === "bk" && <p>Form input BK sementara...</p>}

        <button
          onClick={onClose}
          className="mt-6 bg-[#003366] text-white px-4 py-2 rounded hover:bg-[#002244]"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};

export default ModalKelolaUser;
