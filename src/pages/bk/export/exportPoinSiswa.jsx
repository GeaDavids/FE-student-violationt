import React, { useState, useEffect } from "react";
import {
  getRekapOptions,
  exportPoinSiswa,
  previewPoinSiswa,
} from "../../../api/rekap";
import AcademicYearSelector from "../../../components/AcademicYearSelector";

const ExportPoinSiswa = () => {
  const [kelas, setKelas] = useState("");
  const [bulan, setBulan] = useState("");
  const [tahunAjaranId, setTahunAjaranId] = useState("");
  const [kelasList, setKelasList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  // Auto preview on filter change
  useEffect(() => {
    let ignore = false;
    const fetchPreview = async () => {
      setPreviewError("");
      setPreviewLoading(true);
      try {
        const params = {};
        if (kelas) params.kelas = kelas;
        if (bulan) params.bulan = bulan;
        if (tahunAjaranId) params.tahunAjaranId = tahunAjaranId;
        const res = await previewPoinSiswa(params);
        if (!ignore) {
          setPreview(res.data.data || []);
          if ((res.data.data || []).length === 0)
            setPreviewError("Data tidak ditemukan.");
        }
      } catch (err) {
        if (!ignore) setPreviewError("Gagal mengambil data preview");
      }
      if (!ignore) setPreviewLoading(false);
    };
    fetchPreview();
    return () => {
      ignore = true;
    };
  }, [kelas, bulan, tahunAjaranId]);

  useEffect(() => {
    getRekapOptions().then((data) => {
      setKelasList(Array.isArray(data.kelas) ? data.kelas : []);
    });
  }, []);

  const handleExport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (kelas) params.kelas = kelas;
      if (bulan) params.bulan = bulan;
      if (tahunAjaranId) params.tahunAjaranId = tahunAjaranId;
      const res = await exportPoinSiswa(params);
      const blob = new Blob([res.data], { type: res.headers["content-type"] });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "poin_siswa_export.xlsx";
      link.click();
    } catch (err) {
      alert("Gagal export poin siswa");
    }
    setLoading(false);
  };

  return (
    <div className="container mt-4">
      <h2>Export Data Poin Siswa</h2>
      <form className="mb-3">
        <div className="row g-2">
          <div className="col-md-4">
            <label className="form-label">Bulan (YYYY-MM)</label>
            <input
              type="month"
              className="form-control"
              value={bulan}
              onChange={(e) => setBulan(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Kelas</label>
            <select
              className="form-select"
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
            >
              <option value="">-- Semua Kelas --</option>
              {kelasList.map((k) => (
                <option key={k.id} value={k.kodeKelas}>
                  {k.kodeKelas} - {k.namaKelas}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Tahun Ajaran</label>
            <AcademicYearSelector
              value={tahunAjaranId}
              onChange={setTahunAjaranId}
              className="w-100"
              showCurrent={true}
            />
          </div>
        </div>
        <button
          type="button"
          className="btn btn-success mt-3"
          onClick={handleExport}
          disabled={loading || preview.length === 0}
        >
          {loading ? "Mengunduh..." : "Export Poin Siswa (Excel)"}
        </button>
      </form>
      <div
        className="mt-3"
        style={{
          maxHeight: 400,
          overflowY: "auto",
          border: "1px solid #ddd",
          borderRadius: 6,
          background: "#fff",
        }}
      >
        {previewLoading ? (
          <div className="text-center p-4">Loading...</div>
        ) : previewError ? (
          <div className="alert alert-warning m-3">{previewError}</div>
        ) : (
          <table className="table table-bordered table-sm mb-0">
            <thead>
              <tr>
                <th
                  style={{
                    minWidth: 80,
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                  }}
                >
                  NISN
                </th>
                <th
                  style={{
                    minWidth: 100,
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                  }}
                >
                  Nama
                </th>
                <th
                  style={{
                    minWidth: 80,
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                  }}
                >
                  Kelas
                </th>
                <th
                  style={{
                    minWidth: 80,
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                  }}
                >
                  Angkatan
                </th>
                <th
                  style={{
                    minWidth: 80,
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                  }}
                >
                  Score
                </th>
                <th
                  style={{
                    minWidth: 80,
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    background: "#ffdddd",
                    color: "#b30000",
                  }}
                >
                  Jml Pelanggaran
                </th>
                <th
                  style={{
                    minWidth: 110,
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    background: "#ffdddd",
                    color: "#b30000",
                  }}
                >
                  Poin Pel
                </th>
                <th
                  style={{
                    minWidth: 80,
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    background: "#ddffdd",
                    color: "#006600",
                  }}
                >
                  Jml Prestasi
                </th>
                <th
                  style={{
                    minWidth: 110,
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    background: "#ddffdd",
                    color: "#006600",
                  }}
                >
                  Poin Pres
                </th>
                <th
                  style={{
                    minWidth: 80,
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    background: "#ddeeff",
                    color: "#0055aa",
                  }}
                >
                  Jml Penanganan
                </th>
                <th
                  style={{
                    minWidth: 110,
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    background: "#ddeeff",
                    color: "#0055aa",
                  }}
                >
                  Poin Pen
                </th>
              </tr>
            </thead>
            <tbody>
              {preview.map((s, i) => (
                <tr key={i}>
                  <td>{s.nisn}</td>
                  <td>{s.nama}</td>
                  <td>{s.kelas}</td>
                  <td>{s.angkatan}</td>
                  <td>{s.totalScore}</td>
                  <td style={{ background: "#ffdddd", color: "#b30000" }}>
                    {s.pelanggaran}
                  </td>
                  <td style={{ background: "#ffdddd", color: "#b30000" }}>
                    {s.totalPoinPelanggaran}
                  </td>
                  <td style={{ background: "#ddffdd", color: "#006600" }}>
                    {s.prestasi}
                  </td>
                  <td style={{ background: "#ddffdd", color: "#006600" }}>
                    {s.totalPoinPrestasi}
                  </td>
                  <td style={{ background: "#ddeeff", color: "#0055aa" }}>
                    {s.jmlPenanganan}
                  </td>
                  <td style={{ background: "#ddeeff", color: "#0055aa" }}>
                    {s.totalPoinPenanganan}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ExportPoinSiswa;
