// Installable and playable offline. Games live in the browser's storage, the cache never holds one.
// A new version waits until the page agrees to it (offerUpdate in the game), then the page reloads on it.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    let registration;
    try {
      registration = await navigator.serviceWorker.register("./sw.js", { updateViaCache: "none" });
    } catch (error) {
      console.warn("offline play unavailable:", error.message);
      return;
    }
    // The page reloads once, when the version it asked for is active; the first install never reloads it.
    let asked = false;
    const apply = () => {
      const next = registration.waiting;
      if (asked || !next) return;
      asked = true;
      next.addEventListener("statechange", () => next.state === "activated" && location.reload());
      next.postMessage("activate");
    };
    const offer = () => registration.waiting && navigator.serviceWorker.controller && window.offerUpdate?.(apply);
    registration.addEventListener("updatefound", () => registration.installing?.addEventListener("statechange", offer));
    offer();
    // Home-screen apps, on iOS above all, seldom look for a new version on their own.
    const check = () => registration.update().then(offer, () => {});
    document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && check());
    setInterval(check, 30 * 60 * 1000);
  });
}
