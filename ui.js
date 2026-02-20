/**
 * UI Module - Main Orchestrator
 * Single Responsibility: Exports a unified UI interface by composing specialized modules
 *
 * This module follows the Facade pattern to provide a simple interface to the
 * more complex subsystem of UI modules (domUtils, stateRenderer, tableRenderer, tabManager)
 */
(function () {
  "use strict";

  // Ensure namespace exists (should already exist from sub-modules)
  if (!window.GymsExtension) {
    window.GymsExtension = {};
  }

  if (!window.GymsExtension.ui) {
    window.GymsExtension.ui = {};
  }

  const ui = window.GymsExtension.ui;

  /**
   * Add facade methods to the existing ui namespace
   * This provides a simplified interface while preserving the sub-module structure
   *
   * Loading order (from manifest.json):
   * 1. ui/dom-utils.js     -> attaches ui.domUtils
   * 2. ui/state-renderer.js -> attaches ui.stateRenderer
   * 3. ui/table-renderer.js -> attaches ui.tableRenderer
   * 4. ui/tab-manager.js    -> attaches ui.tabManager
   * 5. ui.js (this file)    -> adds facade methods directly to ui
   */

  // DOM Utilities - Element finding and creation
  ui.findNavigationMenu = () => ui.domUtils.findNavigationMenu();
  ui.createGymsTab = (onClick) => ui.domUtils.createGymsTab(onClick);
  ui.createGymsContainer = () => ui.domUtils.createGymsContainer();

  // State Rendering - Different UI states
  ui.renderLoading = (container) => ui.stateRenderer.renderLoading(container);
  ui.renderError = (container, message) =>
    ui.stateRenderer.renderError(container, message);
  ui.renderEmpty = (container, username) =>
    ui.stateRenderer.renderEmpty(container, username);

  // Table Rendering - Main data display
  ui.renderGymsTable = (container, gyms, currentSort, onSort) =>
    ui.tableRenderer.renderGymsTable(container, gyms, currentSort, onSort);

  // Tab Management - Content visibility and navigation
  ui.toggleContent = (showGyms) => ui.tabManager.toggleContent(showGyms);
  ui.updateTabActiveState = (gymsActive) =>
    ui.tabManager.updateTabActiveState(gymsActive);
  ui.setupTabClickHandlers = () => ui.tabManager.setupTabClickHandlers();
})();
