/**
 * Tab Manager Module
 * Single Responsibility: Managing tab states and content visibility
 */
(function () {
  "use strict";

  /**
   * Toggle between original content and gyms content
   * @param {boolean} showGyms - Whether to show gyms content or original content
   */
  function toggleContent(showGyms) {
    const gymsContainer = document.getElementById("gyms-content-container");
    const datatable = document.querySelector(".datatable");

    // Get all content sections that should be hidden
    const contentSections = document.querySelectorAll(
      "#pageContent > div:not(#gyms-content-container):not(.second-level-menu):not(.menu-box)",
    );

    if (showGyms) {
      hideOriginalContent(contentSections, datatable);
      showGymsContent(gymsContainer);
    } else {
      showOriginalContent(contentSections, datatable);
      hideGymsContent(gymsContainer);
    }

    // Update tab active states
    updateTabActiveState(showGyms);
  }

  /**
   * Hide original Codeforces content sections
   * @param {NodeList} contentSections - Content sections to hide
   * @param {HTMLElement} datatable - Datatable element to hide
   */
  function hideOriginalContent(contentSections, datatable) {
    contentSections.forEach((section) => {
      if (
        !section.classList.contains("second-level-menu") &&
        !section.classList.contains("menu-box") &&
        !section.querySelector(".second-level-menu-list")
      ) {
        section.dataset.gymsOriginalDisplay = section.style.display;
        section.style.display = "none";
      }
    });

    if (datatable) {
      datatable.dataset.gymsOriginalDisplay = datatable.style.display;
      datatable.style.display = "none";
    }
  }

  /**
   * Show original Codeforces content sections
   * @param {NodeList} contentSections - Content sections to show
   * @param {HTMLElement} datatable - Datatable element to show
   */
  function showOriginalContent(contentSections, datatable) {
    contentSections.forEach((section) => {
      if (section.dataset.gymsOriginalDisplay !== undefined) {
        section.style.display = section.dataset.gymsOriginalDisplay || "";
        delete section.dataset.gymsOriginalDisplay;
      }
    });

    if (datatable && datatable.dataset.gymsOriginalDisplay !== undefined) {
      datatable.style.display = datatable.dataset.gymsOriginalDisplay || "";
      delete datatable.dataset.gymsOriginalDisplay;
    }
  }

  /**
   * Show gyms content container
   * @param {HTMLElement} gymsContainer - Gyms container element
   */
  function showGymsContent(gymsContainer) {
    if (gymsContainer) {
      gymsContainer.style.display = "block";
    }
  }

  /**
   * Hide gyms content container
   * @param {HTMLElement} gymsContainer - Gyms container element
   */
  function hideGymsContent(gymsContainer) {
    if (gymsContainer) {
      gymsContainer.style.display = "none";
    }
  }

  /**
   * Update the active state of tabs
   * @param {boolean} gymsActive - Whether gyms tab should be active
   */
  function updateTabActiveState(gymsActive) {
    const gymsTab = document.getElementById("gyms-tab");
    const allTabs = document.querySelectorAll(".second-level-menu-list li a");

    // Remove active state from all tabs
    allTabs.forEach((tab) => {
      tab.classList.remove("gyms-tab-active");
    });

    // Add active state to gyms tab if active
    if (gymsActive && gymsTab) {
      const gymsLink = gymsTab.querySelector("a");
      if (gymsLink) {
        gymsLink.classList.add("gyms-tab-active");
      }
    }
  }

  /**
   * Add click handlers to other tabs to hide gyms content when clicked
   */
  function setupTabClickHandlers() {
    const tabs = document.querySelectorAll(".second-level-menu-list li a");
    tabs.forEach((tab) => {
      if (tab.closest("#gyms-tab")) return; // Skip the gyms tab

      tab.addEventListener("click", () => {
        toggleContent(false);
      });
    });
  }

  // Attach to global namespace
  if (!window.GymsExtension) window.GymsExtension = {};
  if (!window.GymsExtension.ui) window.GymsExtension.ui = {};

  window.GymsExtension.ui.tabManager = {
    toggleContent,
    updateTabActiveState,
    setupTabClickHandlers,
  };
})();
