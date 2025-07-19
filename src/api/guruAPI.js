const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const inputCreditScore = async (data) => {
  try {
    const response = await fetch(`${BASE_URL}/guru/input-credit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result;
  } catch (err) {
    console.error("Error:", err);
    return null;
  }
};
