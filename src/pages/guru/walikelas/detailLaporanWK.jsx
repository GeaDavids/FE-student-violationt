import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getReportById } from "../../../api/reports";

const DetailLaporanWK = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [laporan, setLaporan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getReportById(id);
        setLaporan(res.data);
      } catch (err) {
        setError("Gagal memuat detail laporan");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!laporan) return null;

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
  let buktiArr = [];
  if (laporan.bukti) {
    if (Array.isArray(laporan.bukti)) buktiArr = laporan.bukti;
    else if (typeof laporan.bukti === "string" && laporan.bukti.trim() !== "")
      buktiArr = [laporan.bukti];
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6 mt-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← Kembali
      </button>
      <h1 className="text-2xl font-bold mb-4 text-blue-900">Detail Laporan</h1>
      <div className="space-y-3">
        <div>
          <b>Tanggal:</b>{" "}
          {laporan.tanggal
            ? new Date(laporan.tanggal).toLocaleDateString("id-ID")
            : "-"}
        </div>
        <div>
          <b>Tipe:</b> {laporan.item?.tipe || "-"}
        </div>
        <div>
          <b>Item:</b> {laporan.item?.nama || "-"}
        </div>
        <div>
          <b>Poin:</b>{" "}
          {laporan.item?.tipe === "pelanggaran"
            ? `-${laporan.item?.point || 0}`
            : `+${laporan.item?.point || 0}`}
        </div>
        <div>
          <b>Pelapor:</b> {laporan.reporter || "-"}
        </div>
        <div>
          <b>Deskripsi:</b> {laporan.deskripsi || "-"}
        </div>
        <div>
          <b>Bukti:</b>
          <br />
          {buktiArr.length > 0 ? (
            <div className="flex flex-wrap gap-3 mt-2">
              {buktiArr.map((bukti, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <img
                    src={`${BASE_URL}${bukti}`}
                    alt="Bukti"
                    className="w-24 h-24 object-cover rounded border mb-1"
                    onError={(e) => (e.target.src = "/placeholder-image.png")}
                  />
                  <a
                    href={`${BASE_URL}${bukti}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 underline"
                  >
                    Lihat
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailLaporanWK;
