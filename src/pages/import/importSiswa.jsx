import React, { useState } from "react";
import API from "../../api/api";
import { getAllClassrooms } from "../../api/classroom";

const ImportSiswa = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [classrooms, setClassrooms] = useState([]);
  const [angkatan, setAngkatan] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  // Fetch classroom and angkatan data for validation/template
  React.useEffect(() => {
    // Fetch classrooms
    getAllClassrooms()
      .then((data) => {
        console.log("Classrooms response:", data);
        setClassrooms(Array.isArray(data.data) ? data.data : []);
      })
      .catch((err) => {
        console.error("Error fetching classrooms:", err);
        setClassrooms([]);
      });
    
    // Fetch angkatan data
    API.get("/angkatan")
      .then((res) => {
        console.log("Angkatan response:", res.data);
        setAngkatan(Array.isArray(res?.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Error fetching angkatan:", err);
        setAngkatan([]);
      });
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      processFile(f);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (f) => {
    setFile(f);
    // For Excel files, just set the file - preview will be empty as we can't parse Excel in frontend
    if (f.name.endsWith('.xlsx') || f.name.endsWith('.xls')) {
      setPreview([]);
    } else {
      // For CSV files, show preview
      const reader = new FileReader();
      reader.onload = (evt) => {
        const lines = evt.target.result.split("\n");
        const headers = lines[0].split(",").map((h) => h.trim());
        const data = lines.slice(1)
          .filter(line => line.trim()) // Remove empty lines
          .map((line) => {
            const values = line.split(",");
            let obj = {};
            headers.forEach((h, i) => (obj[h] = values[i]?.trim() || ""));
            return obj;
          });
        setPreview(data.filter((d) => d.nisn));
      };
      reader.readAsText(f);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setResult({ error: "Pilih file terlebih dahulu" });
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Try multiple potential endpoints based on the backend pattern
      let response;
      const endpoints = [
        "/superadmin/import/students",
        "/superadmin/students/import", 
        "/import/students",
        "/users/students/import"
      ];

      let lastError;
      for (const endpoint of endpoints) {
        try {
          response = await API.post(endpoint, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          });
          break; // Success, exit loop
        } catch (err) {
          lastError = err;
          console.log(`Endpoint ${endpoint} failed:`, err.response?.status);
          continue; // Try next endpoint
        }
      }

      if (!response) {
        throw lastError; // If all endpoints failed, throw the last error
      }

      setResult({
        message: response.data.message,
        imported: response.data.imported,
        errors: response.data.errors,
        errorDetails: response.data.errorDetails || []
      });
    } catch (err) {
      console.error("Import error:", err);
      setResult({ 
        error: err.response?.data?.error || err.response?.data?.message || "Gagal mengimport data siswa. Pastikan endpoint import tersedia di backend."
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview([]);
    setResult(null);
    // Reset file input
    const fileInput = document.getElementById('file');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-3">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-3">
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Kembali</span>
          </button>
        </div>

        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Import Data Siswa</h1>
              <p className="text-gray-600 text-xs mt-1">Upload file Excel (.xlsx) untuk menambahkan data siswa</p>
            </div>
          </div>

          {/* File Upload Section */}
          <div 
            className={`border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-2">
              <div className="mx-auto w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              
              <div>
                <label htmlFor="file" className="cursor-pointer">
                  <span className="text-sm font-medium text-gray-900">
                    Drag dan drop file Excel di sini
                  </span>
                  <p className="text-gray-500 text-xs mt-1">atau klik untuk memilih file (.xlsx)</p>
                </label>
                <input
                  type="file"
                  className="hidden"
                  id="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                />
              </div>

              {file && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-2 max-w-xs mx-auto">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2 min-w-0">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-xs font-medium text-green-800 truncate">{file.name}</p>
                        <p className="text-xs text-green-600">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button
                      onClick={removeFile}
                      className="flex-shrink-0 w-5 h-5 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors"
                      title="Hapus file"
                    >
                      <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                <p className="text-xs font-medium text-blue-800 mb-1">Format Header Excel:</p>
                <code className="text-xs bg-white px-2 py-1 rounded border text-blue-900 block overflow-x-auto">
                  nisn | nama | gender | tempatLahir | tglLahir | alamat | noHp | kelas | angkatan
                </code>
                <p className="text-xs text-blue-600 mt-1">
                  <strong>gender:</strong> L/P • <strong>tglLahir:</strong> YYYY-MM-DD • <strong>kelas & angkatan:</strong> sesuai data sistem
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Preview or Import Ready Section */}
        {file && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">File Siap untuk Import</h2>
                <p className="text-gray-600 text-xs mt-1">File: {file.name}</p>
              </div>
              <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                Ready
              </div>
            </div>

            {preview.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview Data (CSV):</p>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-xs">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase">NISN</th>
                        <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase">Nama</th>
                        <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase">Gender</th>
                        <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase">Kelas</th>
                        <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase">Angkatan</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {preview.slice(0, 3).map((s, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-2 py-1 font-medium text-gray-900">{s.nisn}</td>
                          <td className="px-2 py-1 text-gray-900">{s.nama || s.name}</td>
                          <td className="px-2 py-1 text-gray-900">{s.gender}</td>
                          <td className="px-2 py-1 text-gray-900">{s.kelas}</td>
                          <td className="px-2 py-1 text-gray-900">{s.angkatan}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {preview.length > 3 && (
                  <div className="mt-2 text-center">
                    <p className="text-xs text-gray-500">
                      Menampilkan 3 dari {preview.length} data
                    </p>
                  </div>
                )}
              </div>
            )}

            {file.name.endsWith('.xlsx') || file.name.endsWith('.xls') ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mb-3">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-amber-800">
                    File Excel siap untuk diimport. Pastikan format sesuai template.
                  </p>
                </div>
              </div>
            ) : null}

            <div className="flex justify-center">
              <button
                className={`px-5 py-2 rounded-lg font-medium text-sm text-white transition-all duration-200 ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow'
                }`}
                onClick={handleImport}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Importing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Import Data</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        )}
        {/* Result Section */}
        {result && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            {result.error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Import Gagal</h3>
                    <p className="text-red-600 text-xs mt-1">{result.error}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-green-800">Import Berhasil</h3>
                    <p className="text-green-600 text-xs mt-1">
                      {result.message || `Berhasil mengimport ${result.imported || 0} siswa`}
                    </p>
                  </div>
                </div>
                
                {result.errors > 0 && result.errorDetails && result.errorDetails.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mt-2">
                    <h4 className="text-xs font-medium text-yellow-800 mb-1">
                      Beberapa data gagal diimport ({result.errors} item):
                    </h4>
                    <div className="space-y-1 max-h-16 overflow-y-auto">
                      {result.errorDetails.slice(0, 3).map((error, i) => (
                        <div key={i} className="text-xs text-yellow-700">
                          {typeof error === 'string' ? error : `Baris ${i + 1}: ${error.message || 'Error tidak diketahui'}`}
                        </div>
                      ))}
                      {result.errorDetails.length > 3 && (
                        <p className="text-xs text-yellow-600">...dan {result.errorDetails.length - 3} error lainnya</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Guidelines Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-gray-900">Petunjuk & Template</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-800">Format File</h3>
              <div className="space-y-1">
                <div className="flex items-start space-x-2">
                  <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5"></div>
                  <p className="text-xs text-gray-600">File Excel (.xlsx)</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5"></div>
                  <p className="text-xs text-gray-600">Header sesuai format</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5"></div>
                  <p className="text-xs text-gray-600">Data wajib tidak kosong</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-800">Data Tersedia</h3>
              <div className="space-y-1">
                <div className="flex items-start space-x-2">
                  <div className="w-1 h-1 bg-green-500 rounded-full mt-1.5"></div>
                  <p className="text-xs text-gray-600">
                    Kelas: {classrooms.length > 0 
                      ? classrooms.slice(0, 2).map((k) => k.namaKelas).join(", ") + (classrooms.length > 2 ? "..." : "")
                      : "Loading..."}
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1 h-1 bg-green-500 rounded-full mt-1.5"></div>
                  <p className="text-xs text-gray-600">
                    Angkatan: {angkatan.length > 0 
                      ? angkatan.slice(0, 3).map((a) => a.tahun).join(", ") + (angkatan.length > 3 ? "..." : "")
                      : "Loading..."}
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1 h-1 bg-green-500 rounded-full mt-1.5"></div>
                  <p className="text-xs text-gray-600">NISN harus unik</p>
                </div>
              </div>
            </div>
          </div>

          {/* Template Download Section */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-medium text-indigo-800">Download Template</h4>
                  <p className="text-xs text-indigo-600 mt-1">
                    Template Excel untuk import data siswa
                  </p>
                </div>
                <button
                  onClick={() => {
                    // Create a simple template download
                    const headers = ['nisn', 'nama', 'gender', 'tempatLahir', 'tglLahir', 'alamat', 'noHp', 'kelas', 'angkatan'];
                    const csvContent = headers.join(',') + '\n' +
                      '2024001001,Contoh Siswa,L,Jakarta,2006-01-15,Jl. Contoh No. 123,081234567890,XII RPL 1,2024';
                    
                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'template_import_siswa.csv';
                    a.click();
                    window.URL.revokeObjectURL(url);
                  }}
                  className="flex items-center space-x-1 bg-indigo-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-indigo-700 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportSiswa;
