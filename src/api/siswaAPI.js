const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fetch credit score siswa
export const getCreditScore = async (nis) => {
  try {
    const response = await fetch(`${BASE_URL}/siswa/credit-score/${nis}`);
    if (!response.ok) throw new Error("Gagal mengambil data");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error.message);
    return null;
  }
};
