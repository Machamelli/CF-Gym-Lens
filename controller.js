(function () {
  "use strict";

  /**
   * Controller class for managing the GYMS tab functionality
   */
  class GymsTabController {
    /**
     * Constructor
     * @param {string} username - User's Codeforces handle
     */
    constructor(username) {
      this.username = username;
      this.gymsContainer = null;
      this.gymsTab = null;
      this.isGymsActive = false;
      this.dataLoaded = false;
      this.gymsData = [];
      this.currentSort = { column: "recent", direction: "desc" }; // Default: recent submission
    }

    /**
     * Sort gyms data by column
     * @param {string} column - Column to sort by
     */
    sortGyms(column) {
      // Toggle direction if same column, otherwise start with ascending
      if (this.currentSort.column === column) {
        this.currentSort.direction =
          this.currentSort.direction === "asc" ? "desc" : "asc";
      } else {
        this.currentSort.column = column;
        this.currentSort.direction = "asc";
      }

      // Use utility function for sorting
      const sortedGyms = window.GymsExtension.utils.sortGymsData(
        this.gymsData,
        this.currentSort.column,
        this.currentSort.direction,
      );

      window.GymsExtension.ui.renderGymsTable(
        this.gymsContainer,
        sortedGyms,
        this.currentSort,
        (col) => this.sortGyms(col),
      );
    }

    /**
     * Initialize the tab and container
     * @returns {boolean} True if initialization successful
     */
    init() {
      const menu = window.GymsExtension.ui.findNavigationMenu();
      if (!menu) {
        console.error(
          "CF Gym Lens: Unable to find navigation menu. The page structure may have changed.",
        );
        return false;
      }

      // Create and add the gyms tab
      this.gymsTab = window.GymsExtension.ui.createGymsTab(() =>
        this.handleTabClick(),
      );
      menu.appendChild(this.gymsTab);

      // Create the gyms container
      this.gymsContainer = window.GymsExtension.ui.createGymsContainer();

      // Insert container into page
      const pageContent = document.getElementById("pageContent");
      if (pageContent) {
        pageContent.appendChild(this.gymsContainer);
      } else {
        document.body.appendChild(this.gymsContainer);
      }

      // Setup click handlers for other tabs
      window.GymsExtension.ui.setupTabClickHandlers();

      return true;
    }

    /**
     * Handle tab click to toggle GYMS view
     */
    async handleTabClick() {
      if (this.isGymsActive) {
        // Already showing gyms, toggle back to original
        this.isGymsActive = false;
        window.GymsExtension.ui.toggleContent(false);
        return;
      }

      this.isGymsActive = true;
      window.GymsExtension.ui.toggleContent(true);

      if (!this.dataLoaded) {
        await this.loadGymsData();
      }
    }

    /**
     * Load and render gym data
     */
    async loadGymsData() {
      window.GymsExtension.ui.renderLoading(this.gymsContainer);

      try {
        const gyms = await window.GymsExtension.data.getGymsData(this.username);
        await window.GymsExtension.data.fetchProblemCounts(gyms);

        // Store gyms data for sorting
        this.gymsData = gyms;

        if (gyms.length === 0) {
          window.GymsExtension.ui.renderEmpty(
            this.gymsContainer,
            this.username,
          );
        } else {
          window.GymsExtension.ui.renderGymsTable(
            this.gymsContainer,
            gyms,
            this.currentSort,
            (col) => this.sortGyms(col),
          );
        }

        this.dataLoaded = true;

        // Setup retry button if error
        const retryBtn = document.getElementById("gyms-retry-btn");
        if (retryBtn) {
          retryBtn.addEventListener("click", () => {
            this.dataLoaded = false;
            this.loadGymsData();
          });
        }
      } catch (error) {
        console.error("CF Gym Lens: Failed to load gym data", error);
        window.GymsExtension.ui.renderError(this.gymsContainer, error.message);

        // Setup retry button
        const retryBtn = document.getElementById("gyms-retry-btn");
        if (retryBtn) {
          retryBtn.addEventListener("click", () => this.loadGymsData());
        }
      }
    }
  }

  /**
   * Initialize the extension on page load
   */
  function initExtension() {
    const username = window.GymsExtension.utils.getUsernameFromURL();
    if (!username) {
      console.error(
        "CF Gym Lens: Could not extract username from URL. Please ensure you're on a Codeforces profile page.",
      );
      return;
    }

    const controller = new GymsTabController(username);
    controller.init();
  }

  // Attach to global
  window.GymsExtension.controller = {
    GymsTabController,
    initExtension,
  };
})();
