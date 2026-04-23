// Globální objekty pro správu timeoutů napříč všemi dropdowny
window.dropdownTimeouts = window.dropdownTimeouts || {};
window.autoHideTimeouts = window.autoHideTimeouts || {};

document.addEventListener("DOMContentLoaded", function () {
  createStickyHeader();

  initStickyHeaderFunctionality();
});

function clearAllDropdownStates() {
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("sticky_menu_") && key.endsWith("_open")) {
      localStorage.removeItem(key);
    }
    if (key.startsWith("sticky_submenu_") && key.endsWith("_open")) {
      localStorage.removeItem(key);
    }
  });

  if (window.dropdownTimeouts) {
    Object.values(window.dropdownTimeouts).forEach((timeout) => {
      clearTimeout(timeout);
    });
    window.dropdownTimeouts = {};
  }

  if (window.autoHideTimeouts) {
    Object.values(window.autoHideTimeouts).forEach((timeout) => {
      clearTimeout(timeout);
    });
    window.autoHideTimeouts = {};
  }

  const stickyHeader = document.querySelector(".sticky-header");
  if (stickyHeader) {
    const dropdownContents = stickyHeader.querySelectorAll(
      ".dropdown-content, .dropdown-content-second"
    );
    dropdownContents.forEach((content) => {
      content.style.opacity = "0";
      content.style.visibility = "hidden";
      content.style.display = "none";
    });

    const subDropdownContents = stickyHeader.querySelectorAll(
      ".sub-dropdown-content"
    );
    subDropdownContents.forEach((content) => {
      content.style.opacity = "0";
      content.style.visibility = "hidden";
      content.style.display = "none";
    });

    const deadZones = document.querySelectorAll(
      ".sticky-header-dead-zone, .sub-dropdown-dead-zone"
    );
    deadZones.forEach((zone) => {
      zone.style.display = "none";
    });

    const activeToggles = stickyHeader.querySelectorAll(
      ".dropdown-toggle.clicked, .dropdown-toggle-second.clicked"
    );
    activeToggles.forEach((toggle) => {
      toggle.classList.remove("clicked");
    });
    if (window.stickyDropdownStates) {
      Object.keys(window.stickyDropdownStates).forEach((key) => {
        window.stickyDropdownStates[key].isClickOpened = false;
        window.stickyDropdownStates[key].isSubmenuActive = false;
        window.stickyDropdownStates[key].isClosingInProgress = false;
      });
    }
    // Reset všech inline funkcí pro jednotlivé dropdowny
    for (let i = 0; i < 10; i++) {
      if (window[`resetStickyDropdownState_${i}`]) {
        window[`resetStickyDropdownState_${i}`]();
      }
    }
  }
}

function initializeHomeIcon(stickyHeader) {
  const homeIcons = stickyHeader.querySelectorAll(".home-icon");

  homeIcons.forEach((homeIcon) => {
    // Najdeme původní home icon v hlavním headeru pro párování
    const originalHomeIcon = document.querySelector("header .home-icon");

    // Nastavíme tabindex podle původního elementu
    if (originalHomeIcon && originalHomeIcon.hasAttribute("tabindex")) {
      homeIcon.setAttribute(
        "tabindex",
        originalHomeIcon.getAttribute("tabindex")
      );
    } else {
      // Pokud původní nemá tabindex, nastavíme 0 pro normální tab navigaci
      homeIcon.setAttribute("tabindex", "0");
    }

    // Přidáme data-original-index pro správné párování
    const originalElements = document
      .querySelector("header")
      .querySelectorAll("a, button, [tabindex]");
    const originalIndex =
      Array.from(originalElements).indexOf(originalHomeIcon);
    if (originalIndex !== -1) {
      homeIcon.setAttribute("data-original-index", originalIndex);
    }

    // Zachováme původní chování - celý element není klikatelný
    homeIcon.style.cursor = "default";
    homeIcon.style.pointerEvents = "none";

    const imgElement = homeIcon.querySelector("img");

    if (imgElement) {
      imgElement.style.cursor = "pointer";
      imgElement.style.pointerEvents = "auto";

      // Funkce pro navigaci na domovskou stránku
      function navigateHome(e) {
        e.stopPropagation();
        e.preventDefault();

        clearAllDropdownStates();

        function findHomepageUrl() {
          const originalHomeIcon = document.querySelector(
            "header .home-icon[href]"
          );
          if (originalHomeIcon) {
            const href = originalHomeIcon.getAttribute("href") || "";
            return href;
          }

          const possibleHomeLinks = document.querySelectorAll("header a[href]");
          for (let link of possibleHomeLinks) {
            const href = (link.getAttribute("href") || "").replace("/", "");
            if (href === "" || href === "index.html" || href === "index.php") {
              return link.getAttribute("href");
            }
          }

          return "./";
        }

        setTimeout(() => {
          window.location.href = findHomepageUrl();
        }, 50);
      }

      // Event listenery pro klik i klávesnici
      imgElement.addEventListener("click", navigateHome);
      homeIcon.addEventListener("click", navigateHome);

      // Podpora pro klávesnici (Enter a Space)
      homeIcon.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigateHome(e);
        }
      });
    } else {
      console.warn("No IMG element found in home icon");

      // Pokud není IMG element, přidáme event listenery přímo na home icon
      function navigateHome(e) {
        e.stopPropagation();
        e.preventDefault();

        clearAllDropdownStates();

        function findHomepageUrl() {
          const originalHomeIcon = document.querySelector(
            "header .home-icon[href]"
          );
          if (originalHomeIcon) {
            const href = originalHomeIcon.getAttribute("href") || "";
            return href;
          }

          const possibleHomeLinks = document.querySelectorAll("header a[href]");
          for (let link of possibleHomeLinks) {
            const href = (link.getAttribute("href") || "").replace("/", "");
            if (href === "" || href === "index.html" || href === "index.php") {
              return link.getAttribute("href");
            }
          }

          return "./";
        }

        setTimeout(() => {
          window.location.href = findHomepageUrl();
        }, 50);
      }

      homeIcon.addEventListener("click", navigateHome);
      homeIcon.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigateHome(e);
        }
      });
    }
  });
}

