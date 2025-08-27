import React, { useState, useEffect } from "react";
import API from "../../../api/api";
import { getRekapOptions } from "../../../api/rekap";
import laporanAPI from "../../../api/laporan";

const ExportLaporan = () => {
  const [bulan, setBulan] = useState("");
  const [tahunAjaranId, setTahunAjaranId] = useState("");
  const [kelas, setKelas] = useState("");
  const [tipe, setTipe] = useState("all");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [tahunAjaranList, setTahunAjaranList] = useState([]);
  const [kelasList, setKelasList] = useState([]);

  useEffect(() => {
    // Fetch kelas & tahun ajaran dari endpoint rekap/options
    getRekapOptions().then((data) => {
      setKelasList(Array.isArray(data.kelas) ? data.kelas : []);
      setTahunAjaranList(
        Array.isArray(data.tahunAjaran) ? data.tahunAjaran : []
      );
    });
  }, []);

  // Auto preview on filter change
  useEffect(() => {
    let ignore = false;
    const fetchPreview = async () => {
      setPreviewError("");
      setPreviewLoading(true);
      try {
        const params = {};
        if (bulan) params.bulan = bulan;
        if (tahunAjaranId) params.tahunAjaranId = tahunAjaranId;
        if (kelas) params.kelas = kelas;
        if (tipe && tipe !== "all") params.tipe = tipe;
        const res = await laporanAPI.preview(params);
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
  }, [bulan, tahunAjaranId, kelas, tipe]);

  const handleExport = async () => {
    setLoading(true);
    try {
      const params = [];
      if (bulan) params.push(`bulan=${bulan}`);
      if (tahunAjaranId) params.push(`tahunAjaranId=${tahunAjaranId}`);
      if (kelas) params.push(`kelas=${kelas}`);
      if (tipe && tipe !== "all") params.push(`tipe=${tipe}`);
      const url = `master/rekap/laporan${
        params.length ? "?" + params.join("&") : ""
      }`;
      const res = await API.get(url, { responseType: "blob" });
      // Download file
      const blob = new Blob([res.data], { type: res.headers["content-type"] });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "laporan_export.xlsx";
      link.click();
    } catch (err) {
      alert("Gagal export laporan");
    }
    setLoading(false);
  };

  return (
    <div className="container mt-4">
      <h2>Export Data Laporan</h2>
      <form className="mb-3">
        <div className="row g-2">
          <div className="col-md-3">
            <label className="form-label">Bulan (YYYY-MM)</label>
            <input
              type="month"
              className="form-control"
              value={bulan}
              onChange={(e) => setBulan(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Tahun Ajaran</label>
            <select
              className="form-select"
              value={tahunAjaranId}
              onChange={(e) => setTahunAjaranId(e.target.value)}
            >
              <option value="">-- Semua Tahun Ajaran --</option>
              {tahunAjaranList.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.tahunAjaran || t.tahun}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
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
          <div className="col-md-3">
            <label className="form-label">Tipe</label>
            <select
              className="form-select"
              value={tipe}
              onChange={(e) => setTipe(e.target.value)}
            >
              <option value="all">Semua</option>
              <option value="pelanggaran">Pelanggaran</option>
              <option value="prestasi">Prestasi</option>
            </select>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-success mt-3"
          onClick={handleExport}
          disabled={loading || preview.length === 0}
        >
          {loading ? "Mengunduh..." : "Export Laporan (Excel)"}
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
            <thead
              style={{
                position: "sticky",
                top: 0,
                background: "#f8f9fa",
                zIndex: 1,
              }}
            >
              <tr>
                <th>NISN</th>
                <th>Nama</th>
                <th>Kelas</th>
                <th>Tanggal</th>
                <th>Tipe</th>
                <th>Kategori</th>
                <th>Item</th>
                <th>Point</th>
                <th>Deskripsi</th>
                <th>Reporter</th>
                <th>Tahun Ajaran</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i}>
                  <td>{row.nisn}</td>
                  <td>{row.nama}</td>
                  <td>{row.kelas}</td>
                  <td>{row.tanggal}</td>
                  <td>{row.tipe}</td>
                  <td>{row.kategori}</td>
                  <td>{row.item}</td>
                  <td>{row.point}</td>
                  <td>{row.deskripsi}</td>
                  <td>{row.reporter}</td>
                  <td>{row.tahunAjaran}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="alert alert-info">
        <b>Tips:</b> Filter bisa dikosongkan untuk preview/export semua data.
        <br />
        <b>Bulan</b> format: 2025-08. <b>Tahun Ajaran</b> dan <b>Kelas</b>{" "}
        otomatis dari master.
        <br />
        File hasil export berupa Excel (.xlsx).
      </div>
    </div>
  );
};

export default ExportLaporan;
