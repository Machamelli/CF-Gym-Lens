(function () {
  "use strict";

  const CONFIG = window.GymsExtension.utils.CONFIG;

  /**
   * Process submissions and extract gym data
   * @param {string} handle - User's Codeforces handle
   * @returns {Promise<Array>} Array of gym objects, sorted by most recent participation
   */
  async function getGymsData(handle) {
    const submissionsPromise =
      window.GymsExtension.api.fetchUserSubmissions(handle);
    const gymListPromise = window.GymsExtension.api.fetchGymList();
    const [submissions, gymList] = await Promise.all([
      submissionsPromise,
      gymListPromise,
    ]);
    const gymsMap = new Map();

    submissions.forEach((submission) => {
      const contestId = submission.contestId;

      // Check if this is a gym (contestId > threshold)
      if (!contestId || contestId <= CONFIG.GYM_ID_THRESHOLD) return;

      if (!gymsMap.has(contestId)) {
        const gymInfo = gymList[contestId] || {};
        gymsMap.set(contestId, {
          id: contestId,
          name: gymInfo.name || `Gym ${contestId}`,
          startTime: gymInfo.startTimeSeconds || null,
          duration: gymInfo.durationSeconds || null,
          type: gymInfo.type,
          difficulty: gymInfo.difficulty,
          totalProblems: null,
          solvedProblems: new Set(),
          attemptedProblems: new Set(),
          totalSubmissions: 0,
          rank: null,
          participantCount: null,
          participated: false,
          lastSubmissionTime: submission.creationTimeSeconds,
        });
      }

      const gym = gymsMap.get(contestId);
      gym.totalSubmissions++;
      gym.attemptedProblems.add(submission.problem.index);

      // Track participation (not just PRACTICE)
      if (submission.author.participantType !== "PRACTICE") {
        gym.participated = true;
      }

      if (submission.verdict === "OK") {
        gym.solvedProblems.add(submission.problem.index);
      }

      // Track latest submission time for this gym
      if (submission.creationTimeSeconds > gym.lastSubmissionTime) {
        gym.lastSubmissionTime = submission.creationTimeSeconds;
      }
    });

    // Convert to array and sort by most recent participation
    return Array.from(gymsMap.values()).sort(
      (a, b) => b.lastSubmissionTime - a.lastSubmissionTime,
    );
  }

  /**
   * Fetch total problem counts and rank for gyms
   * @param {Array} gyms - Array of gym objects
   * @param {string} handle - User's handle
   */
  async function fetchProblemCounts(gyms, handle) {
    const gymsToFetch = gyms.filter((gym) => gym.totalProblems === null);

    for (const gym of gymsToFetch) {
      try {
        // Call 1: Fetch user-specific standings to get rank and problems list
        const standings = await window.GymsExtension.api.fetchContestStandings(
          gym.id,
          gym.participated ? handle : null,
        );

        gym.totalProblems = (standings.problems || []).length;
        if (gym.participated && standings.rows && standings.rows.length > 0) {
          gym.rank = standings.rows[0].rank;
        }

        // Call 2: Fetch full standings (up to 10k) to get total participant count
        const totalStats = await window.GymsExtension.api.fetchContestStandings(
          gym.id,
          null, // No handle filter
          1,
          10000,
        );

        if (totalStats && totalStats.rows) {
          gym.participantCount = totalStats.rows.length;
        }
      } catch (e) {
        gym.totalProblems = 0; // fallback if standings fetch fails
      }
    }
  }

  // Attach to global
  window.GymsExtension.data = {
    getGymsData,
    fetchProblemCounts,
  };
})();