function initializeStickyDropdowns() {
  const stickyHeader = document.querySelector(".sticky-header");
  if (!stickyHeader) {
    console.error("Sticky header not found");
    return;
  }

  const stickyDropdowns = stickyHeader.querySelectorAll(".dropdown");

  stickyDropdowns.forEach((dropdown, index) => {
    const dropdownId = `sticky-dropdown-${index}`;

    const toggle = dropdown.querySelector(
      ".dropdown-toggle, .dropdown-toggle-second"
    );
    const content = dropdown.querySelector(
      ".dropdown-content, .dropdown-content-second"
    );

    if (!toggle || !content) {
      console.warn(`Dropdown components not found for dropdown ${index}`);
      return;
    }

    initializeSingleDropdown(toggle, content, dropdownId, index);
  });

  initializeStickySubDropdowns(stickyHeader);
}

function initializeSingleDropdown(
  dropdownToggle,
  dropdownContent,
  dropdownId,
  index
) {
  if (!window.stickyDropdownStates) window.stickyDropdownStates = {};
  const stateKey = `dropdown_${index}`;
  window.stickyDropdownStates[stateKey] = {
    isClickOpened: false,
    isSubmenuActive: false,
    isClosingInProgress: false,
  };
  const timeoutKey = `hideTimeout_${dropdownId}`;
  const animationTimeoutKey = `animationTimeout_${dropdownId}`;
  const inactivityTimeoutKey = `inactivityTimeout_${dropdownId}`;
  const clickInactivityTimeoutKey = `clickInactivityTimeout_${dropdownId}`;

  if (!window.dropdownTimeouts) window.dropdownTimeouts = {};
  if (!window.autoHideTimeouts) window.autoHideTimeouts = {};

  let isClickOpened = false;
  let isSubmenuActive = false;
  let isClosingInProgress = false;
  let repositionTimeoutSticky;
  let mouseX = 0,
    mouseY = 0;

  const inactivityDelay = 2000;
  const clickInactivityDelay = 2000;

  dropdownContent.style.transition =
    "opacity 0.3s ease-in-out, visibility 0.3s ease-in-out";
  dropdownContent.style.opacity = "0";
  dropdownContent.style.visibility = "hidden";
  dropdownContent.style.display = "none";

  // Dead zone element pro plynulý přechod myši mezi toggle a dropdown
  const deadZoneElement = document.createElement("div");
  deadZoneElement.className = `sticky-header-dead-zone sticky-dead-zone-${index}`;
  deadZoneElement.style.position = "absolute";
  deadZoneElement.style.display = "none";
  deadZoneElement.style.zIndex = "1050";
  deadZoneElement.style.backgroundColor = "transparent";
  deadZoneElement.style.pointerEvents = "auto";
  document.body.appendChild(deadZoneElement);

  function clearAllTimeouts() {
    clearTimeout(window.dropdownTimeouts[timeoutKey]);
    clearTimeout(window.dropdownTimeouts[animationTimeoutKey]);
    clearTimeout(window.autoHideTimeouts[inactivityTimeoutKey]);
    clearTimeout(window.autoHideTimeouts[clickInactivityTimeoutKey]);
  }

  // Kontinuální monitoring pozice pro správné umístění dead zone
  function startStickyPositionMonitoring() {
    function updatePositions() {
      if (dropdownContent.style.display === "block") {
        updateDeadZonePosition();
        repositionTimeoutSticky = setTimeout(updatePositions, 100);
      }
    }
    clearTimeout(repositionTimeoutSticky);
    updatePositions();
  }

  function updateDeadZonePosition() {
    if (dropdownContent.style.display === "block") {
      const toggleRect = dropdownToggle.getBoundingClientRect();
      const contentRect = dropdownContent.getBoundingClientRect();

      deadZoneElement.style.left = toggleRect.left + "px";
      deadZoneElement.style.top = toggleRect.bottom + "px";
      deadZoneElement.style.width = toggleRect.width + "px";
      deadZoneElement.style.height =
        Math.max(5, contentRect.top - toggleRect.bottom) + "px";
      deadZoneElement.style.display = "block";
      deadZoneElement.style.pointerEvents = "auto";
      deadZoneElement.style.zIndex = "999";
    }
  }

  function showMenu() {
    clearAllTimeouts();
    isClosingInProgress = false;

    dropdownContent.style.display = "block";

    requestAnimationFrame(() => {
      dropdownContent.style.opacity = "1";
      dropdownContent.style.visibility = "visible";
      updateDeadZonePosition();
      startStickyPositionMonitoring();
    });

    if (isClickOpened) {
      startInactivityTimer();
      localStorage.setItem(`sticky_menu_${index}_open`, "true");
    }
  }

  function hideMenu() {
    clearAllTimeouts();
    clearTimeout(repositionTimeoutSticky);
    isClosingInProgress = true;

    dropdownContent.style.opacity = "0";
    dropdownContent.style.visibility = "hidden";

    window.dropdownTimeouts[animationTimeoutKey] = setTimeout(() => {
      dropdownContent.style.display = "none";
      deadZoneElement.style.display = "none";

      isClickOpened = false;
      isSubmenuActive = false;
      isClosingInProgress = false;
      localStorage.removeItem(`sticky_menu_${index}_open`);
    }, 300);
  }

  // Timer zavře menu po nečinnosti, aby nevisel dropdown stále otevřený
  function startInactivityTimer() {
    clearTimeout(window.autoHideTimeouts[inactivityTimeoutKey]);
    window.autoHideTimeouts[inactivityTimeoutKey] = setTimeout(() => {
      const menuRect = dropdownContent.getBoundingClientRect();
      const toggleRect = dropdownToggle.getBoundingClientRect();

      const isMouseOverMenu =
        mouseX >= menuRect.left &&
        mouseX <= menuRect.right &&
        mouseY >= menuRect.top &&
        mouseY <= menuRect.bottom;

      const isMouseOverToggle =
        mouseX >= toggleRect.left &&
        mouseX <= toggleRect.right &&
        mouseY >= toggleRect.top &&
        mouseY <= toggleRect.bottom;

      if (!isMouseOverMenu && !isMouseOverToggle) {
        hideMenu();
      }
    }, inactivityDelay);
  }

  function startClickInactivityTimer() {
    clearTimeout(window.autoHideTimeouts[clickInactivityTimeoutKey]);
    window.autoHideTimeouts[clickInactivityTimeoutKey] = setTimeout(() => {
      const menuRect = dropdownContent.getBoundingClientRect();
      const toggleRect = dropdownToggle.getBoundingClientRect();

      const isMouseOverMenu =
        mouseX >= menuRect.left &&
        mouseX <= menuRect.right &&
        mouseY >= menuRect.top &&
        mouseY <= menuRect.bottom;

      const isMouseOverToggle =
        mouseX >= toggleRect.left &&
        mouseX <= toggleRect.right &&
        mouseY >= toggleRect.top &&
        mouseY <= toggleRect.bottom;

      if (!isMouseOverMenu && !isMouseOverToggle) {
        hideMenu();
      }
    }, clickInactivityDelay);
  }

  dropdownToggle.addEventListener("mouseenter", function (e) {
    if (isClickOpened) {
      return;
    }

    if (e.target.closest(".sub-dropdown-toggle")) {
      return;
    }

    closeOtherStickyDropdowns(index);

    const allSubDropdowns = dropdownContent.querySelectorAll(
      ".sub-dropdown-content"
    );
    allSubDropdowns.forEach((subContent, subIndex) => {
      if (window[`closeStickySubDropdown_${subIndex}`]) {
        window[`closeStickySubDropdown_${subIndex}`]();
      }
    });

    if (!isClickOpened) {
      requestAnimationFrame(() => {
        showMenu();
      });
    }
  });

  dropdownToggle.addEventListener("mouseleave", function (e) {
    if (isClickOpened) {
      startClickInactivityTimer();
      return;
    }

    const toElement = e.relatedTarget;
    if (
      toElement !== deadZoneElement &&
      !deadZoneElement.contains(toElement) &&
      toElement !== dropdownContent &&
      !dropdownContent.contains(toElement)
    ) {
      window.dropdownTimeouts[timeoutKey] = setTimeout(function () {
        if (!isClickOpened) {
          hideMenu();
        }
      }, 250);
    }
  });

  dropdownToggle.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    clearAllTimeouts();
    isClosingInProgress = false;

    if (dropdownContent.style.opacity === "1" && isClickOpened) {
      hideMenu();
    } else {
      closeOtherStickyDropdowns(index);
      isClickOpened = true;

      dropdownContent.style.display = "block";
      requestAnimationFrame(() => {
        dropdownContent.style.opacity = "1";
        dropdownContent.style.visibility = "visible";

        updateDeadZonePosition();

        localStorage.setItem(`sticky_menu_${index}_open`, "true");
        startInactivityTimer();
        startClickInactivityTimer();
      });
    }
  });

  dropdownContent.addEventListener("mouseenter", function () {
    if (!isClickOpened) {
      clearAllTimeouts();
      dropdownContent.style.display = "block";
      requestAnimationFrame(() => {
        dropdownContent.style.opacity = "1";
        dropdownContent.style.visibility = "visible";
        updateDeadZonePosition();
      });
    } else {
      clearTimeout(window.autoHideTimeouts[clickInactivityTimeoutKey]);
      clearTimeout(window.autoHideTimeouts[inactivityTimeoutKey]);
    }
  });

  dropdownContent.addEventListener("mouseleave", function (e) {
    if (isClickOpened) {
      startClickInactivityTimer();
      return;
    }

    const toElement = e.relatedTarget;

    if (
      toElement !== deadZoneElement &&
      !deadZoneElement.contains(toElement) &&
      toElement !== dropdownToggle &&
      !dropdownToggle.contains(toElement)
    ) {
      window.dropdownTimeouts[timeoutKey] = setTimeout(function () {
        if (!isClickOpened) {
          hideMenu();
        }
      }, 400);
    }
  });

  dropdownContent.addEventListener("mousemove", function () {
    if (isClickOpened) {
      clearTimeout(window.autoHideTimeouts[clickInactivityTimeoutKey]);
      clearTimeout(window.autoHideTimeouts[inactivityTimeoutKey]);
    }
  });

  dropdownContent.addEventListener("click", function () {
    if (isClickOpened) {
      clearTimeout(window.autoHideTimeouts[clickInactivityTimeoutKey]);
      clearTimeout(window.autoHideTimeouts[inactivityTimeoutKey]);
    }
  });

  deadZoneElement.addEventListener("mouseenter", function () {
    if (!isClickOpened) {
      clearAllTimeouts();
      dropdownContent.style.display = "block";
      requestAnimationFrame(() => {
        dropdownContent.style.opacity = "1";
        dropdownContent.style.visibility = "visible";
      });
    }
  });

  deadZoneElement.addEventListener("mouseleave", function (e) {
    if (isClickOpened) return;

    const toElement = e.relatedTarget;
    if (
      toElement !== dropdownToggle &&
      !dropdownToggle.contains(toElement) &&
      toElement !== dropdownContent &&
      !dropdownContent.contains(toElement)
    ) {
      window.dropdownTimeouts[timeoutKey] = setTimeout(() => {
        if (!isClickOpened) {
          hideMenu();
        }
      }, 100);
    }
  });

  document.addEventListener("mousemove", function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.addEventListener("click", function (event) {
    if (
      !dropdownToggle.contains(event.target) &&
      !dropdownContent.contains(event.target) &&
      event.target !== deadZoneElement
    ) {
      hideMenu();
    }
  });

  window[`closeStickyDropdown_${index}`] = function () {
    hideMenu();
  };
  window[`resetStickyDropdownState_${index}`] = function () {
    isClickOpened = false;
    isSubmenuActive = false;
    isClosingInProgress = false;
  };
}

