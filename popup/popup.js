// CF Gym Lens Extension Popup

document.addEventListener("DOMContentLoaded", () => {
  const elements = {
    toggle: document.getElementById("theme-toggle"),
    card: document.getElementById("info-card"),
    moonIcon: document.querySelector(".moon-icon"),
    sunIcon: document.querySelector(".sun-icon"),
    root: [document.documentElement, document.body],
  };

  let isDark = false;

  const browserAPI = typeof browser !== "undefined" ? browser : chrome;

  const storage = {
    get: () =>
      browserAPI.storage.local.get(["theme"]).then((r) => r.theme === "dark"),

    set: (isDark) =>
      browserAPI.storage.local.set({ theme: isDark ? "dark" : "light" }),
  };

  const applyTheme = (isDark) => {
    const method = isDark ? "add" : "remove";
    elements.root.forEach((el) => el.classList[method]("dark"));
    elements.card.classList.toggle("dark", isDark);
    elements.card.classList.toggle("light", !isDark);
    elements.toggle.classList.toggle("dark", isDark);
    elements.toggle.classList.toggle("light", !isDark);
    elements.moonIcon.style.display = isDark ? "none" : "block";
    elements.sunIcon.style.display = isDark ? "block" : "none";
  };

  const toggleTheme = () => {
    isDark = !isDark;
    applyTheme(isDark);
    storage.set(isDark);
  };

  elements.toggle.addEventListener("click", toggleTheme);
  storage.get().then((isDarkFromStorage) => {
    isDark = isDarkFromStorage;
    applyTheme(isDark);
  });
});
