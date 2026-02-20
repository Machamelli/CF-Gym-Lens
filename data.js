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
          lastSubmissionTime: submission.creationTimeSeconds,
        });
      }

      const gym = gymsMap.get(contestId);
      gym.totalSubmissions++;
      gym.attemptedProblems.add(submission.problem.index);

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
   * Fetch total problem counts for gyms that don't have them
   */
  async function fetchProblemCounts(gyms) {
    const gymsToFetch = gyms.filter((gym) => gym.totalProblems === null);

    for (const gym of gymsToFetch) {
      try {
        const res = await fetch(
          `${CONFIG.API_BASE_URL}/contest.standings?contestId=${gym.id}&from=1&count=1`,
        );
        const data = await res.json();
        gym.totalProblems = data.result.problems.length;
      } catch (e) {
        gym.totalProblems = 0;
      }
    }
  }

  // Attach to global
  window.GymsExtension.data = {
    getGymsData,
    fetchProblemCounts,
  };
})();
