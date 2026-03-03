document.addEventListener("DOMContentLoaded", initializeApp);

async function initializeApp() {
  showGlobalLoader();
  
  try {
    await Promise.all([
      loadComponent("components/sidebar.html", "sidebar-container"),
      loadComponent("components/topbar.html", "topbar-container")
    ]);
    
    await loadComponent("pages/dashboard.html", "main-content");
    
    setupRoleToggle();
    setupNavigation();
    setupKeyboardShortcuts();
    setDefaultActive();
    
    setTimeout(hideGlobalLoader, 400);
    
  } catch (error) {
    console.error("Initialization error:", error);
    hideGlobalLoader();
  }
}

function showGlobalLoader() {
  const loader = document.getElementById("global-loader");
  if (loader) {
    loader.classList.remove("opacity-0", "pointer-events-none");
  }
}

function hideGlobalLoader() {
  const loader = document.getElementById("global-loader");
  if (loader) {
    loader.classList.add("opacity-0", "pointer-events-none");
  }
}

async function loadComponent(url, containerId) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const html = await response.text();
    
    const container = document.getElementById(containerId);
    container.innerHTML = html;
    
    // Add entrance animation
    if (containerId === "main-content") {
      container.classList.add("animate-fade-in");
      setTimeout(() => container.classList.remove("animate-fade-in"), 300);
    }
    
  } catch (error) {
    console.error(`Error loading ${url}:`, error);
    document.getElementById(containerId).innerHTML = `
      <div class="p-6 m-4 bg-red-50 border border-red-200 rounded-2xl animate-slide-in">
        <div class="flex items-center gap-3 text-red-600 mb-2">
          <i class="ph ph-warning-circle text-xl"></i>
          <span class="font-bold">Error loading component</span>
        </div>
        <p class="text-sm text-red-600/80">Could not load ${url}</p>
      </div>`;
  }
}

function setupRoleToggle() {
  const roleSelector = document.getElementById("role-selector");
  if (!roleSelector) return;

  updateSidebarVisibility(roleSelector.value);
  updateRoleButtons(roleSelector.value);

  roleSelector.addEventListener("change", (e) => {
    const sidebar = document.getElementById("sidebar-menu");
    sidebar.style.opacity = "0.5";
    
    setTimeout(() => {
      updateSidebarVisibility(e.target.value);
      updateRoleButtons(e.target.value);
      sidebar.style.opacity = "1";
    }, 150);
  });
}

function setRole(role) {
  const roleSelector = document.getElementById("role-selector");
  const sidebar = document.getElementById("sidebar-menu");

  if (roleSelector) roleSelector.value = role;
  if (sidebar) sidebar.style.opacity = "0.5";

  setTimeout(() => {
    updateSidebarVisibility(role);
    updateRoleButtons(role);
    if (sidebar) sidebar.style.opacity = "1";
  }, 150);
}

function updateRoleButtons(activeRole) {
  document.querySelectorAll(".role-btn").forEach((btn) => {
    const isActive = btn.getAttribute("data-role") === activeRole;
    if (isActive) {
      btn.classList.add("bg-white", "text-gray-900", "shadow-sm");
      btn.classList.remove("text-gray-500");
    } else {
      btn.classList.remove("bg-white", "text-gray-900", "shadow-sm");
      btn.classList.add("text-gray-500");
    }
  });
}

function updateSidebarVisibility(activeRole) {
  const roleBasedElements = document.querySelectorAll("[data-roles]");

  roleBasedElements.forEach((element) => {
    const allowedRoles = element.getAttribute("data-roles");
    const shouldShow = allowedRoles && allowedRoles.includes(activeRole);
    
    if (shouldShow) {
      element.classList.remove("hidden");
      element.classList.add("animate-slide-in");
      if (element.tagName === "A") element.classList.add("flex");
    } else {
      element.classList.add("hidden");
      element.classList.remove("flex", "block", "animate-slide-in");
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

      updateActiveNav(link);
      showGlobalLoader();
      
      await loadComponent(page, "main-content");
      
      const currentRole = document.getElementById("role-selector")?.value;
      if (currentRole) updateSidebarVisibility(currentRole);
      
      hideGlobalLoader();
    });
  });
}

