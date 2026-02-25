/**
 * Table Renderer Module
 * Single Responsibility: Rendering the gyms table with sorting capabilities
 */
(function () {
  "use strict";

  const { formatDate, formatDuration, escapeHtml, getSortTooltip } =
    window.GymsExtension.utils;

  /**
   * Get sort indicator HTML (on new line)
   * @param {string} column - Column name
   * @param {Object} currentSort - Current sort state
   * @returns {string} Sort indicator HTML
   */
  function getSortIndicator(column, currentSort) {
    if (currentSort.column !== column) {
      return '<div class="gyms-sort-indicator">⇅</div>';
    }
    const arrow = currentSort.direction === "asc" ? "▲" : "▼";
    return `<div class="gyms-sort-indicator gyms-sort-active">${arrow}</div>`;
  }

  /**
   * Generate table header HTML
   * @param {Object} currentSort - Current sort state {column, direction}
   * @returns {string} Table header HTML
   */
  function generateTableHeader(currentSort) {
    return `
      <thead>
        <tr>
          <th class="gyms-th-num gyms-th-sortable" data-sort="recent" title="${getSortTooltip("recent", currentSort)}">#${getSortIndicator("recent", currentSort)}</th>
          <th class="gyms-th-name gyms-th-sortable" data-sort="name" title="${getSortTooltip("name", currentSort)}">Contest Name${getSortIndicator("name", currentSort)}</th>
          <th class="gyms-th-type gyms-th-sortable" data-sort="type" title="${getSortTooltip("type", currentSort)}">Type${getSortIndicator("type", currentSort)}</th>
          <th class="gyms-th-date gyms-th-sortable" data-sort="date" title="${getSortTooltip("date", currentSort)}">Publish Date${getSortIndicator("date", currentSort)}</th>
          <th class="gyms-th-duration gyms-th-sortable" data-sort="duration" title="${getSortTooltip("duration", currentSort)}">Duration${getSortIndicator("duration", currentSort)}</th>
          <th class="gyms-th-rank gyms-th-sortable" data-sort="rank" title="${getSortTooltip("rank", currentSort)}">Rank${getSortIndicator("rank", currentSort)}</th>
          <th class="gyms-th-solved gyms-th-sortable" data-sort="solved" title="${getSortTooltip("solved", currentSort)}">Solved${getSortIndicator("solved", currentSort)}</th>
          <th class="gyms-th-submissions gyms-th-sortable" data-sort="submissions" title="${getSortTooltip("submissions", currentSort)}">Submissions${getSortIndicator("submissions", currentSort)}</th>
          <th class="gyms-th-total gyms-th-sortable" data-sort="total" title="${getSortTooltip("total", currentSort)}">Total Problems${getSortIndicator("total", currentSort)}</th>
          <th class="gyms-th-difficulty gyms-th-sortable" data-sort="difficulty" title="${getSortTooltip("difficulty", currentSort)}">Difficulty${getSortIndicator("difficulty", currentSort)}</th>
        </tr>
      </thead>
    `;
  }

  /**
   * Generate a single table row for a gym
   * @param {Object} gym - Gym data object
   * @param {number} index - Row index (for zebra striping)
   * @returns {string} Table row HTML
   */
  function generateTableRow(gym, index) {
    return `
      <tr class="${index % 2 === 0 ? "even" : "odd"}">
        <td class="gyms-td-num">${index + 1}</td>
        <td class="gyms-td-name">
          <a href="/gym/${gym.id}" target="_blank" title="${escapeHtml(gym.name)}">
            ${escapeHtml(gym.name)}
          </a>
        </td>
        <td class="gyms-td-type">
          <span class="gyms-type-badge gyms-type-${gym.type.toLowerCase()}">
            ${escapeHtml(gym.type)}
          </span>
        </td>
        <td class="gyms-td-date">${formatDate(gym.startTime)}</td>
        <td class="gyms-td-duration">${formatDuration(gym.duration)}</td>
        <td class="gyms-td-rank">
          ${gym.rank || "-"}
          ${gym.rank && gym.participantCount ? `<span class="gyms-participant-total">/ ${gym.participantCount}</span>` : ""}
        </td>
        <td class="gyms-td-solved">
          <span class="gyms-solved-count">${gym.solvedProblems.size}</span>
          <span class="gyms-attempted-count">/ ${gym.attemptedProblems.size}</span>
        </td>
        <td class="gyms-td-submissions">${gym.totalSubmissions}</td>
        <td class="gyms-td-total">${gym.totalProblems || "Loading..."}</td>
        <td class="gyms-td-difficulty">
          ${gym.difficulty !== undefined && gym.difficulty !== null ? "★".repeat(gym.difficulty) : "N/A"}
        </td>
      </tr>
    `;
  }

  /**
   * Calculate aggregate statistics from gyms data
   * @param {Array} gyms - Array of gym objects
   * @returns {Object} Statistics object
   */
  function calculateStatistics(gyms) {
    const totalSolved = gyms.reduce((sum, g) => sum + g.solvedProblems.size, 0);
    const totalAttempted = gyms.reduce(
      (sum, g) => sum + g.attemptedProblems.size,
      0,
    );

    return {
      totalGyms: gyms.length,
      totalSolved,
      totalAttempted,
    };
  }

  /**
   * Generate statistics header HTML
   * @param {Object} stats - Statistics object
   * @returns {string} Statistics HTML
   */
  function generateStatisticsHeader(stats) {
    return `
      <div class="gyms-header">
        <h2>🏋️ Gym Participations</h2>
        <div class="gyms-stats">
          <span class="gyms-stat">
            <strong>${stats.totalGyms}</strong> Gyms
          </span>
          <span class="gyms-stat">
            <strong>${stats.totalSolved}</strong> Problems Solved
          </span>
          <span class="gyms-stat">
            <strong>${stats.totalAttempted}</strong> Problems Attempted
          </span>
        </div>
      </div>
    `;
  }

  /**
   * Attach sort event handlers to table headers
   * @param {HTMLElement} container - Container element
   * @param {function} onSort - Sort handler function
   */
  function attachSortHandlers(container, onSort) {
    if (!onSort || !container) return;

    const sortableHeaders = container.querySelectorAll(".gyms-th-sortable");
    sortableHeaders.forEach((th) => {
      th.addEventListener("click", () => {
        const column = th.dataset.sort;
        if (column) {
          onSort(column);
        }
      });
    });
  }

  /**
   * Render the gyms table
   * @param {HTMLElement} container - Container element to render into
   * @param {Array} gyms - Array of gym objects
   * @param {Object} currentSort - Current sort state {column, direction}
   * @param {function} onSort - Sort handler function
   */
  function renderGymsTable(
    container,
    gyms,
    currentSort = { column: "recent", direction: "desc" },
    onSort = null,
  ) {
    if (!container || !Array.isArray(gyms)) {
      return;
    }

    const stats = calculateStatistics(gyms);
    const tableRows = gyms
      .map((gym, index) => generateTableRow(gym, index))
      .join("");

    container.innerHTML = `
      ${generateStatisticsHeader(stats)}
      
      <div class="gyms-table-wrapper">
        <table class="rtable gyms-table">
          ${generateTableHeader(currentSort)}
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
    `;

    // Attach sort click handlers
    attachSortHandlers(container, onSort);
  }

  // Attach to global namespace
  if (!window.GymsExtension) window.GymsExtension = {};
  if (!window.GymsExtension.ui) window.GymsExtension.ui = {};

  window.GymsExtension.ui.tableRenderer = {
    renderGymsTable,
    calculateStatistics,
  };
})();
