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

  /**
   * Fetch contest standings from Codeforces API
   * @param {number} contestId - Contest ID
   * @param {string} handle - Optional handle to get specific user's rank
   * @param {number} from - Optional start index (default 1)
   * @param {number} count - Optional count of rows to fetch (default 1)
   * @returns {Promise<Object>} Standings data
   */
  async function fetchContestStandings(contestId, handle, from = 1, count = 1) {
    try {
      let url = `${CONFIG.API_BASE_URL}/contest.standings?contestId=${contestId}&from=${from}&count=${count}&showUnofficial=true`;
      if (handle) {
        url += `&handles=${encodeURIComponent(handle)}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.status === "OK") {
        return data.result;
      } else {
        throw new Error(data.comment || "Failed to fetch standings");
      }
    } catch (e) {
      throw new Error(`Failed to fetch standings: ${e.message}`);
    }
  }

  // Attach to global
  if (!window.GymsExtension) window.GymsExtension = {};
  window.GymsExtension.api = {
    fetchUserSubmissions,
    fetchGymList,
    fetchContestStandings,
  };
})();
