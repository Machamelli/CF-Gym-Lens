(function () {
  "use strict";

  // ==================== Initialization ====================

  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () =>
      window.GymsExtension.controller.initExtension(),
    );
  } else {
    // Small delay to ensure Codeforces JS has finished rendering
    setTimeout(() => window.GymsExtension.controller.initExtension(), 100);
  }
})();