function closeOtherStickyDropdowns(currentIndex) {
  const stickyHeader = document.querySelector(".sticky-header");
  if (!stickyHeader) return;

  const allDropdowns = stickyHeader.querySelectorAll(".dropdown");
  allDropdowns.forEach((dropdown, index) => {
    if (index !== currentIndex) {
      if (window[`closeStickyDropdown_${index}`]) {
        window[`closeStickyDropdown_${index}`]();
      }

      const toggle = dropdown.querySelector(
        ".dropdown-toggle, .dropdown-toggle-second"
      );
      if (toggle) {
        toggle.classList.remove("clicked");
      }
    }
  });
}

function initializeSingleSubDropdown(
  subDropdownToggle,
  subDropdownContent,
  subDropdownId,
  index
) {
  const timeoutKey = `hideSubTimeout_${subDropdownId}`;
  const animationTimeoutKey = `animationSubTimeout_${subDropdownId}`;

  if (!window.dropdownTimeouts) window.dropdownTimeouts = {};

  let isClickOpenedSub = false;
  let isMouseOverMenu = false;
  let isClosingInProgressSub = false;

  subDropdownContent.style.transition =
    "opacity 0.3s ease-in-out, visibility 0.3s ease-in-out";
  subDropdownContent.style.opacity = "0";
  subDropdownContent.style.visibility = "hidden";
  subDropdownContent.style.display = "none";
  subDropdownContent.style.position = "absolute";

  // Sub dead zone pro složitější navigaci v submenu
  const subDeadZone = document.createElement("div");
  subDeadZone.className = `sub-dropdown-dead-zone sub-dead-zone-${index}`;
  subDeadZone.style.position = "absolute";
  subDeadZone.style.display = "none";
  subDeadZone.style.zIndex = "999";
  subDeadZone.style.backgroundColor = "transparent";
  document.body.appendChild(subDeadZone);

  function clearAllSubTimeouts() {
    clearTimeout(window.dropdownTimeouts[timeoutKey]);
    clearTimeout(window.dropdownTimeouts[animationTimeoutKey]);
  }

  // Výpočet pozice dead zone mezi toggle a submenu
  function updateSubDeadZone() {
    if (subDropdownContent.style.display === "block") {
      const toggleRect = subDropdownToggle.getBoundingClientRect();
      const contentRect = subDropdownContent.getBoundingClientRect();

      subDeadZone.style.left = toggleRect.right + "px";
      subDeadZone.style.top = Math.min(toggleRect.top, contentRect.top) + "px";
      subDeadZone.style.width = contentRect.left - toggleRect.right + "px";
      subDeadZone.style.height =
        Math.max(toggleRect.height, contentRect.height) + "px";
      subDeadZone.style.display = "block";
    }
  }

  function showSubMenu() {
    clearAllSubTimeouts();
    isClosingInProgressSub = false;

    subDropdownContent.style.display = "block";
    subDropdownContent.style.visibility = "visible";
    subDropdownContent.style.opacity = "0";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        subDropdownContent.style.opacity = "1";
        updateSubDeadZone();
      });
    });

    if (isClickOpenedSub) {
      localStorage.setItem(`sticky_submenu_${index}_open`, "true");
    }
  }

  function hideSubMenu() {
    clearAllSubTimeouts();
    isClosingInProgressSub = true;

    subDropdownContent.style.opacity = "0";
    subDropdownContent.style.visibility = "hidden";

    window.dropdownTimeouts[animationTimeoutKey] = setTimeout(() => {
      subDropdownContent.style.display = "none";
      subDeadZone.style.display = "none";

      isClickOpenedSub = false;
      isClosingInProgressSub = false;
      localStorage.removeItem(`sticky_submenu_${index}_open`);
    }, 300);
  }

  subDropdownToggle.addEventListener("mouseenter", function (e) {
    e.stopPropagation();
    isMouseOverMenu = true;
    if (!isClickOpenedSub) {
      showSubMenu();
    }
  });

  subDropdownToggle.addEventListener("mouseleave", function (e) {
    isMouseOverMenu = false;
    const toElement = e.relatedTarget;
    if (
      toElement !== subDropdownContent &&
      !subDropdownContent.contains(toElement) &&
      toElement !== subDeadZone
    ) {
      window.dropdownTimeouts[timeoutKey] = setTimeout(() => {
        if (!isClickOpenedSub) {
          hideSubMenu();
        }
      }, 200);
    }
  });

  subDropdownToggle.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    clearAllSubTimeouts();

    if (subDropdownContent.style.opacity === "1" && isClickOpenedSub) {
      hideSubMenu();
    } else {
      isClickOpenedSub = true;
      showSubMenu();
    }
  });

  subDropdownContent.addEventListener("mouseenter", function () {
    isMouseOverMenu = true;
    clearAllSubTimeouts();

    if (isClosingInProgressSub || subDropdownContent.style.opacity !== "1") {
      showSubMenu();
    }
  });

  subDropdownContent.addEventListener("mouseleave", function (e) {
    isMouseOverMenu = false;
    const toElement = e.relatedTarget;
    if (toElement !== subDropdownToggle && toElement !== subDeadZone) {
      window.dropdownTimeouts[timeoutKey] = setTimeout(() => {
        if (!isClickOpenedSub) {
          hideSubMenu();
        }
      }, 200);
    }
  });

  subDeadZone.addEventListener("mouseenter", function () {
    isMouseOverMenu = true;
    clearAllSubTimeouts();

    if (isClosingInProgressSub || subDropdownContent.style.opacity !== "1") {
      showSubMenu();
    }
  });

  subDeadZone.addEventListener("mouseleave", function (e) {
    isMouseOverMenu = false;
    const toElement = e.relatedTarget;
    if (
      toElement !== subDropdownToggle &&
      toElement !== subDropdownContent &&
      !subDropdownContent.contains(toElement)
    ) {
      window.dropdownTimeouts[timeoutKey] = setTimeout(() => {
        if (!isClickOpenedSub) {
          hideSubMenu();
        }
      }, 200);
    }
  });

  document.addEventListener("click", function (event) {
    if (
      !subDropdownToggle.contains(event.target) &&
      !subDropdownContent.contains(event.target) &&
      event.target !== subDeadZone
    ) {
      hideSubMenu();
    }
  });

  window[`closeStickySubDropdown_${index}`] = function () {
    hideSubMenu();
  };
}

