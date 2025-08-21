import axios from "./axios";

const achievementAPI = {
  // Get all achievements
  getAllAchievements: () => axios.get("/achievements"),

  // Get achievement detail
  getAchievementDetail: (id) => axios.get(`/achievements/${id}`),

  // Create new achievement
  createAchievement: (data) => axios.post("/achievements", data),

  // Update achievement
  updateAchievement: (id, data) => axios.put(`/achievements/${id}`, data),

  // Delete achievement
  deleteAchievement: (id) => axios.delete(`/achievements/${id}`),
};

export default achievementAPI;