function updateActiveNav(activeLink) {
  document.querySelectorAll(".sidebar-item[data-page]").forEach((link) => {
    link.classList.remove("bg-white/10", "text-white", "border-l-2", "border-white");
    link.classList.add("text-gray-300");
    
    const icon = link.querySelector("i");
    if (icon) {
      icon.classList.remove("text-white");
      icon.classList.add("text-gray-400");
    }
  });

  activeLink.classList.remove("text-gray-300");
  activeLink.classList.add("bg-white/10", "text-white", "border-l-2", "border-white");
  
  const icon = activeLink.querySelector("i");
  if (icon) {
    icon.classList.remove("text-gray-400");
    icon.classList.add("text-white");
  }
}

function setDefaultActive() {
  const defaultLink = document.querySelector('.sidebar-item[data-page="pages/dashboard.html"]');
  if (defaultLink) updateActiveNav(defaultLink);
}

function setupKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      document.querySelector('input[type="text"]')?.focus();
    }
    if (e.key === "Escape") {
      closePreviewModal();
      closeUserModal();
    }
  });
}

// Modal functions
function openPreviewModal(fileName) {
  const modal = document.getElementById("document-preview-modal");
  const title = document.getElementById("modal-doc-title");
  if (modal && title) {
    title.textContent = fileName;
    modal.classList.remove("hidden");
    modal.querySelector(".modal-content")?.classList.add("animate-scale-in");
  }
}

function closePreviewModal() {
  const modal = document.getElementById("document-preview-modal");
  if (modal) modal.classList.add("hidden");
}

function openUserModal() {
  const modal = document.getElementById("user-modal");
  if (modal) {
    modal.classList.remove("hidden");
    modal.querySelector(".modal-content")?.classList.add("animate-scale-in");
  }
}

function closeUserModal() {
  const modal = document.getElementById("user-modal");
  if (modal) modal.classList.add("hidden");
}

document.addEventListener("click", (e) => {
  const previewModal = document.getElementById("document-preview-modal");
  const userModal = document.getElementById("user-modal");
  if (e.target === previewModal) closePreviewModal();
  if (e.target === userModal) closeUserModal();
});

// Page navigation helpers
function viewRecordDetails() {
  showGlobalLoader();
  loadComponent("pages/view-record.html", "main-content").then(() => {
    hideGlobalLoader();
  });
}

function editRecordDetails() {
  showGlobalLoader();
  loadComponent("pages/edit-record.html", "main-content").then(() => {
    hideGlobalLoader();
  });
}

function goBackToRecords() {
  showGlobalLoader();
  loadComponent("pages/records.html", "main-content").then(() => {
    const recordsLink = document.querySelector('[data-page="pages/records.html"]');
    if (recordsLink) updateActiveNav(recordsLink);
    hideGlobalLoader();
  });
}

// Scan simulation
function simulateScan() {
  const emptyState = document.getElementById("ocr-empty-state");
  const loadingState = document.getElementById("ocr-loading");
  const resultsState = document.getElementById("ocr-results");
  
  if (emptyState) emptyState.classList.add("hidden");
  if (resultsState) resultsState.classList.add("hidden");
  if (loadingState) {
    loadingState.classList.remove("hidden");
    loadingState.classList.add("animate-fade-in");
  }
  
  setTimeout(() => {
    if (loadingState) loadingState.classList.add("hidden");
    if (resultsState) {
      resultsState.classList.remove("hidden");
      resultsState.classList.add("animate-slide-in");
    }
  }, 2000);
}

function resetScan() {
  const emptyState = document.getElementById("ocr-empty-state");
  const resultsState = document.getElementById("ocr-results");
  
  if (resultsState) resultsState.classList.add("hidden");
  if (emptyState) {
    emptyState.classList.remove("hidden");
    emptyState.classList.add("animate-fade-in");
  }
}

// Live preview
function updateTdPreview() {
  const prefix = document.getElementById("td-prefix")?.value || "TD";
  const includeYear = document.getElementById("td-year")?.checked;
  const year = includeYear ? "-2026" : "";
  const previewText = document.getElementById("td-preview-text");
  if (previewText) {
    previewText.textContent = `${prefix}${year}-0001`;
    previewText.classList.add("scale-105");
    setTimeout(() => previewText.classList.remove("scale-105"), 200);
  }
}