function initializeStickySubDropdowns(stickyHeader) {
  const subDropdowns = stickyHeader.querySelectorAll(".sub-dropdown-toggle");

  subDropdowns.forEach((subToggle, index) => {
    const subContent = subToggle.nextElementSibling;
    if (!subContent || !subContent.classList.contains("sub-dropdown-content"))
      return;

    const subDropdownId = `sticky-subdropdown-${index}`;
    initializeSingleSubDropdown(subToggle, subContent, subDropdownId, index);
  });
}

window.initializeStickyDropdowns = initializeStickyDropdowns;
window.clearAllDropdownStates = clearAllDropdownStates;

function initializeStickyBurgerMenu() {
  const stickyHeader = document.querySelector(".sticky-header");
  if (!stickyHeader) {
    console.error("Sticky header not found");
    return;
  }

  const stickyBurgerMenu = stickyHeader.querySelector(".burger-menu");
  if (!stickyBurgerMenu) {
    return;
  }

  const stickyMobileNav = document.getElementById("sticky-mobileNav");
  const stickyMenuOverlay = document.getElementById("sticky-menuOverlay");

  if (!stickyMobileNav || !stickyMenuOverlay) {
    console.error("Sticky mobile navigation elements not found");
    return;
  }

  const stickyCloseButton = stickyMobileNav.querySelector(
    '#closeButton, .close-button, [id*="close"]'
  );

  const newStickyBurgerMenu = stickyBurgerMenu.cloneNode(true);
  stickyBurgerMenu.parentNode.replaceChild(
    newStickyBurgerMenu,
    stickyBurgerMenu
  );

  newStickyBurgerMenu.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    const currentScrollY = window.scrollY;

    clearAllDropdownStates();

    const activeStickyMobileNav = document.getElementById("sticky-mobileNav");
    const activeStickyMenuOverlay =
      document.getElementById("sticky-menuOverlay");

    if (activeStickyMobileNav && activeStickyMenuOverlay) {
      document.body.style.top = `-${currentScrollY}px`;
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      activeStickyMobileNav.classList.add("active");
      activeStickyMenuOverlay.classList.add("active");
      document.body.classList.add("menu-open");
    } else {
      console.error(
        "Could not find sticky mobile navigation elements on click"
      );
    }
  });

  if (stickyCloseButton) {
    const newCloseButton = stickyCloseButton.cloneNode(true);
    stickyCloseButton.parentNode.replaceChild(
      newCloseButton,
      stickyCloseButton
    );

    newCloseButton.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);

      const activeStickyMobileNav = document.getElementById("sticky-mobileNav");
      const activeStickyMenuOverlay =
        document.getElementById("sticky-menuOverlay");

      if (activeStickyMobileNav && activeStickyMenuOverlay) {
        activeStickyMobileNav.classList.remove("active");
        activeStickyMenuOverlay.classList.remove("active");
        document.body.classList.remove("menu-open");
      }
    });
  }

  const newStickyMenuOverlay = stickyMenuOverlay.cloneNode(true);
  stickyMenuOverlay.parentNode.replaceChild(
    newStickyMenuOverlay,
    stickyMenuOverlay
  );

  newStickyMenuOverlay.addEventListener("click", function (e) {
    if (e.target === newStickyMenuOverlay) {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
      const activeStickyMobileNav = document.getElementById("sticky-mobileNav");

      if (activeStickyMobileNav) {
        activeStickyMobileNav.classList.remove("active");
        newStickyMenuOverlay.classList.remove("active");
        document.body.classList.remove("menu-open");
      }
    }
  });
}

