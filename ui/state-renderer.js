/**
 * State Renderer Module
 * Single Responsibility: Rendering different UI states (loading, error, empty)
 */
(function () {
  "use strict";

  const { escapeHtml } = window.GymsExtension.utils;

  /**
   * Render loading state
   * @param {HTMLElement} container - Container element to render into
   */
  function renderLoading(container) {
    if (!container) {
      return;
    }

    container.innerHTML = `
      <div class="gyms-loading">
        <div class="gyms-spinner"></div>
        <p>Loading gyms data... (may take 10-120 seconds)</p>
      </div>
    `;
  }

  /**
   * Render error state
   * @param {HTMLElement} container - Container element to render into
   * @param {string} message - Error message to display
   */
  function renderError(container, message) {
    if (!container) {
      return;
    }

    container.innerHTML = `
      <div class="gyms-error">
        <h3>❌ Error</h3>
        <p>${escapeHtml(message)}</p>
        <button id="gyms-retry-btn" class="gyms-btn">Retry</button>
      </div>
    `;
  }

  /**
   * Render empty state
   * @param {HTMLElement} container - Container element to render into
   * @param {string} username - Username to display in the message
   */
  function renderEmpty(container, username) {
    if (!container) {
      return;
    }

    container.innerHTML = `
      <div class="gyms-empty">
        <h3>📭 No Gyms Found</h3>
        <p>${escapeHtml(username)} hasn't participated in any gym contests yet.</p>
      </div>
    `;
  }

  // Attach to global namespace
  if (!window.GymsExtension) window.GymsExtension = {};
  if (!window.GymsExtension.ui) window.GymsExtension.ui = {};

  window.GymsExtension.ui.stateRenderer = {
    renderLoading,
    renderError,
    renderEmpty,
  };
})();
