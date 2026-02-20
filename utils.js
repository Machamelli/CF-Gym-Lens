(function () {
  "use strict";

  const CONFIG = {
    GYM_ID_THRESHOLD: 100000, // Contest IDs above this are gyms
    API_BASE_URL: "https://codeforces.com/api",
  };

  // ==================== Utility Functions ====================

  /**
   * Extract username from the current URL
   * @param {string} url - The current page URL (defaults to window.location.pathname)
   * @returns {string|null} The username if found, otherwise null
   */
  function getUsernameFromURL(url = window.location.pathname) {
    if (url.startsWith("/profile/")) {
      const username = url.substring("/profile/".length).split("/")[0];
      return decodeURIComponent(username);
    }
    return null;
  }

  /**
   * Format Unix timestamp to readable date
   * @param {number} timestamp - Unix timestamp in seconds
   * @returns {string} Formatted date string or "N/A" if invalid
   */
  function formatDate(timestamp) {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp * 1000);
    const options = { year: "numeric", month: "short", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  }

  /**
   * Format duration in seconds to readable format
   * @param {number} seconds - Duration in seconds
   * @returns {string} Formatted duration (e.g., "1d 2h 30m 45s") or "N/A" if invalid
   */
  function formatDuration(seconds) {
    if (!seconds) return "N/A";
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0) parts.push(`${secs}s`);
    return parts.join(" ") || "0s";
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - The text to escape
   * @returns {string} HTML-escaped text
   */
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Sort gyms data by column
   * @param {Array} gymsData - Array of gym objects to sort
   * @param {string} column - Column to sort by
   * @param {string} direction - Sort direction ('asc' or 'desc')
   * @returns {Array} Sorted array of gyms
   */
  function sortGymsData(gymsData, column, direction) {
    const dir = direction === "asc" ? 1 : -1;

    return [...gymsData].sort((a, b) => {
      let valA, valB;

      switch (column) {
        case "recent":
          // Sort by most recent participation (last submission time)
          valA = a.lastSubmissionTime || 0;
          valB = b.lastSubmissionTime || 0;
          break;
        case "name":
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
          return valA.localeCompare(valB) * dir;
        case "type":
          valA = a.type.toLowerCase();
          valB = b.type.toLowerCase();
          return valA.localeCompare(valB) * dir;
        case "date":
          valA = a.startTime || 0;
          valB = b.startTime || 0;
          break;
        case "duration":
          valA = a.duration || 0;
          valB = b.duration || 0;
          break;
        case "solved":
          // Sort by number of solved problems, not attempted
          valA = a.solvedProblems.size;
          valB = b.solvedProblems.size;
          break;
        case "submissions":
          valA = a.totalSubmissions || 0;
          valB = b.totalSubmissions || 0;
          break;
        case "total":
          valA = a.totalProblems || 0;
          valB = b.totalProblems || 0;
          break;
        case "difficulty":
          valA = a.difficulty ?? -1;
          valB = b.difficulty ?? -1;
          break;
        default:
          return 0;
      }

      if (valA < valB) return -1 * dir;
      if (valA > valB) return 1 * dir;
      return 0;
    });
  }

  /**
   * Get tooltip text for sortable column headers
   * @param {string} column - Column name
   * @param {Object} currentSort - Current sort state
   * @returns {string} Tooltip text describing what will happen on click
   */
  function getSortTooltip(column, currentSort) {
    // Determine the next sort direction
    let nextDirection;
    if (currentSort.column === column) {
      // Toggle direction if same column
      nextDirection = currentSort.direction === "asc" ? "desc" : "asc";
    } else {
      // Default to ascending for new column
      nextDirection = "asc";
    }

    // Get the column display name
    const columnNames = {
      recent: "Most Recent",
      name: "Name",
      type: "Type",
      date: "Publish Date",
      duration: "Duration",
      solved: "Solved",
      submissions: "Submissions",
      total: "Total Problems",
      difficulty: "Difficulty",
    };

    const columnName = columnNames[column] || column;
    const directionText = nextDirection.toUpperCase();

    return `Sort by ${columnName}\n${directionText}`;
  }

  // Attach to global
  if (!window.GymsExtension) window.GymsExtension = {};
  window.GymsExtension.utils = {
    CONFIG,
    getUsernameFromURL,
    formatDate,
    formatDuration,
    escapeHtml,
    sortGymsData,
    getSortTooltip,
  };
})();
