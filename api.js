(function () {
  "use strict";

  const CONFIG = window.GymsExtension.utils.CONFIG;

  // ==================== API Functions ====================

  /**
   * Fetch user submissions from Codeforces API
   * @param {string} handle - User's Codeforces handle
   * @returns {Promise<Array>} Array of submission objects
   * @throws {Error} If API request fails
   */
  async function fetchUserSubmissions(handle) {
    try {
      const response = await fetch(
        `${CONFIG.API_BASE_URL}/user.status?handle=${encodeURIComponent(handle)}`,
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();

      if (data.status !== "OK") {
        throw new Error(data.comment || "Failed to fetch user submissions");
      }

      return data.result;
    } catch (error) {
      throw new Error(`Failed to fetch user submissions: ${error.message}`);
    }
  }

  /**
   * Fetch gym contest list from Codeforces API
   * @returns {Promise<Object>} Map of contest ID to contest object
   */
  async function fetchGymList() {
    try {
      const response = await fetch(
        `${CONFIG.API_BASE_URL}/contest.list?gym=true`,
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();

      if (data.status === "OK") {
        const gymMap = {};
        data.result.forEach((contest) => {
          gymMap[contest.id] = contest;
        });
        return gymMap;
      } else {
        throw new Error(data.comment || "Failed to fetch gym list");
      }
    } catch (e) {
      throw new Error(`Failed to fetch gym list: ${e.message}`);
    }
  }

  // Attach to global
  if (!window.GymsExtension) window.GymsExtension = {};
  window.GymsExtension.api = {
    fetchUserSubmissions,
    fetchGymList,
  };
})();
