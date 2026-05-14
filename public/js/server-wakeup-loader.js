(function serverWakeupLoader() {
  const statusMessages = [
    "Allocating rooms...",
    "Checking attendance...",
    "Connecting database...",
    "Preparing dashboard...",
    "Starting services...",
    "Fetching hostel records..."
  ];

  const LOADER_ID = "hms-server-loader";
  const POLL_MS = 2400;
  const FETCH_TIMEOUT_MS = 4500;
  const FADE_OUT_MS = 650;

  const createLoader = () => {
    const wrapper = document.createElement("div");
    wrapper.id = LOADER_ID;
    wrapper.className = "hms-loader";
    wrapper.innerHTML = `
      <div class="hms-loader-bg" aria-hidden="true">
        <span class="hms-loader-light one"></span>
        <span class="hms-loader-light two"></span>
        <span class="hms-loader-grid"></span>
      </div>
      <section class="hms-loader-card" role="status" aria-live="polite" aria-label="Server is waking up">
        <div class="hms-loader-brand">
          <span class="hms-loader-logo" aria-hidden="true">🏠</span>
          <strong>HostelMS</strong>
        </div>
        <div class="hms-loader-orb-wrap" aria-hidden="true">
          <div class="hms-loader-orb-core"></div>
          <div class="hms-loader-orb-ring ring-a"></div>
          <div class="hms-loader-orb-ring ring-b"></div>
        </div>
        <h1 class="hms-loader-title">Hostel Management System</h1>
        <p class="hms-loader-status">
          <span id="hms-loader-message">Waking up server...</span>
          <span class="hms-loader-dots"><i></i><i></i><i></i></span>
        </p>
        <div class="hms-loader-progress" aria-hidden="true">
          <span class="hms-loader-progress-fill"></span>
        </div>
        <p class="hms-loader-note">Free-tier servers may take a few seconds to start.</p>
      </section>
    `;
    return wrapper;
  };

  const withTimeout = async (promise, timeoutMs) => {
    let timer;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error("timeout")), timeoutMs);
    });
    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      clearTimeout(timer);
    }
  };

  const checkHealth = async () => {
    const response = await withTimeout(
      fetch("/health", {
        method: "GET",
        cache: "no-store"
      }),
      FETCH_TIMEOUT_MS
    );

    if (!response.ok) throw new Error("not-ready");
    return true;
  };

  const start = () => {
    if (document.getElementById(LOADER_ID)) return;

    const loader = createLoader();
    document.body.appendChild(loader);
    document.body.classList.add("hms-loader-active");

    const messageNode = loader.querySelector("#hms-loader-message");
    let messageIndex = 0;
    const messageTimer = setInterval(() => {
      messageIndex = (messageIndex + 1) % statusMessages.length;
      if (messageNode) messageNode.textContent = statusMessages[messageIndex];
    }, 2600);

    let disposed = false;
    const dispose = () => {
      if (disposed) return;
      disposed = true;
      clearInterval(messageTimer);
      clearInterval(pollTimer);
      loader.classList.add("is-ready");
      setTimeout(() => {
        loader.remove();
        document.body.classList.remove("hms-loader-active");
      }, FADE_OUT_MS);
    };

    const poll = async () => {
      try {
        await checkHealth();
        dispose();
      } catch (error) {
        // keep polling until backend wakes up
      }
    };

    const pollTimer = setInterval(poll, POLL_MS);
    poll();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
