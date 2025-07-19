// src/pages/guru/InputCredit.jsx
import { useState } from "react";
import { inputCreditScore } from "../../api/guruAPI";

const InputCredit = () => {
  const [form, setForm] = useState({
    nis: "",
    poin: "",
    keterangan: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await inputCreditScore(form);
    if (result) {
      setMessage("Berhasil disimpan!");
      setForm({ nis: "", poin: "", keterangan: "" });
    } else {
      setMessage("Gagal menyimpan data.");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Input Credit Score Siswa</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block font-semibold">NIS Siswa</label>
          <input
            type="text"
            name="nis"
            value={form.nis}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block font-semibold">Jumlah Poin</label>
          <input
            type="number"
            name="poin"
            value={form.poin}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block font-semibold">Keterangan</label>
          <textarea
            name="keterangan"
            value={form.keterangan}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-[#003366] text-white px-6 py-2 rounded hover:bg-[#002244] transition"
        >
          Simpan
        </button>
      </form>
      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  );
};

export default InputCredit;
