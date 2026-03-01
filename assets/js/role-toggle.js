document.addEventListener("DOMContentLoaded", initializeApp);

async function initializeApp() {
  // 1. Load the components modularly
  await loadComponent("components/sidebar.html", "sidebar-container");
  await loadComponent("components/topbar.html", "topbar-container");
  await loadComponent("pages/dashboard.html", "main-content");

  // 2. Initialize the role toggle simulation once DOM is ready
  setupRoleToggle();
  setupNavigation();
  setDefaultActive();
}

/**
 * Fetches HTML from a file and inserts it into a container ID
 */
async function loadComponent(url, containerId) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const html = await response.text();
    document.getElementById(containerId).innerHTML = html;
  } catch (error) {
    console.error(`Error loading ${url}:`, error);
    // Fallback warning for users running without a local web server
    document.getElementById(containerId).innerHTML = `
            <div class="p-4 m-4 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                <b>Rendering Issue:</b> Could not load <code>${url}</code>.<br>
                Please ensure you are opening this prototype via a local web server (e.g., VS Code Live Server, XAMPP) due to browser CORS policies for local files.
            </div>`;
  }
}

/**
 * Binds the dropdown in the Topbar to the Sidebar items filtering
 */
function setupRoleToggle() {
  const roleSelector = document.getElementById("role-selector");

  if (roleSelector) {
    // Run once on load based on default selected value
    updateSidebarVisibility(roleSelector.value);

    // Listen for changes
    roleSelector.addEventListener("change", (e) => {
      updateSidebarVisibility(e.target.value);
    });
  }
}

/**
 * Smoothly toggles classes to prevent render/layout issues
 */
function updateSidebarVisibility(activeRole) {
  const roleBasedElements = document.querySelectorAll("[data-roles]");

  roleBasedElements.forEach((element) => {
    const allowedRoles = element.getAttribute("data-roles");

    if (allowedRoles && allowedRoles.includes(activeRole)) {
      element.classList.remove("hidden");

      // Restore layout safely
      if (element.tagName === "A") {
        element.classList.add("flex");
      } else if (!element.classList.contains("grid")) {
        element.classList.add("block");
      }
    } else {
      element.classList.add("hidden");
      element.classList.remove("flex", "block");
    }
  });
}

function setupNavigation() {
  const navLinks = document.querySelectorAll(".sidebar-item[data-page]");

  navLinks.forEach((link) => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();

      const page = link.getAttribute("data-page");
      if (!page) return;

      // Remove active from ALL links
      document
        .querySelectorAll(".sidebar-item[data-page]")
        .forEach((l) =>
          l.classList.remove("bg-slate-100", "text-slate-900", "font-semibold"),
        );

      // Add active to clicked link
      link.classList.add("bg-slate-100", "text-slate-900", "font-semibold");

      // Load page
      await loadComponent(page, "main-content");

      // Reapply role visibility
      const currentRole = document.getElementById("role-selector").value;
      updateSidebarVisibility(currentRole);
    });
  });
}

function setDefaultActive() {
  const defaultLink = document.querySelector(
    '.sidebar-item[data-page="pages/dashboard.html"]',
  );

  if (defaultLink) {
    defaultLink.classList.add(
      "bg-slate-100",
      "text-slate-900",
      "font-semibold",
    );
  }
}

function simulateScan() {
  const emptyState = document.getElementById("ocr-empty-state");
  const loadingState = document.getElementById("ocr-loading");
  const resultsState = document.getElementById("ocr-results");
  const imagePreview = document.getElementById("image-preview");

  if (!emptyState) return; // Prevent errors if page not loaded

  emptyState.classList.add("hidden");
  resultsState.classList.add("hidden");
  loadingState.classList.remove("hidden");
  imagePreview.classList.remove("hidden");

  setTimeout(() => {
    loadingState.classList.add("hidden");
    resultsState.classList.remove("hidden");
  }, 1500);
}

function resetScan() {
  const emptyState = document.getElementById("ocr-empty-state");
  const resultsState = document.getElementById("ocr-results");
  const imagePreview = document.getElementById("image-preview");

  if (!emptyState) return;

  emptyState.classList.remove("hidden");
  resultsState.classList.add("hidden");
  imagePreview.classList.add("hidden");
}

function viewRecordDetails() {
  // Load the view page dynamically and trigger role update
  loadComponent("pages/view-record.html", "main-content").then(() => {
    const currentRole = document.getElementById("role-selector").value;
    if (typeof updateSidebarVisibility === "function") {
      updateSidebarVisibility(currentRole);
    }
  });
}

function editRecordDetails() {
  loadComponent("pages/edit-record.html", "main-content").then(() => {
    const currentRole = document.getElementById("role-selector").value;
    if (typeof updateSidebarVisibility === "function") {
      updateSidebarVisibility(currentRole);
    }
  });
}

function goBackToRecords() {
  loadComponent("pages/records.html", "main-content").then(() => {
    const currentRole = document.getElementById("role-selector").value;
    if (typeof updateSidebarVisibility === "function") {
      updateSidebarVisibility(currentRole);
    }
  });
}

// Simple logic to handle Modal Open/Close
function openPreviewModal(fileName) {
  const modal = document.getElementById("document-preview-modal");
  const title = document.getElementById("modal-doc-title");

  if (modal && title) {
    title.textContent = fileName;
    modal.classList.remove("hidden");
  }
}

function closePreviewModal() {
  const modal = document.getElementById("document-preview-modal");
  if (modal) {
    modal.classList.add("hidden");
  }
}

// Close modal when clicking outside the box
document
  .getElementById("document-preview-modal")
  .addEventListener("click", function (e) {
    if (e.target === this) {
      closePreviewModal();
    }
  });

function openUserModal() {
  document.getElementById("user-modal").classList.remove("hidden");
}

function closeUserModal() {
  document.getElementById("user-modal").classList.add("hidden");
}

// Close modal on outside click
document.getElementById("user-modal").addEventListener("click", function (e) {
  if (e.target === this) {
    closeUserModal();
  }
});

// Live Preview Logic for TD Number
function updateTdPreview() {
  const prefix = document.getElementById("td-prefix").value || "TD";
  const includeYear = document.getElementById("td-year").checked;
  // Hardcoded year for simulation as requested in context (2026)
  const year = includeYear ? "-2026" : "";
  const sequence = "-0001";

  document.getElementById("td-preview-text").textContent =
    `${prefix}${year}${sequence}`;
}