function createStickyHeader() {
  const stickyHeader = document.createElement("div");
  stickyHeader.className = "sticky-header";
  stickyHeader.id = "sticky-header";

  const originalHeader = document.querySelector("header");

  if (!originalHeader) {
    console.error("Original header not found. Cannot create sticky header.");
    return;
  }

  const headerContent = originalHeader.cloneNode(true);
  const mobileNav = headerContent.querySelector(
    "#mobileNav, .mobile-nav-container, .mobile-nav"
  );
  const menuOverlay = headerContent.querySelector(
    "#menuOverlay, .menu-overlay"
  );

  if (mobileNav) {
    const stickyMobileNav = mobileNav.cloneNode(true);
    stickyMobileNav.setAttribute("id", "sticky-mobileNav");
    stickyMobileNav.classList.add("sticky-mobile-nav");

    // Přejmenování všech ID elementů, aby neměli konflikty s původními elementy
    const elementsWithId = stickyMobileNav.querySelectorAll("[id]");
    elementsWithId.forEach((element) => {
      const originalId = element.getAttribute("id");
      if (originalId !== "sticky-mobileNav") {
        element.setAttribute("id", "sticky-" + originalId);
      }
    });

    document.body.appendChild(stickyMobileNav);
  }

  if (menuOverlay) {
    const stickyMenuOverlay = menuOverlay.cloneNode(true);
    stickyMenuOverlay.setAttribute("id", "sticky-menuOverlay");
    stickyMenuOverlay.classList.add("sticky-menu-overlay");

    document.body.appendChild(stickyMenuOverlay);
  }

  const mobileElements = headerContent.querySelectorAll(
    ".menu-overlay, .mobile-nav-container, #menuOverlay, #mobileNav, .mobile-nav"
  );
  mobileElements.forEach((element) => element.remove());

  const originalStyles = window.getComputedStyle(originalHeader);
  stickyHeader.style.overflowX = originalStyles.overflowX;
  stickyHeader.style.overflowY = originalStyles.overflowY;

  const dropdownElements = headerContent.querySelectorAll(
    ".dropdown, .dropdown-toggle, .dropdown-content, .dropdown-content-second, .sub-dropdown-toggle, .sub-dropdown-content"
  );
  dropdownElements.forEach((element) => {
    element.classList.add("sticky-clone");
  });

  const burgerMenu = headerContent.querySelector(".burger-menu");
  if (burgerMenu) {
    burgerMenu.setAttribute("id", "sticky-burgerMenu");
  }

  const navElement = headerContent.querySelector("nav");
  if (navElement) {
    stickyHeader.appendChild(navElement);
  } else {
    const ulElement = headerContent.querySelector("ul");
    if (ulElement) {
      stickyHeader.appendChild(ulElement);
    } else {
      const buttonContainers =
        headerContent.querySelectorAll(".button-container");
      if (buttonContainers.length > 0) {
        const navContainer = document.createElement("div");
        navContainer.className = "sticky-nav-container";

        buttonContainers.forEach((container) => {
          navContainer.appendChild(container);
        });

        stickyHeader.appendChild(navContainer);
      } else {
        if (burgerMenu) {
          stickyHeader.appendChild(burgerMenu);
        } else {
          const navList = document.createElement("ul");

          const links = headerContent.querySelectorAll("a");
          links.forEach((link) => {
            if (link.offsetParent !== null) {
              const li = document.createElement("li");
              li.appendChild(link);
              navList.appendChild(li);
            }
          });

          stickyHeader.appendChild(navList);
        }
      }
    }
  }

  if (!stickyHeader.querySelector(".burger-menu") && burgerMenu) {
    stickyHeader.appendChild(burgerMenu);
  }

  document.body.appendChild(stickyHeader);

  const focusableSelectors = "a, button, [tabindex]";
  if (!stickyHeader.classList.contains("visible")) {
    stickyHeader.querySelectorAll(focusableSelectors).forEach((el) => {
      el.setAttribute("tabindex", "-1");
    });
    const stickyUl = stickyHeader.querySelector("ul");
    if (stickyUl) {
      stickyUl.setAttribute("aria-hidden", "true");
    }
  }
}

