import axios from "./axios";

const achievementAPI = {
  // Get all achievements
  getAllAchievements: () => axios.get("/master/achievements"),

  // Get achievement detail
  getAchievementDetail: (id) => axios.get(`/master/achievements/${id}`),

  // Create new achievement
  createAchievement: (data) => axios.post("/master/achievements", data),

  // Update achievement
  updateAchievement: (id, data) =>
    axios.put(`/master/achievements/${id}`, data),

  // Delete achievement
  deleteAchievement: (id) => axios.delete(`/master/achievements/${id}`),
};

export default achievementAPI;
