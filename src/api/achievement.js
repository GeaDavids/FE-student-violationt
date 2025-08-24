import axios from "./axios";
import API from "./api";

const achievementAPI = {
  // Get all achievements
  getAllAchievements: () => API.get("/master/achievements"),

  // Get achievement detail
  getAchievementDetail: (id) => API.get(`/master/achievements/${id}`),

  // Create new achievement
  createAchievement: (data) => API.post("/master/achievements", data),

  // Update achievement
  updateAchievement: (id, data) => API.put(`/master/achievements/${id}`, data),

  // Delete achievement
  deleteAchievement: (id) => API.delete(`/master/achievements/${id}`),
};

export default achievementAPI;