document.addEventListener("DOMContentLoaded", initializeApp);

// Mobile state
let mobileSidebarOpen = false;
let mobileSearchOpen = false;

async function initializeApp() {
  showGlobalLoader();
  
  try {
    await Promise.all([
      loadComponent("components/sidebar.html", "sidebar-container"),
      loadComponent("components/topbar.html", "topbar-container")
    ]);
    
    await loadComponent("pages/dashboard.html", "main-content");
    
    setupRoleToggle();
    setupNavigation();
    setupKeyboardShortcuts();
    setupMobileHandlers();
    setDefaultActive();
    
    setTimeout(hideGlobalLoader, 400);
    
  } catch (error) {
    console.error("Initialization error:", error);
    hideGlobalLoader();
  }
}

// Mobile Sidebar Toggle
function toggleMobileSidebar() {
  const sidebar = document.getElementById("sidebar-container");
  const overlay = document.getElementById("mobile-overlay");
  
  mobileSidebarOpen = !mobileSidebarOpen;
  
  if (mobileSidebarOpen) {
    sidebar?.classList.add("mobile-open");
    if (!overlay) {
      createMobileOverlay();
    } else {
      overlay.classList.add("active");
    }
    document.body.style.overflow = "hidden";
  } else {
    sidebar?.classList.remove("mobile-open");
    overlay?.classList.remove("active");
    document.body.style.overflow = "";
  }
}

// Mobile Search Toggle
function toggleMobileSearch() {
  const searchDropdown = document.getElementById("mobile-search-dropdown");
  const searchIcon = document.getElementById("mobile-search-icon");
  
  mobileSearchOpen = !mobileSearchOpen;
  
  if (mobileSearchOpen) {
    searchDropdown?.classList.remove("hidden");
    searchIcon?.classList.replace("ph-magnifying-glass", "ph-x");
    // Focus the input after animation
    setTimeout(() => {
      searchDropdown?.querySelector("input")?.focus();
    }, 100);
  } else {
    searchDropdown?.classList.add("hidden");
    searchIcon?.classList.replace("ph-x", "ph-magnifying-glass");
  }
}

// Create mobile overlay
function createMobileOverlay() {
  const overlay = document.createElement("div");
  overlay.id = "mobile-overlay";
  overlay.className = "mobile-sidebar-overlay";
  overlay.onclick = toggleMobileSidebar;
  document.body.appendChild(overlay);
  
  // Trigger animation
  requestAnimationFrame(() => {
    overlay.classList.add("active");
  });
}

// Setup mobile event handlers
function setupMobileHandlers() {
  // Close mobile sidebar when clicking a nav link
  document.querySelectorAll(".sidebar-item[data-page]").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth < 1024 && mobileSidebarOpen) {
        toggleMobileSidebar();
      }
    });
  });
  
  // Close mobile search when clicking outside
  document.addEventListener("click", (e) => {
    const searchDropdown = document.getElementById("mobile-search-dropdown");
    const searchToggle = e.target.closest(".mobile-search-toggle");
    
    if (mobileSearchOpen && searchDropdown && !searchDropdown.contains(e.target) && !searchToggle) {
      toggleMobileSearch();
    }
  });
  
  // Handle window resize
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024 && mobileSidebarOpen) {
      toggleMobileSidebar();
    }
    if (window.innerWidth >= 768 && mobileSearchOpen) {
      toggleMobileSearch();
    }
  });
  
  // Handle escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (mobileSidebarOpen) toggleMobileSidebar();
      if (mobileSearchOpen) toggleMobileSearch();
    }
  });
}

function showGlobalLoader() {
  const loader = document.getElementById("global-loader");
  if (loader) {
    loader.classList.remove("opacity-0", "pointer-events-none");
  }
}

function hideGlobalLoader() {
  const loader = document.getElementById("global-loader");
  if (loader) {
    loader.classList.add("opacity-0", "pointer-events-none");
  }
}

