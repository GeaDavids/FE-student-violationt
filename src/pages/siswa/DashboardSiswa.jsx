import { useEffect, useState } from "react";
import { getCreditScore } from "../../api/siswaAPI";

const DashboardSiswa = () => {
  const [creditScore, setCreditScore] = useState(null);

  useEffect(() => {
    // Misalnya NIS diset secara statis untuk sementara
    getCreditScore("123456").then((data) => {
      setCreditScore(data);
    });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Credit Score Kamu</h1>
      {creditScore !== null ? (
        <p className="text-xl">{creditScore.score}</p>
      ) : (
        <p>Memuat...</p>
      )}
    </div>
  );
};

export default DashboardSiswa;
