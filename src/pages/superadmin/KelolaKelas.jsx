import { useState, useEffect } from "react";

const KelolaKelas = () => {
  const [kelas, setKelas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Contoh data dummy, nanti bisa diganti dengan API
    const dummyData = [
      { id: 1, nama: "X RPL 1" },
      { id: 2, nama: "XII TKJ 2" },
      { id: 3, nama: "XI MM 1" },
    ];
    setKelas(dummyData);
    setLoading(false);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#003366] mb-6">🏷️ Kelola Data Kelas</h1>

      {loading ? (
        <p>Loading data kelas...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100 text-gray-800">
              <tr>
                <th className="border px-4 py-2 text-left">No</th>
                <th className="border px-4 py-2 text-left">Nama Kelas</th>
              </tr>
            </thead>
            <tbody>
              {kelas.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{index + 1}</td>
                  <td className="border px-4 py-2">{item.nama}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default KelolaKelas;