async function loadComponent(url, containerId) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const html = await response.text();
    
    const container = document.getElementById(containerId);
    container.innerHTML = html;
    
    // Add entrance animation
    if (containerId === "main-content") {
      container.classList.add("animate-fade-in");
      setTimeout(() => container.classList.remove("animate-fade-in"), 300);
    }
    
  } catch (error) {
    console.error(`Error loading ${url}:`, error);
    document.getElementById(containerId).innerHTML = `
      <div class="p-6 m-4 bg-red-50 border border-red-200 rounded-2xl animate-slide-in">
        <div class="flex items-center gap-3 text-red-600 mb-2">
          <i class="ph ph-warning-circle text-xl"></i>
          <span class="font-bold">Error loading component</span>
        </div>
        <p class="text-sm text-red-600/80">Could not load ${url}</p>
      </div>`;
  }
}

function setupRoleToggle() {
  const roleSelector = document.getElementById("role-selector");
  if (!roleSelector) return;

  updateSidebarVisibility(roleSelector.value);
  updateRoleButtons(roleSelector.value);

  roleSelector.addEventListener("change", (e) => {
    const sidebar = document.getElementById("sidebar-menu");
    sidebar.style.opacity = "0.5";
    
    setTimeout(() => {
      updateSidebarVisibility(e.target.value);
      updateRoleButtons(e.target.value);
      sidebar.style.opacity = "1";
    }, 150);
  });
}

function setRole(role) {
  const roleSelector = document.getElementById("role-selector");
  const sidebar = document.getElementById("sidebar-menu");

  if (roleSelector) roleSelector.value = role;
  if (sidebar) sidebar.style.opacity = "0.5";

  setTimeout(() => {
    updateSidebarVisibility(role);
    updateRoleButtons(role);
    if (sidebar) sidebar.style.opacity = "1";
  }, 150);
}

function updateRoleButtons(activeRole) {
  document.querySelectorAll(".role-btn").forEach((btn) => {
    const isActive = btn.getAttribute("data-role") === activeRole;
    if (isActive) {
      btn.classList.add("bg-white", "text-gray-900", "shadow-sm");
      btn.classList.remove("text-gray-500");
    } else {
      btn.classList.remove("bg-white", "text-gray-900", "shadow-sm");
      btn.classList.add("text-gray-500");
    }
  });
}

function updateSidebarVisibility(activeRole) {
  const roleBasedElements = document.querySelectorAll("[data-roles]");

  roleBasedElements.forEach((element) => {
    const allowedRoles = element.getAttribute("data-roles");
    const shouldShow = allowedRoles && allowedRoles.includes(activeRole);
    
    if (shouldShow) {
      element.classList.remove("hidden");
      element.classList.add("animate-slide-in");
      if (element.tagName === "A") element.classList.add("flex");
    } else {
      element.classList.add("hidden");
      element.classList.remove("flex", "block", "animate-slide-in");
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

      updateActiveNav(link);
      showGlobalLoader();
      
      await loadComponent(page, "main-content");
      
      const currentRole = document.getElementById("role-selector")?.value;
      if (currentRole) updateSidebarVisibility(currentRole);
      
      hideGlobalLoader();
    });
  });
}

function updateActiveNav(activeLink) {
  document.querySelectorAll(".sidebar-item[data-page]").forEach((link) => {
    link.classList.remove("bg-white/10", "text-white", "border-l-2", "border-white");
    link.classList.add("text-gray-300");
    
    const icon = link.querySelector("i");
    if (icon) {
      icon.classList.remove("text-white");
      icon.classList.add("text-gray-400");
    }
  });

  activeLink.classList.remove("text-gray-300");
  activeLink.classList.add("bg-white/10", "text-white", "border-l-2", "border-white");
  
  const icon = activeLink.querySelector("i");
  if (icon) {
    icon.classList.remove("text-gray-400");
    icon.classList.add("text-white");
  }
}

function setDefaultActive() {
  const defaultLink = document.querySelector('.sidebar-item[data-page="pages/dashboard.html"]');
  if (defaultLink) updateActiveNav(defaultLink);
}

function setupKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      // Focus appropriate search based on viewport
      if (window.innerWidth < 768) {
        toggleMobileSearch();
      } else {
        document.querySelector('input[type="text"]')?.focus();
      }
    }
    if (e.key === "Escape") {
      closePreviewModal();
      closeUserModal();
    }
  });
}

// Modal functions
function openPreviewModal(fileName) {
  const modal = document.getElementById("document-preview-modal");
  const title = document.getElementById("modal-doc-title");
  if (modal && title) {
    title.textContent = fileName;
    modal.classList.remove("hidden");
    modal.querySelector(".modal-content")?.classList.add("animate-scale-in");
  }
}

function closePreviewModal() {
  const modal = document.getElementById("document-preview-modal");
  if (modal) modal.classList.add("hidden");
}

function openUserModal() {
  const modal = document.getElementById("user-modal");
  if (modal) {
    modal.classList.remove("hidden");
    modal.querySelector(".modal-content")?.classList.add("animate-scale-in");
  }
}

function closeUserModal() {
  const modal = document.getElementById("user-modal");
  if (modal) modal.classList.add("hidden");
}

document.addEventListener("click", (e) => {
  const previewModal = document.getElementById("document-preview-modal");
  const userModal = document.getElementById("user-modal");
  if (e.target === previewModal) closePreviewModal();
  if (e.target === userModal) closeUserModal();
});

// Page navigation helpers
function viewRecordDetails() {
  showGlobalLoader();
  loadComponent("pages/view-record.html", "main-content").then(() => {
    hideGlobalLoader();
  });
}

function editRecordDetails() {
  showGlobalLoader();
  loadComponent("pages/edit-record.html", "main-content").then(() => {
    hideGlobalLoader();
  });
}

function goBackToRecords() {
  showGlobalLoader();
  loadComponent("pages/records.html", "main-content").then(() => {
    const recordsLink = document.querySelector('[data-page="pages/records.html"]');
    if (recordsLink) updateActiveNav(recordsLink);
    hideGlobalLoader();
  });
}

// Scan simulation
function simulateScan() {
  const emptyState = document.getElementById("ocr-empty-state");
  const loadingState = document.getElementById("ocr-loading");
  const resultsState = document.getElementById("ocr-results");
  
  if (emptyState) emptyState.classList.add("hidden");
  if (resultsState) resultsState.classList.add("hidden");
  if (loadingState) {
    loadingState.classList.remove("hidden");
    loadingState.classList.add("animate-fade-in");
  }
  
  setTimeout(() => {
    if (loadingState) loadingState.classList.add("hidden");
    if (resultsState) {
      resultsState.classList.remove("hidden");
      resultsState.classList.add("animate-slide-in");
    }
  }, 2000);
}

function resetScan() {
  const emptyState = document.getElementById("ocr-empty-state");
  const resultsState = document.getElementById("ocr-results");
  
  if (resultsState) resultsState.classList.add("hidden");
  if (emptyState) {
    emptyState.classList.remove("hidden");
    emptyState.classList.add("animate-fade-in");
  }
}

// Live preview
function updateTdPreview() {
  const prefix = document.getElementById("td-prefix")?.value || "TD";
  const includeYear = document.getElementById("td-year")?.checked;
  const year = includeYear ? "-2026" : "";
  const previewText = document.getElementById("td-preview-text");
  if (previewText) {
    previewText.textContent = `${prefix}${year}-0001`;
    previewText.classList.add("scale-105");
    setTimeout(() => previewText.classList.remove("scale-105"), 200);
  }
}

// Dark Mode Functions
function initializeDarkMode() {
  // Check for saved preference or system preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  });
}

function toggleDarkMode() {
  const html = document.documentElement;
  const isDark = html.classList.toggle('dark');
  
  // Save preference
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  
  // Update role buttons to match new theme
  const currentRole = document.getElementById('role-selector')?.value;
  if (currentRole) {
    setTimeout(() => updateRoleButtons(currentRole), 10);
  }
  
  // Dispatch custom event for other components
  html.dispatchEvent(new CustomEvent('themechange', { 
    detail: { theme: isDark ? 'dark' : 'light' } 
  }));
}

// Initialize dark mode on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeDarkMode);
} else {
  initializeDarkMode();
}