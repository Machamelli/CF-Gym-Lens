/**
 * DOM Utilities Module
 * Single Responsibility: DOM element finding and basic element creation
 */
(function () {
  "use strict";

  /**
   * Find and return the navigation menu element using the standard Codeforces selector
   * ( Hardcoded since codeforces doesn't change often )
   * @returns {HTMLElement|null}
   */
  function findNavigationMenu() {
    return document.querySelector(".second-level-menu-list");
  }

  /**
   * Create the Gyms tab element
   * @param {function} onClick - Click handler for the tab
   * @returns {HTMLElement} The created li element
   */
  function createGymsTab(onClick) {
    const li = document.createElement("li");
    li.id = "gyms-tab";

    const a = document.createElement("a");
    a.href = "javascript:void(0);";
    a.textContent = "GYMS";
    a.style.cursor = "pointer";

    a.addEventListener("click", (e) => {
      e.preventDefault();
      onClick();
    });

    li.appendChild(a);
    return li;
  }

  /**
   * Create the gyms content container
   * @returns {HTMLElement} The container div element
   */
  function createGymsContainer() {
    const container = document.createElement("div");
    container.id = "gyms-content-container";
    container.className = "gyms-extension-container";
    container.style.display = "none";
    return container;
  }

  // Attach to global namespace
  if (!window.GymsExtension) window.GymsExtension = {};
  if (!window.GymsExtension.ui) window.GymsExtension.ui = {};

  window.GymsExtension.ui.domUtils = {
    findNavigationMenu,
    createGymsTab,
    createGymsContainer,
  };
})();
