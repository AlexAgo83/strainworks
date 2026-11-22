// Installable and playable offline. Games live in the browser's storage, the cache never holds one.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js", { updateViaCache: "none" }).catch((error) => console.warn("offline play unavailable:", error.message));
  });
}
