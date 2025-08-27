import API from "../../api/api";
import { useEffect, useState } from "react";

const useSuratPeringatan = () => {
  const [surat, setSurat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSurat = async () => {
      try {
        setLoading(true);
        const res = await API.get("/student/me/surat-peringatan");
        setSurat(res.data.data || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSurat();
  }, []);

  return { surat, loading, error };
};

export default useSuratPeringatan;
