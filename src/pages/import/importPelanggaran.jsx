import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUploadCloud } from "react-icons/fi";
import API from "../../api/api";

const ImportPelanggaran = () => {
  const [file, setFile] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });
  const [importResult, setImportResult] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const [uploading, setUploading] = useState(false);
  const handleUpload = async () => {
    if (!file) {
      setAlert({
        show: true,
        type: "error",
        message: "Silakan pilih file terlebih dahulu!",
      });
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    try {
      const res = await API.post("/import/pelanggaran", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setImportResult(res.data);
      if (res.data.success) {
        setAlert({
          show: true,
          type: "success",
          message: `Berhasil mengimpor ${res.data.imported} pelanggaran!`,
        });
      } else {
        setAlert({
          show: true,
          type: "warning",
          message: `Sebagian data gagal diimpor. Berhasil: ${res.data.imported}, Gagal: ${res.data.failed.length}`,
        });
      }
    } catch (err) {
      setAlert({
        show: true,
        type: "error",
        message: "Gagal mengimpor data pelanggaran!",
      });
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 max-w-xl mx-auto">
        {/* Alert */}
        {alert.show && (
          <div
            className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium shadow-md border 
              ${
                alert.type === "success"
                  ? "bg-green-50 border-green-300 text-green-800"
                  : ""
              }
              ${
                alert.type === "error"
                  ? "bg-red-50 border-red-300 text-red-800"
                  : ""
              }
              ${
                alert.type === "warning"
                  ? "bg-yellow-50 border-yellow-300 text-yellow-800"
                  : ""
              }
            `}
          >
            {alert.message}
            <button
              className="ml-2 text-xs text-gray-500 hover:text-gray-700"
              onClick={() => setAlert({ ...alert, show: false })}
            >
              ×
            </button>
            {/* Tampilkan detail hasil import jika ada */}
            {importResult && (
              <div className="mt-2 text-xs text-gray-700">
                <div>
                  <b>Berhasil diimpor:</b> {importResult.imported}
                </div>
                {importResult.failed && importResult.failed.length > 0 && (
                  <div className="mt-1">
                    <b>Gagal diimpor:</b> {importResult.failed.length}
                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded mt-1 bg-gray-50">
                      <ul className="list-disc ml-5 mt-1 pr-2">
                        {importResult.failed.slice(0, 20).map((fail, idx) => (
                          <li key={idx}>
                            <b>{fail.nama}</b>: {fail.reason}
                          </li>
                        ))}
                      </ul>
                      {importResult.failed.length > 20 && (
                        <div className="text-gray-500 text-xs px-3 py-1">
                          Dan {importResult.failed.length - 20} error lainnya...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {/* Tombol Kembali */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg shadow-sm transition-all"
        >
          Kembali
        </button>
        <h1 className="text-xl font-bold mb-2 text-gray-800">
          Import Data Pelanggaran
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Unggah file Excel untuk mengimpor data pelanggaran. Pastikan format
          sesuai template yang sudah ditentukan.
        </p>

        {/* Upload Section */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center gap-3 hover:border-blue-500 transition cursor-pointer">
          <FiUploadCloud className="text-4xl text-blue-600" />
          <div className="text-gray-600 text-sm flex items-center gap-2">
            {file ? (
              <>
                <span className="font-medium text-gray-800">{file.name}</span>
                <button
                  type="button"
                  className="ml-2 text-red-500 hover:text-red-700 text-lg font-bold px-1 rounded transition"
                  onClick={() => setFile(null)}
                  title="Hapus file"
                  aria-label="Hapus file"
                >
                  ×
                </button>
              </>
            ) : (
              "Tarik & letakkan file di sini atau klik untuk pilih file"
            )}
          </div>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
            id="fileUpload"
          />
          <label
            htmlFor="fileUpload"
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer"
          >
            Pilih File
          </label>
        </div>

        {/* Button Upload */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleUpload}
            className="px-5 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md hover:from-green-600 hover:to-green-700 font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {/* Catatan */}
        <div className="mt-4 text-xs text-gray-500">
          <p>📌 Catatan:</p>
          <ul className="list-disc ml-5">
            <li>
              File harus dalam format <b>.xlsx</b> atau <b>.xls</b>.
            </li>
            <li>Pastikan kolom sesuai dengan template.</li>
            <li>Data hanya bisa diimpor jika kategori sudah tersedia.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImportPelanggaran;