function initStickyHeaderFunctionality() {
  const stickyHeader = document.querySelector(".sticky-header");
  const mainHeader = document.querySelector("header");

  if (!stickyHeader || !mainHeader) {
    console.error("Sticky header or main header not found");
    return;
  }

  initializeHomeIcon(stickyHeader);

  initializeStickyBurgerMenu();

  const mainHeaderHeight = mainHeader.offsetHeight;
  let lastScrollY = window.scrollY || document.documentElement.scrollTop;
  let ticking = false;

  function handleScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollY = window.scrollY || document.documentElement.scrollTop;

        if (scrollY <= Math.max(mainHeaderHeight + 1.5, 10)) {
          stickyHeader.classList.remove("visible");
          clearAllDropdownStates();
          stickyHeader.classList.remove("scrolled");

          stickyHeader.style.transition =
            "transform 0.1s ease-out, opacity 0.1s ease-out";
          stickyHeader.style.transform = "translateY(-100%)";
          stickyHeader.style.opacity = "0";

          const focusableSelectors = "a, button, [tabindex]";
          stickyHeader.querySelectorAll(focusableSelectors).forEach((el) => {
            el.setAttribute("tabindex", "-1");
          });
          const stickyUl = stickyHeader.querySelector("ul");
          if (stickyUl) {
            stickyUl.setAttribute("aria-hidden", "true");
          }
        } else {
          stickyHeader.style.transition = "";
          stickyHeader.style.transform = "";
          stickyHeader.style.opacity = "1";

          const focusableSelectors = "a, button, [tabindex]";
          const stickyElements =
            stickyHeader.querySelectorAll(focusableSelectors);
          const originalElements =
            mainHeader.querySelectorAll(focusableSelectors);

          stickyElements.forEach((stickyEl) => {
            const originalIndex = stickyEl.getAttribute("data-original-index");
            if (originalIndex !== null) {
              const matchingOriginal =
                originalElements[parseInt(originalIndex)];
              if (matchingOriginal) {
                if (matchingOriginal.hasAttribute("tabindex")) {
                  stickyEl.setAttribute(
                    "tabindex",
                    matchingOriginal.getAttribute("tabindex")
                  );
                } else {
                  stickyEl.removeAttribute("tabindex");
                }
              } else {
                stickyEl.removeAttribute("tabindex");
              }
            } else {
              stickyEl.removeAttribute("tabindex");
            }
          });

          const stickyUl = stickyHeader.querySelector("ul");
          if (stickyUl) {
            stickyUl.setAttribute("aria-hidden", "false");
          }

          if (scrollY < lastScrollY) {
            stickyHeader.classList.add("visible");

            if (scrollY > mainHeaderHeight + 100) {
              stickyHeader.classList.add("scrolled");
            } else {
              stickyHeader.classList.remove("scrolled");
            }
          } else if (scrollY > lastScrollY) {
            stickyHeader.classList.remove("visible");
            clearAllDropdownStates();

            stickyHeader.querySelectorAll(focusableSelectors).forEach((el) => {
              el.setAttribute("tabindex", "-1");
            });
            const stickyUl = stickyHeader.querySelector("ul");
            if (stickyUl) {
              stickyUl.setAttribute("aria-hidden", "true");
            }
          }
        }

        lastScrollY = scrollY;
        ticking = false;
      });

      ticking = true;
    }
  }

  window.addEventListener("scroll", handleScroll);

  (function initialCheck() {
    const scrollY = window.scrollY || document.documentElement.scrollTop;

    if (scrollY > mainHeaderHeight) {
      setTimeout(() => {
        stickyHeader.style.transition = "";
        stickyHeader.style.transform = "translateY(0)";
        stickyHeader.style.opacity = "1";
        stickyHeader.style.visibility = "visible";
        stickyHeader.classList.add("visible");

        stickyHeader.setAttribute("aria-hidden", "false");

        const focusableSelectors = "a, button, [tabindex]";
        const stickyElements =
          stickyHeader.querySelectorAll(focusableSelectors);
        const originalElements =
          mainHeader.querySelectorAll(focusableSelectors);

        stickyElements.forEach((stickyEl) => {
          const elementText = stickyEl.textContent.trim();
          const elementHref = stickyEl.getAttribute("href");

          const matchingOriginal = Array.from(originalElements).find(
            (origEl) => {
              const origText = origEl.textContent.trim();
              const origHref = origEl.getAttribute("href");
              return (
                elementText === origText ||
                (elementHref && elementHref === origHref)
              );
            }
          );

          if (matchingOriginal) {
            if (matchingOriginal.hasAttribute("tabindex")) {
              stickyEl.setAttribute(
                "tabindex",
                matchingOriginal.getAttribute("tabindex")
              );
            } else {
              stickyEl.removeAttribute("tabindex");
            }
          } else {
            stickyEl.removeAttribute("tabindex");
          }
        });

        const stickyUl = stickyHeader.querySelector("ul");
        if (stickyUl) {
          stickyUl.setAttribute("aria-hidden", "false");
        }

        if (scrollY > mainHeaderHeight + 100) {
          stickyHeader.classList.add("scrolled");
        }
      }, 50);
    }
  })();

  initializeStickyDropdowns();

  let themeChangeTimeout;

  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (
        mutation.type === "attributes" &&
        (mutation.attributeName === "class" ||
          mutation.attributeName === "data-theme")
      ) {
        if (themeChangeTimeout) {
          clearTimeout(themeChangeTimeout);
        }

        const currentScrollY =
          window.scrollY || document.documentElement.scrollTop;
        const wasVisible = stickyHeader.classList.contains("visible");

        if (wasVisible && currentScrollY > 50) {
          themeChangeTimeout = setTimeout(() => {
            if (
              stickyHeader &&
              (window.scrollY || document.documentElement.scrollTop) > 50
            ) {
              stickyHeader.classList.add("visible");
              stickyHeader.style.opacity = "1";
              stickyHeader.style.transform = "translateY(0)";
            }
          }, 0);
        }
      }
    });
  });

  observer.observe(document.body, { attributes: true, subtree: false });
  observer.observe(document.documentElement, {
    attributes: true,
    subtree: false,
  });
}

