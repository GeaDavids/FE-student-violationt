import { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import { UploadCloud } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const ImportSiswa = () => {
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState([]);
  const navigate = useNavigate();

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const processFile = (file) => {
    if (file && file.name.endsWith(".xlsx")) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (evt) => {
        const workbook = XLSX.read(evt.target.result, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const nisSet = new Set();
        for (let row of data) {
          if (nisSet.has(row.NIS)) {
            setError("❌ Terdapat duplikat NIS di dalam file.");
            return;
          }
          nisSet.add(row.NIS);
        }

        setError("");
        setPreview(data);
      };
      reader.readAsBinaryString(file);
    } else {
      setError("❌ Format file harus .xlsx");
    }
  };

  const uploadData = async () => {
    try {
      await axios.post(
        "https://smk14-production.up.railway.app/api/siswa/import",
        preview
      );
      alert("✅ Data berhasil diimport!");
    } catch (err) {
      console.error(err);
      alert("❌ Gagal mengimpor data.");
    }
  };

  const handleBack = () => {
    navigate("/superadmin/pilih-kelas");
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Tombol Kembali */}
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-2 text-blue-700 border border-blue-600 px-4 py-2 rounded-full shadow-sm hover:bg-blue-50 hover:shadow-md transition-all duration-200 text-sm font-medium mb-6"
      >
        <FaArrowLeft className="w-4 h-4" />
        Kembali ke Kelola Siswa
      </button>

      <h2 className="text-3xl font-bold text-[#003366] mb-6 flex items-center gap-2">
        <UploadCloud className="w-7 h-7 text-[#003366]" />
        Import Data Siswa
      </h2>

      {/* Tombol Pilih File */}
      <div className="mb-4">
        <label className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-md cursor-pointer transition">
          📂 Pilih File Excel
          <input type="file" onChange={handleFileChange} className="hidden" />
        </label>
        {fileName && (
          <span className="ml-4 text-sm text-gray-700 italic">
            File dipilih: {fileName}
          </span>
        )}
      </div>

      {/* Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="w-full h-48 border-2 border-dashed border-blue-400 rounded-lg flex flex-col items-center justify-center text-center text-blue-600 bg-blue-50 hover:bg-blue-100 transition mb-6"
      >
        <p className="text-lg font-medium">Drag & Drop file Excel di sini</p>
        <p className="text-sm text-blue-500 mt-1">
          atau gunakan tombol di atas untuk memilih file
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="text-red-700 bg-red-100 border border-red-300 px-4 py-2 rounded mb-4">
          ⚠️ {error}
        </div>
      )}

      {/* Catatan */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-6 shadow-sm">
        <p className="text-sm text-yellow-800">
          <strong>📌 Catatan:</strong> File harus memiliki kolom{" "}
          <code>Nama</code>, <code>NIS</code>, dan <code>Kelas</code>. Pastikan{" "}
          <strong>NIS</strong> tidak duplikat.
        </p>
      </div>

      {/* Preview */}
      {preview.length > 0 && (
        <>
          <h3 className="text-xl font-semibold text-[#003366] mb-3">
            📄 Pratinjau Data
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm mb-6">
              <thead className="bg-gray-100 text-gray-800">
                <tr>
                  <th className="border px-3 py-2">Nama</th>
                  <th className="border px-3 py-2">NIS</th>
                  <th className="border px-3 py-2">Kelas</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((siswa, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border px-3 py-1">{siswa.Nama}</td>
                    <td className="border px-3 py-1">{siswa.NIS}</td>
                    <td className="border px-3 py-1">{siswa.Kelas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-right">
            <button
              onClick={uploadData}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-md transition"
            >
              ✅ Import Sekarang
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ImportSiswa;
