import React, { useState } from "react";
import API from "../../api/api";
import { getAllClassrooms } from "../../api/classroom";
import academicYearAPI from "../../api/academicYear";

const ImportSiswa = () => {
  const [students, setStudents] = useState([]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [classrooms, setClassrooms] = useState([]);
  const [angkatan, setAngkatan] = useState([]);

  // Fetch classroom and angkatan data for validation/sample/template
  React.useEffect(() => {
    getAllClassrooms().then((data) =>
      setClassrooms(Array.isArray(data.data) ? data.data : [])
    );
    academicYearAPI
      .getAll()
      .then((res) => setAngkatan(Array.isArray(res?.data) ? res.data : []));
  }, []);

  // Parse CSV/Excel to JSON (simple CSV for demo)
  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const lines = evt.target.result.split("\n");
      const headers = lines[0].split(",").map((h) => h.trim());
      const data = lines.slice(1).map((line) => {
        const values = line.split(",");
        let obj = {};
        headers.forEach((h, i) => (obj[h] = values[i]?.trim() || ""));
        return obj;
      });
      setPreview(data.filter((d) => d.nisn));
    };
    reader.readAsText(f);
  };

  const handleImport = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await API.post("/superadmin/import/siswa", {
        students: preview,
      });
      setResult(res.data);
    } catch (err) {
      setResult({ error: err.response?.data?.error || "Gagal import" });
    }
    setLoading(false);
  };

  return (
    <div className="container mt-4">
      <h2>Import Data Siswa</h2>
      <div className="mb-3">
        <label htmlFor="file" className="form-label">
          Pilih file CSV (header:
          nisn,name,gender,tempatLahir,tglLahir,alamat,angkatanTahun,kodeKelas,email,password,noHp,namaOrtu,nohpOrtu)
        </label>
        <input
          type="file"
          className="form-control"
          id="file"
          accept=".csv"
          onChange={handleFileChange}
        />
      </div>
      {preview.length > 0 && (
        <>
          <h5>Preview Data ({preview.length} siswa):</h5>
          <div style={{ maxHeight: 200, overflow: "auto" }}>
            <table className="table table-sm table-bordered">
              <thead>
                <tr>
                  <th>NISN</th>
                  <th>Nama</th>
                  <th>Gender</th>
                  <th>Tempat Lahir</th>
                  <th>Tgl Lahir</th>
                  <th>Alamat</th>
                  <th>Angkatan Tahun</th>
                  <th>Kode Kelas</th>
                  <th>Email</th>
                  <th>No HP</th>
                  <th>Nama Ortu</th>
                  <th>No HP Ortu</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((s, i) => (
                  <tr key={i}>
                    <td>{s.nisn}</td>
                    <td>{s.name}</td>
                    <td>{s.gender}</td>
                    <td>{s.tempatLahir}</td>
                    <td>{s.tglLahir}</td>
                    <td>{s.alamat}</td>
                    <td>{s.angkatanTahun}</td>
                    <td>{s.kodeKelas}</td>
                    <td>{s.email}</td>
                    <td>{s.noHp}</td>
                    <td>{s.namaOrtu}</td>
                    <td>{s.nohpOrtu}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            className="btn btn-primary mt-2"
            onClick={handleImport}
            disabled={loading}
          >
            {loading ? "Mengimpor..." : "Import Siswa"}
          </button>
        </>
      )}
      {result && (
        <div className="mt-3">
          {result.error ? (
            <div className="alert alert-danger">{result.error}</div>
          ) : (
            <div className="alert alert-success">
              Import selesai. Berhasil: {result.imported} siswa.
              {result.failed && result.failed.length > 0 && (
                <>
                  <br />
                  Gagal import:
                  <ul>
                    {result.failed.map((f, i) => (
                      <li key={i}>
                        {f.nisn}: {f.reason}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      )}
      <div className="mt-4">
        <h6>Petunjuk:</h6>
        <ul>
          <li>
            File harus format CSV. Header wajib:
            nisn,name,gender,tempatLahir,tglLahir,alamat,angkatanTahun,kodeKelas
          </li>
          <li>Pastikan kodeKelas dan angkatanTahun sudah ada di sistem</li>
          <li>
            Contoh kode kelas:{" "}
            <b>{classrooms.map((k) => k.kodeKelas).join(", ")}</b>
          </li>
          <li>Contoh angkatan tahun: 2024</li>
        </ul>
      </div>
    </div>
  );
};

export default ImportSiswa;