// Monitoring focus pro zachování otevřeného dropdownu při TAB navigaci
document.addEventListener("focusin", function (e) {
  const stickyHeader = document.querySelector(".sticky-header");
  if (!stickyHeader || !stickyHeader.classList.contains("visible")) return;

  const focusedElement = e.target;
  const dropdownContent = focusedElement.closest(
    ".dropdown-content, .dropdown-content-second"
  );

  if (dropdownContent && stickyHeader.contains(dropdownContent)) {
    if (window.dropdownTimeouts) {
      Object.values(window.dropdownTimeouts).forEach((timeout) => {
        clearTimeout(timeout);
      });
    }
    if (window.autoHideTimeouts) {
      Object.values(window.autoHideTimeouts).forEach((timeout) => {
        clearTimeout(timeout);
      });
    }

    dropdownContent.style.opacity = "1";
    dropdownContent.style.visibility = "visible";
    dropdownContent.style.display = "block";
  } else {
    // Pokud focus není v žádném dropdown, zavři všechny otevřené
    const allDropdowns = stickyHeader.querySelectorAll(
      ".dropdown-content, .dropdown-content-second"
    );
    allDropdowns.forEach((content, index) => {
      if (content.style.display === "block") {
        if (window[`closeStickyDropdown_${index}`]) {
          window[`closeStickyDropdown_${index}`]();
        }
      }
    });
  }
});