/*document.addEventListener("DOMContentLoaded", function () {
  initializeDropdownMenus();*/

/*  function initializeDropdownMenus() {
    /*let mouseX = parseInt(localStorage.getItem("mouseX")) || 0;
    let mouseY = parseInt(localStorage.getItem("mouseY")) || 0;*/
   /* let throttleTimer;
    let dropdownToggle = document.getElementById("dropdown-toggle");
    let dropdownContent = document.getElementById("dropdown-content");
    let dropdownToggle2 = document.getElementById("dropdown-toggle2");
    let dropdownContent2 = document.getElementById("dropdown-content2");
    let subDropdownToggle = document.getElementById("sub-dropdown-toggle");
    let subDropdownContent = document.getElementById("sub-dropdown-content");

    let isClickOpened = localStorage.getItem("isFirstMenuOpen") === "true";
    let isClickOpened2 = localStorage.getItem("isSecondMenuOpen") === "true";
    let isClickOpenedSub = localStorage.getItem("isSubMenuOpen") === "true";

    let firstDropdownReady = false;
    let secondDropdownReady = false;
    let subDropdownReady = false;

    let menuStateRestored = false;

    checkForDropdownElements();

    let fastRefreshTimer = setTimeout(function () {
      if (!menuStateRestored) {
        checkMousePositionAndRestoreMenu();
      }
    }, 50);
    let safetyTimeout = setTimeout(function () {
      if (!menuStateRestored) {
        restoreMenuStateOnLoad();
      }
    }, 1000);

    function checkMousePositionAndRestoreMenu() {
      checkForDropdownElements();

      if (menuStateRestored) return;

      const isMouseOverFirstToggle =
        localStorage.getItem("isMouseOverFirstToggle") === "true";
      const isMouseOverSecondToggle =
        localStorage.getItem("isMouseOverSecondToggle") === "true";

      if (dropdownToggle && firstDropdownReady) {
        const toggleRect = dropdownToggle.getBoundingClientRect();
        const isNowOverFirstToggle = isPointInRect(mouseX, mouseY, toggleRect);

        if (
          (isMouseOverFirstToggle || isNowOverFirstToggle) &&
          !isClickOpened2 &&
          !isClickOpenedSub
        ) {
          showMenu();
          if (isMouseOverFirstToggle) {
            isClickOpened = true;
            localStorage.setItem("isFirstMenuOpen", "true");
          }
        }
      }

      if (dropdownToggle2 && secondDropdownReady) {
        const toggleRect2 = dropdownToggle2.getBoundingClientRect();
        const isNowOverSecondToggle = isPointInRect(
          mouseX,
          mouseY,
          toggleRect2
        );

        if (
          (isMouseOverSecondToggle || isNowOverSecondToggle) &&
          !isClickOpened &&
          !isClickOpenedSub
        ) {
          showMenu2();
          if (isMouseOverSecondToggle) {
            isClickOpened2 = true;
            localStorage.setItem("isSecondMenuOpen", "true");
          }
        }
      }

      if (isClickOpened && dropdownContent && firstDropdownReady) {
        showMenu();
      }

      if (isClickOpened2 && dropdownContent2 && secondDropdownReady) {
        showMenu2();
      }

      if (isClickOpenedSub && subDropdownContent && subDropdownReady) {
        showMenuSub();
      }

      menuStateRestored = true;
    }

    function checkForDropdownElements() {
      if (!firstDropdownReady) {
        dropdownToggle = document.getElementById("dropdown-toggle");
        dropdownContent = document.getElementById("dropdown-content");

        if (dropdownToggle && dropdownContent) {
          firstDropdownReady = true;
          setupFirstDropdownListeners();
        }
      }
      if (!secondDropdownReady) {
        dropdownToggle2 = document.getElementById("dropdown-toggle2");
        dropdownContent2 = document.getElementById("dropdown-content2");

        if (dropdownToggle2 && dropdownContent2) {
          secondDropdownReady = true;
          setupSecondDropdownListeners();
        }
      }

      if (!subDropdownReady) {
        subDropdownToggle = document.getElementById("sub-dropdown-toggle");
        subDropdownContent = document.getElementById("sub-dropdown-content");

        if (subDropdownToggle && subDropdownContent) {
          subDropdownReady = true;
          setupSubDropdownListeners();
        }
      }
    }

  /*  function restoreMenuStateOnLoad() {
      if (menuStateRestored) return;

      checkForDropdownElements();

      checkMousePositionAndRestoreMenu();

      menuStateRestored = true;
    }
*/
/*    function ensureDropdownElementsReady(callback) {
      checkForDropdownElements();

      if (firstDropdownReady && secondDropdownReady && subDropdownReady) {
        callback();
        return;
      }

      setTimeout(function () {
        ensureDropdownElementsReady(callback);
      }, 50);
    }

    function clearMenuStateOnNavigation() {
      localStorage.removeItem("isFirstMenuOpen");
      localStorage.removeItem("isSecondMenuOpen");
      localStorage.removeItem("isSubMenuOpen");
      localStorage.removeItem("isMouseOverFirstToggle");
      localStorage.removeItem("isMouseOverSecondToggle");
    }

  /*  function throttleMouseMove(callback, delay) {
      return function (e) {
        if (!throttleTimer) {
          throttleTimer = setTimeout(function () {
            callback(e);
            throttleTimer = null;
          }, delay);
        }
      };
    }*/

   /* document.addEventListener(
      "mousemove",
      throttleMouseMove(function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;

        localStorage.setItem("mouseX", mouseX);
        localStorage.setItem("mouseY", mouseY);

        checkForDropdownElements();

        if (
          firstDropdownReady &&
          dropdownToggle &&
          isElementVisible(dropdownToggle)
        ) {
          const toggleRect = dropdownToggle.getBoundingClientRect();
          const isOverFirstToggle = isPointInRect(mouseX, mouseY, toggleRect);
          localStorage.setItem(
            "isMouseOverFirstToggle",
            isOverFirstToggle ? "true" : "false"
          );

          if (
            isOverFirstToggle &&
            !isClickOpened &&
            !isClickOpened2 &&
            !isClickOpenedSub
          ) {
            showMenu();
          }
        }

        if (
          secondDropdownReady &&
          dropdownToggle2 &&
          isElementVisible(dropdownToggle2)
        ) {
          const toggleRect2 = dropdownToggle2.getBoundingClientRect();
          const isOverSecondToggle = isPointInRect(mouseX, mouseY, toggleRect2);
          localStorage.setItem(
            "isMouseOverSecondToggle",
            isOverSecondToggle ? "true" : "false"
          );

          if (
            isOverSecondToggle &&
            !isClickOpened &&
            !isClickOpened2 &&
            !isClickOpenedSub
          ) {
            showMenu2();
          }
        }
      }, 30)
    ); */

  /*  function isPointInRect(x, y, rect) {
      return (
        x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
      );
    }

    function isElementVisible(el) {
      return el && el.offsetParent !== null;
    }

    function showMenu() {
      if (!dropdownContent || !firstDropdownReady) return;

      requestAnimationFrame(function () {
        dropdownContent.style.display = "block";

        requestAnimationFrame(function () {
          dropdownContent.style.opacity = "1";
          localStorage.setItem("isFirstMenuOpen", "true");
          setTimeout(() => {
            positionDeadZone();
          }, 100);
        });
      });
    }

    function hideMenu() {
      if (!dropdownContent || !firstDropdownReady) return;

      dropdownContent.style.opacity = "0";

      setTimeout(function () {
        if (dropdownContent && dropdownContent.style.opacity === "0") {
          dropdownContent.style.display = "none";
        }
      }, 100);

      localStorage.setItem("isFirstMenuOpen", "false");
    }

    function showMenu2() {
      if (!dropdownContent2 || !secondDropdownReady) return;

      requestAnimationFrame(function () {
        dropdownContent2.style.display = "block";

        requestAnimationFrame(function () {
          dropdownContent2.style.opacity = "1";
          localStorage.setItem("isSecondMenuOpen", "true");
        });
      });
    }

    function hideMenu2() {
      if (window.tabNavigationActive2) {
        return;
      }
      if (!dropdownContent2 || !secondDropdownReady) return;

      dropdownContent2.style.opacity = "0";

      setTimeout(function () {
        if (dropdownContent2 && dropdownContent2.style.opacity === "0") {
          dropdownContent2.style.display = "none";
        }
      }, 100);

      localStorage.setItem("isSecondMenuOpen", "false");
    }

    function showMenuSub() {
      if (!subDropdownContent || !subDropdownReady) return;

      requestAnimationFrame(function () {
        subDropdownContent.style.display = "block";

        requestAnimationFrame(function () {
          subDropdownContent.style.opacity = "1";
          localStorage.setItem("isSubMenuOpen", "true");
        });
      });
    }

    function hideMenuSub() {
      if (!subDropdownContent || !subDropdownReady) return;

      subDropdownContent.style.opacity = "0";

      setTimeout(function () {
        if (subDropdownContent && subDropdownContent.style.opacity === "0") {
          subDropdownContent.style.display = "none";
        }
      }, 100);

      localStorage.setItem("isSubMenuOpen", "false");
    }

    function closeAllMenus() {
      hideMenu();
      hideMenu2();
      hideMenuSub();
      isClickOpened = false;
      isClickOpened2 = false;
      isClickOpenedSub = false;
    }

    function closeAllMenusExcept(exceptMenuId) {
      if (
        exceptMenuId !== "first-menu" &&
        dropdownContent &&
        dropdownContent.style.opacity === "1"
      ) {
        hideMenu();
        isClickOpened = false;
      }

      if (
        exceptMenuId !== "second-menu" &&
        dropdownContent2 &&
        dropdownContent2.style.opacity === "1"
      ) {
        hideMenu2();
        isClickOpened2 = false;
      }

      if (
        exceptMenuId !== "sub-menu" &&
        subDropdownContent &&
        subDropdownContent.style.opacity === "1"
      ) {
        hideMenuSub();
        isClickOpenedSub = false;
      }
    }

    function setupFirstDropdownListeners() {
      if (!firstDropdownReady || !dropdownToggle || !dropdownContent) {
        return;
      }

      if (dropdownToggle.hasAttribute("data-event-listeners-added")) {
        return;
      }

      dropdownToggle.setAttribute("data-event-listeners-added", "true");

      dropdownToggle.addEventListener("click", function (e) {
        e.stopPropagation();
        if (isClickOpened) {
          hideMenu();
          isClickOpened = false;
        } else {
          closeAllMenusExcept("first-menu");
          showMenu();
          isClickOpened = true;
        }
      });

      /* dropdownToggle.addEventListener("focus", function() {
    isFocusedInside = true;
    if (!isClickOpened) {
        showMenu();
    }
});*/

      /*dropdownContent.addEventListener("focusin", function() {
    isFocusedInside = true;
    clearTimeout(hideTimeoutFirst);
});

dropdownContent.addEventListener("focusout", function(e) {
    setTimeout(() => {
        if (!dropdownContent.contains(document.activeElement) && 
            !dropdownToggle.contains(document.activeElement)) {
            isFocusedInside = false;
            if (!isClickOpened) {
                hideMenu();
            }
        }
    }, 0);
});*/

    /*  dropdownToggle.addEventListener("mouseenter", function () {
        if (!isClickOpened && !isClickOpened2 && !isClickOpenedSub) {
          showMenu();
        }
      });

      dropdownContent.addEventListener("mouseleave", function (e) {
        if (window.tabNavigationActive) {
          return;
        }
        if (!isClickOpened) {
          const rect = dropdownContent.getBoundingClientRect();
          const isMouseInsideMenu =
            mouseX >= rect.left &&
            mouseX <= rect.right &&
            mouseY >= rect.top &&
            mouseY <= rect.bottom;

          if (
            !isMouseInsideMenu &&
            !isPointInRect(
              mouseX,
              mouseY,
              dropdownToggle.getBoundingClientRect()
            )
          ) {
            hideMenu();
          }
        }
      });
    }

    /* 
    document.addEventListener("focusin", function(e) {
        if (dropdownContent.contains(e.target) || e.target === dropdownToggle) {
            window.tabNavigationActive = true;
        } else {
            window.tabNavigationActive = false;
        }
    });

document.addEventListener("focusout", function(e) {
    setTimeout(() => {
        const activeElement = document.activeElement;

        if (!dropdownContent.contains(activeElement) && 
            activeElement !== dropdownToggle && 
            dropdownContent.style.opacity === "1") {
            
            window.tabNavigationActive = false;
            hideMenu();
            isClickOpened = false;
        }
    }, 100);
});*/

   /* function setupSecondDropdownListeners() {
      if (!secondDropdownReady || !dropdownToggle2 || !dropdownContent2) {
        return;
      }

      if (dropdownToggle2.hasAttribute("data-event-listeners-added")) {
        return;
      }

      dropdownToggle2.setAttribute("data-event-listeners-added", "true");

      dropdownToggle2.addEventListener("click", function (e) {
        e.stopPropagation();
        if (isClickOpened2) {
          hideMenu2();
          isClickOpened2 = false;
        } else {
          closeAllMenusExcept("second-menu");
          showMenu2();
          isClickOpened2 = true;
        }
      });

      dropdownToggle2.addEventListener("mouseenter", function () {
        if (!isClickOpened && !isClickOpened2 && !isClickOpenedSub) {
          showMenu2();
        }
      });

      dropdownContent2.addEventListener("mouseleave", function (e) {
        if (window.tabNavigationActive2) {
          return;
        }

        if (!isClickOpened2) {
          const rect = dropdownContent2.getBoundingClientRect();
          const isMouseInsideMenu =
            mouseX >= rect.left &&
            mouseX <= rect.right &&
            mouseY >= rect.top &&
            mouseY <= rect.bottom;

          if (
            !isMouseInsideMenu &&
            !isPointInRect(
              mouseX,
              mouseY,
              dropdownToggle2.getBoundingClientRect()
            )
          ) {
            hideMenu2();
          }
        }
      });
    }

    function setupSubDropdownListeners() {
      if (!subDropdownReady || !subDropdownToggle || !subDropdownContent) {
        return;
      }

      if (subDropdownToggle.hasAttribute("data-event-listeners-added")) {
        return;
      }

      subDropdownToggle.setAttribute("data-event-listeners-added", "true");

      subDropdownToggle.addEventListener("click", function (e) {
        e.stopPropagation();
        if (isClickOpenedSub) {
          hideMenuSub();
          isClickOpenedSub = false;
        } else {
          closeAllMenusExcept("sub-menu");
          showMenuSub();
          isClickOpenedSub = true;
        }
      });
    }

    document.addEventListener(
      "click",
      function (e) {
        const target = e.target;

        if (target.tagName === "A" || target.closest("a")) {
          clearMenuStateOnNavigation();
          closeAllMenus();
          return;
        }
        const isOutsideMenus = !(
          (dropdownToggle && dropdownToggle.contains(target)) ||
          (dropdownContent && dropdownContent.contains(target)) ||
          (dropdownToggle2 && dropdownToggle2.contains(target)) ||
          (dropdownContent2 && dropdownContent2.contains(target)) ||
          (subDropdownToggle && subDropdownToggle.contains(target)) ||
          (subDropdownContent && subDropdownContent.contains(target))
        );

        if (isOutsideMenus) {
          closeAllMenus();
        }
      },
      { passive: true }
    );

    /*window.addEventListener("beforeunload", function (e) {
      localStorage.setItem("isFirstMenuOpen", "false");
      localStorage.setItem("isSecondMenuOpen", "false");
      localStorage.setItem("isSubMenuOpen", "false");
    });*/

    /*window.addEventListener("beforeunload", function (e) {
      localStorage.setItem("isRefreshing", "true");

      setTimeout(function () {
        localStorage.removeItem("isRefreshing");
      }, 500);
    });*/

/*    if (!document.body.hasAttribute("data-link-listeners-added")) {
      document.body.setAttribute("data-link-listeners-added", "true");
      document.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function (e) {
          if (
            link.getAttribute("href") !== "#" &&
            link.getAttribute("href") !== ""
          ) {
            clearMenuStateOnNavigation();
          }
        });
      });
    }

    function setupAggressiveRefreshHandling() {
      const isRefresh = localStorage.getItem("isRefreshing") === "true";
      localStorage.removeItem("isRefreshing");

      if (isRefresh) {
        const refreshTimers = [10, 30, 50, 100, 200, 300, 500, 1000];

        refreshTimers.forEach(function (time) {
          setTimeout(function () {
            if (!menuStateRestored) {
              checkForDropdownElements();
              checkMousePositionAndRestoreMenu();
            }
          }, time);
        });
      }

      const images = document.querySelectorAll("img");
      const totalImages = images.length;
      if (totalImages > 20) {
        const additionalTimers = [50, 150, 300, 600, 1000, 1500, 2000];

        additionalTimers.forEach(function (time) {
          setTimeout(function () {
            if (!menuStateRestored) {
              checkForDropdownElements();
              checkMousePositionAndRestoreMenu();
            }
          }, time);
        });

        let checkCount = 0;
        const maxChecks = 10;
        const checkInterval = setInterval(function () {
          checkCount++;

          if (!menuStateRestored) {
            checkForDropdownElements();
            checkMousePositionAndRestoreMenu();
          }

          if (menuStateRestored || checkCount >= maxChecks) {
            clearInterval(checkInterval);
          }
        }, 200);
      }
    }

    setupAggressiveRefreshHandling();

    window.addEventListener("load", function () {
      clearTimeout(safetyTimeout);

      if (!menuStateRestored) {
        checkForDropdownElements();
        restoreMenuStateOnLoad();
      }
    });

    window.addEventListener(
      "resize",
      throttleMouseMove(function () {
        checkForDropdownElements();

        if (
          firstDropdownReady &&
          dropdownToggle &&
          isElementVisible(dropdownToggle)
        ) {
          const toggleRect = dropdownToggle.getBoundingClientRect();
          const isOverFirstToggle = isPointInRect(mouseX, mouseY, toggleRect);
          localStorage.setItem(
            "isMouseOverFirstToggle",
            isOverFirstToggle ? "true" : "false"
          );

          if (isOverFirstToggle && !isClickOpened2 && !isClickOpenedSub) {
            if (!isClickOpened) {
              showMenu();
            }
          } else if (
            !isClickOpened &&
            dropdownContent &&
            dropdownContent.style.opacity === "1"
          ) {
            hideMenu();
          }
        }

        if (
          secondDropdownReady &&
          dropdownToggle2 &&
          isElementVisible(dropdownToggle2)
        ) {
          const toggleRect2 = dropdownToggle2.getBoundingClientRect();
          const isOverSecondToggle = isPointInRect(mouseX, mouseY, toggleRect2);
          localStorage.setItem(
            "isMouseOverSecondToggle",
            isOverSecondToggle ? "true" : "false"
          );

          if (isOverSecondToggle && !isClickOpened && !isClickOpenedSub) {
            if (!isClickOpened2) {
              showMenu2();
            }
          } else if (
            !isClickOpened2 &&
            dropdownContent2 &&
            dropdownContent2.style.opacity === "1"
          ) {
            hideMenu2();
          }
        }
      }, 100),
      { passive: true }
    );

    const observer = new MutationObserver(function (mutations) {
      let needsCheck = false;

      for (let mutation of mutations) {
        if (mutation.type === "childList" && mutation.addedNodes.length) {
          needsCheck = true;
          break;
        }
      }

      if (needsCheck) {
        checkForDropdownElements();

        const isMouseOverFirstToggle =
          localStorage.getItem("isMouseOverFirstToggle") === "true";
        const isMouseOverSecondToggle =
          localStorage.getItem("isMouseOverSecondToggle") === "true";

        if (
          (isMouseOverFirstToggle || isMouseOverSecondToggle) &&
          !menuStateRestored
        ) {
          checkMousePositionAndRestoreMenu();
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    if ("requestIdleCallback" in window) {
      requestIdleCallback(
        function () {
          if (!menuStateRestored) {
            checkForDropdownElements();
            restoreMenuStateOnLoad();
          }
        },
        { timeout: 2000 }
      );
    } else {
      setTimeout(function () {
        if (!menuStateRestored) {
          checkForDropdownElements();
          restoreMenuStateOnLoad();
        }
      }, 1500);
    }
  }
});*/

/*let positionMonitoringInterval = null;

function startPositionMonitoring(callback = null) {
  if (positionMonitoringInterval) {
    clearInterval(positionMonitoringInterval);
  }

  positionMonitoringInterval = setInterval(() => {
    if (callback && typeof callback === "function") {
      callback();
    }
  }, 100);
}

function stopPositionMonitoring() {
  if (positionMonitoringInterval) {
    clearInterval(positionMonitoringInterval);
    positionMonitoringInterval = null;
  }
}*/

// ==== PRVNÍ DROPDOWN ==== //

const dropdownToggle = document.querySelector(".dropdown-toggle");
const dropdownContent = document.querySelector(".dropdown-content");

if (dropdownToggle && dropdownContent) {
  let hideTimeoutFirst;
  let animationTimeoutFirst;
  let inactivityTimeoutFirst;
  let repositionTimeoutFirst;
  let submenuHideTimeout;
  let clickInactivityTimeout;
  const clickInactivityDelay = 2000;
  const inactivityDelay = 2000;
  let isClickOpened = false;
  let isSubmenuActive = false;
  let isMouseOverSubmenu = false;
  let lastMouseMoveTime = 0;

  let mouseX = parseInt(localStorage.getItem("mouseX")) || 0;
  let mouseY = parseInt(localStorage.getItem("mouseY")) || 0;

  dropdownContent.style.transition =
    "opacity 0.3s ease-in-out, visibility 0.3s ease-in-out";
  dropdownContent.style.opacity = "0";
  dropdownContent.style.visibility = "hidden";
  dropdownContent.style.display = "none";

  const deadZoneElement = document.createElement("div");
  deadZoneElement.className = "dropdown-dead-zone";
  document.body.appendChild(deadZoneElement);

  Object.assign(deadZoneElement.style, {
    position: "absolute",
    display: "none",
    pointerEvents: "auto",
    background: "transparent",
    zIndex: "999",
  });

  function positionDeadZone() {
    if (dropdownContent.style.display === "block") {
      requestAnimationFrame(() => {
        const toggleRect = dropdownToggle.getBoundingClientRect();
        const contentRect = dropdownContent.getBoundingClientRect();

        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        const left = Math.min(toggleRect.left, contentRect.left) + scrollX + 2; 
        const right =
          Math.max(toggleRect.right, contentRect.right) + scrollX - 2; 
        const width = right - left;

        const top = toggleRect.bottom + scrollY;
        let height = contentRect.top - toggleRect.bottom;

        if (height < 5) height = 5;

        deadZoneElement.style.left = `${left}px`;
        deadZoneElement.style.top = `${top - 1}px`;
        deadZoneElement.style.width = `${width}px`;
        deadZoneElement.style.height = `${height - 1}px`; 
        deadZoneElement.style.zIndex = "9999";
        deadZoneElement.style.pointerEvents = "auto";
        deadZoneElement.style.display = "block";
      });
    } else {
      deadZoneElement.style.display = "none";
    }

    window.addEventListener("resize", () => {
      positionDeadZone();
    });

    if (!deadZoneElement.hasAttribute("data-listeners-added")) {
      deadZoneElement.setAttribute("data-listeners-added", "true");

      deadZoneElement.addEventListener("mouseenter", function () {
        clearTimeout(hideTimeoutFirst);
        if (!isClickOpened) {
          showMenu();
        }
      });

      deadZoneElement.addEventListener("mouseleave", function (e) {
        if (!isClickOpened) {
          hideTimeoutFirst = setTimeout(function () {
            hideMenu();
          }, 200);
        }
      });
    }
  }

  window.addEventListener("resize", () => {
    if (dropdownContent.style.display === "block") {
      positionDeadZone();
    }
  });

  
    function startPositionMonitoring() {
        clearTimeout(repositionTimeoutFirst);
        
        positionDeadZone();
        
        repositionTimeoutFirst = setTimeout(() => {
            if (dropdownContent.style.display === "block") {
                startPositionMonitoring();
            }
        }, 500);
    }

  function isMouseOverSubmenuElements() {
    const subDropdownContent = document.querySelector(".sub-dropdown-content");
    const subDropdownToggle = document.querySelector(".sub-dropdown-toggle");
    const deadZoneElementSub = document.querySelector(
      ".sub-dropdown-dead-zone"
    );

    if (subDropdownContent && subDropdownContent.style.display === "block") {
      const subMenuRect = subDropdownContent.getBoundingClientRect();
      if (
        mouseX >= subMenuRect.left &&
        mouseX <= subMenuRect.right &&
        mouseY >= subMenuRect.top &&
        mouseY <= subMenuRect.bottom
      ) {
        return true;
      }
    }

    if (subDropdownToggle) {
      const subToggleRect = subDropdownToggle.getBoundingClientRect();
      if (
        mouseX >= subToggleRect.left &&
        mouseX <= subToggleRect.right &&
        mouseY >= subToggleRect.top &&
        mouseY <= subToggleRect.bottom
      ) {
        return true;
      }
    }

    if (deadZoneElementSub && deadZoneElementSub.style.display === "block") {
      const subDeadRect = deadZoneElementSub.getBoundingClientRect();
      if (
        mouseX >= subDeadRect.left &&
        mouseX <= subDeadRect.right &&
        mouseY >= subDeadRect.top &&
        mouseY <= subDeadRect.bottom
      ) {
        return true;
      }
    }

    return false;
  }

  function debounceSubmenuHide(delay = 150) {
    clearTimeout(submenuHideTimeout);
    submenuHideTimeout = setTimeout(() => {
      if (!isMouseOverSubmenuElements()) {
        hideSubmenuSafely();
      }
    }, delay);
  }

  function hideSubmenuSafely() {
    const subDropdownContent = document.querySelector(".sub-dropdown-content");
    if (subDropdownContent && subDropdownContent.style.opacity === "1") {
      if (!isMouseOverSubmenuElements()) {
        subDropdownContent.style.opacity = "0";
        subDropdownContent.style.visibility = "hidden";

        setTimeout(() => {
          subDropdownContent.style.display = "none";

          const deadZoneElementSub = document.querySelector(
            ".sub-dropdown-dead-zone"
          );
          if (deadZoneElementSub) {
            deadZoneElementSub.style.display = "none";
          }

          localStorage.removeItem("isSubMenuOpen");
          isSubmenuActive = false;
        }, 300);
      }
    }
  }

  function showMenu() {
    clearTimeout(hideTimeoutFirst);
    clearTimeout(animationTimeoutFirst);
    clearTimeout(inactivityTimeoutFirst);
    clearTimeout(clickInactivityTimeout);
    clearTimeout(submenuHideTimeout);

    isClosingInProgress = false;

    dropdownContent.style.display = "block";

    requestAnimationFrame(() => {
      dropdownContent.style.opacity = "1";
      dropdownContent.style.visibility = "visible";

      setTimeout(() => {
        positionDeadZone();
      }, 100);
      startPositionMonitoring();
    });

    if (isClickOpened) {
      startInactivityTimer();
      localStorage.setItem("isFirstMenuOpen", "true");
    }
  }

  function startInactivityTimer() {
    clearTimeout(inactivityTimeoutFirst);
    inactivityTimeoutFirst = setTimeout(() => {
      if (window.tabNavigationActive) {
        return;
      }
      const menuRect = dropdownContent.getBoundingClientRect();
      const toggleRect = dropdownToggle.getBoundingClientRect();

      const isMouseOverSubElements = isMouseOverSubmenuElements();

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

      const isMouseOverDeadZone =
        deadZoneElement.style.display === "block" &&
        mouseX >= deadZoneElement.getBoundingClientRect().left &&
        mouseX <= deadZoneElement.getBoundingClientRect().right &&
        mouseY >= deadZoneElement.getBoundingClientRect().top &&
        mouseY <= deadZoneElement.getBoundingClientRect().bottom;

      if (
        !isMouseOverMenu &&
        !isMouseOverToggle &&
        !isMouseOverDeadZone &&
        !isMouseOverSubElements
      ) {
        hideMenu();
        isClickOpened = false;
      }
    }, inactivityDelay);
  }

  function startClickInactivityTimer() {
    clearTimeout(clickInactivityTimeout);
    clickInactivityTimeout = setTimeout(() => {
      if (window.tabNavigationActive) {
        return;
      }
      const menuRect = dropdownContent.getBoundingClientRect();
      const toggleRect = dropdownToggle.getBoundingClientRect();
      const isMouseOverSubElements = isMouseOverSubmenuElements();

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

      const isMouseOverDeadZone =
        deadZoneElement.style.display === "block" &&
        mouseX >= deadZoneElement.getBoundingClientRect().left &&
        mouseX <= deadZoneElement.getBoundingClientRect().right &&
        mouseY >= deadZoneElement.getBoundingClientRect().top &&
        mouseY <= deadZoneElement.getBoundingClientRect().bottom;

      if (
        !isMouseOverMenu &&
        !isMouseOverToggle &&
        !isMouseOverDeadZone &&
        !isMouseOverSubElements
      ) {
        hideMenu();
        isClickOpened = false;
      }
    }, clickInactivityDelay);
  }

  let isClosingInProgress = false;

  function hideMenu() {
    if (window.tabNavigationActive) {
      return;
    }
    clearTimeout(hideTimeoutFirst);
    clearTimeout(animationTimeoutFirst);
    clearTimeout(inactivityTimeoutFirst);
    clearTimeout(repositionTimeoutFirst);
    clearTimeout(submenuHideTimeout);

    isClosingInProgress = true;

    dropdownContent.style.opacity = "0";
    dropdownContent.style.visibility = "hidden";

    if (typeof window.closeSubMenuWithParent === "function") {
      window.closeSubMenuWithParent();
    }

    animationTimeoutFirst = setTimeout(() => {
      dropdownContent.style.display = "none";
      deadZoneElement.style.display = "none";

      const subDropdownContent = document.querySelector(
        ".sub-dropdown-content"
      );
      if (subDropdownContent) {
        subDropdownContent.style.opacity = "0";
        subDropdownContent.style.visibility = "hidden";
        subDropdownContent.style.display = "none";

        const deadZoneElementSub = document.querySelector(
          ".sub-dropdown-dead-zone"
        );
        if (deadZoneElementSub) {
          deadZoneElementSub.style.display = "none";
        }
      }

      isClickOpened = false;
      isSubmenuActive = false;
      isMouseOverSubmenu = false;
      localStorage.removeItem("isFirstMenuOpen");
      localStorage.removeItem("isSubMenuOpen");
      localStorage.removeItem("isMouseOverFirstToggle");
      isClosingInProgress = false;
    }, 300);

    clearTimeout(inactivityTimeoutFirst);
  }

  window.closeAllMenusExcept = function (exceptMenuId) {
    if (exceptMenuId !== "first-menu") {
      hideMenu();
    }
  };

  dropdownToggle.addEventListener("mouseenter", function () {
    clearTimeout(hideTimeoutFirst);
    lastMouseMoveTime = Date.now();

    if (window.closeSecondMenu) {
      window.closeSecondMenu();
    }

    if (!isClickOpened) {
      requestAnimationFrame(() => {
        showMenu();
      });
    }

    clearTimeout(submenuHideTimeout);

    localStorage.setItem("isMouseOverFirstToggle", "true");
  });

  dropdownToggle.addEventListener("mouseleave", function (e) {
    localStorage.removeItem("isMouseOverFirstToggle");

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
      hideTimeoutFirst = setTimeout(function () {
        if (!isClickOpened) {
          hideMenu();
        }
      }, 250); 
    }
  });

  dropdownToggle.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    clearTimeout(hideTimeoutFirst);
    clearTimeout(animationTimeoutFirst);
    clearTimeout(inactivityTimeoutFirst);
    clearTimeout(submenuHideTimeout);

    isClosingInProgress = false;

    if (dropdownContent.style.opacity === "1" && isClickOpened) {
      hideMenu();
      isClickOpened = false;
    } else {
      if (typeof closeAllMenusExcept === "function") {
        closeAllMenusExcept("first-menu");
      }

      isClickOpened = true;

      clearTimeout(submenuHideTimeout);

      dropdownContent.style.display = "block";

      requestAnimationFrame(() => {
        dropdownContent.style.opacity = "1";
        dropdownContent.style.visibility = "visible";

        startPositionMonitoring();

        localStorage.setItem("isFirstMenuOpen", "true");

        startInactivityTimer();
        startClickInactivityTimer();
      });
    }
  });

  window.closeSubMenuWithParent = function () {
    isSubmenuActive = false;
    isMouseOverSubmenu = false;
  };

  window.closeFirstMenu = function () {
    if (isClickOpened) {
      hideMenu();
      isClickOpened = false;
    }
  };

  dropdownContent.addEventListener("mouseenter", function () {
    clearTimeout(hideTimeoutFirst);
    clearTimeout(submenuHideTimeout);

    if (!isClickOpened) {
      clearTimeout(hideTimeoutFirst);
      clearTimeout(animationTimeoutFirst);

      dropdownContent.style.display = "block";

      requestAnimationFrame(() => {
        dropdownContent.style.opacity = "1";
        dropdownContent.style.visibility = "visible";

        startPositionMonitoring();
      });
    } else if (isClickOpened) {
      clearTimeout(clickInactivityTimeout);
      clearTimeout(inactivityTimeoutFirst);
    }
  });

  dropdownContent.addEventListener("mousemove", function () {
    if (isClickOpened) {
      clearTimeout(clickInactivityTimeout);
      clearTimeout(inactivityTimeoutFirst);
    }
  });

  dropdownContent.addEventListener("click", function () {
    if (isClickOpened) {
      clearTimeout(clickInactivityTimeout);
      clearTimeout(inactivityTimeoutFirst);
    }
  });
  dropdownContent.addEventListener("mouseleave", function (e) {
    if (!isClickOpened) {
      hideTimeoutFirst = setTimeout(function () {
        hideMenu();
      }, 200); 
    }
  });
  const searchElements = dropdownContent.querySelectorAll(
    "input, select, textarea, button"
  );
  searchElements.forEach((element) => {
    element.addEventListener("focus", function () {
      if (isClickOpened) {
        clearTimeout(clickInactivityTimeout);
        clearTimeout(inactivityTimeoutFirst);
      }
    });

    element.addEventListener("input", function () {
      if (isClickOpened) {
        clearTimeout(clickInactivityTimeout);
        clearTimeout(inactivityTimeoutFirst);
      }
    });

    element.addEventListener("click", function (e) {
      if (isClickOpened) {
        startInactivityTimer();
        e.stopPropagation();
      }
    });
  });

  const menuLinks = dropdownContent.querySelectorAll("a");
  menuLinks.forEach((link) => {
    link.addEventListener("click", function () {
      localStorage.removeItem("isFirstMenuOpen");
      localStorage.removeItem("isSecondMenuOpen");
      localStorage.removeItem("isSubMenuOpen");
      localStorage.removeItem("isMouseOverFirstToggle");
      localStorage.removeItem("isMouseOverSecondToggle");
    });
  });

  deadZoneElement.addEventListener("mouseenter", function () {
    clearTimeout(submenuHideTimeout);

    if (!isClickOpened) {
      clearTimeout(hideTimeoutFirst);
      clearTimeout(animationTimeoutFirst);

      dropdownContent.style.display = "block";

      requestAnimationFrame(() => {
        dropdownContent.style.opacity = "1";
        dropdownContent.style.visibility = "visible";
      });
    } else if (isClickOpened) {
      startInactivityTimer();
    }
  });

  dropdownContent.addEventListener("mouseleave", function (e) {
    if (isClickOpened) {
      startClickInactivityTimer();
      return;
    }

    const toElement = e.relatedTarget;

    const subToggle = document.querySelector(".sub-dropdown-toggle");
    const subContent = document.querySelector(".sub-dropdown-content");
    const subDeadZone = document.querySelector(".sub-dropdown-dead-zone");

    if (
      toElement !== deadZoneElement &&
      !deadZoneElement.contains(toElement) &&
      toElement !== dropdownToggle &&
      !dropdownToggle.contains(toElement) &&
      toElement !== subToggle &&
      subToggle &&
      !subToggle.contains(toElement) &&
      toElement !== subContent &&
      subContent &&
      !subContent.contains(toElement) &&
      toElement !== subDeadZone &&
      subDeadZone &&
      !subDeadZone.contains(toElement)
    ) {
      hideTimeoutFirst = setTimeout(function () {
        if (!isClickOpened) {
          hideMenu();
        }
      }, 400);
    }
  });

  deadZoneElement.addEventListener("mouseleave", function (e) {
    if (isClickOpened) return;

    const toElement = e.relatedTarget;

    const subToggle = document.querySelector(".sub-dropdown-toggle");
    const subContent = document.querySelector(".sub-dropdown-content");
    const subDeadZone = document.querySelector(".sub-dropdown-dead-zone");

    if (
      toElement !== dropdownToggle &&
      !dropdownToggle.contains(toElement) &&
      toElement !== dropdownContent &&
      !dropdownContent.contains(toElement) &&
      toElement !== subToggle &&
      subToggle &&
      !subToggle.contains(toElement) &&
      toElement !== subContent &&
      subContent &&
      !subContent.contains(toElement) &&
      toElement !== subDeadZone &&
      subDeadZone &&
      !subDeadZone.contains(toElement)
    ) {
      hideTimeoutFirst = setTimeout(function () {
        if (!isClickOpened) {
          hideMenu();
        }
      }, 300);
    }
  });

  document.addEventListener("click", function (event) {
    const subToggle = document.querySelector(".sub-dropdown-toggle");
    const subContent = document.querySelector(".sub-dropdown-content");
    const subDeadZone = document.querySelector(".sub-dropdown-dead-zone");

    if (
      !dropdownToggle.contains(event.target) &&
      !dropdownContent.contains(event.target) &&
      event.target !== deadZoneElement &&
      (!subToggle || !subToggle.contains(event.target)) &&
      (!subContent || !subContent.contains(event.target)) &&
      (!subDeadZone || !subDeadZone.contains(event.target))
    ) {
      hideMenu();
      isClickOpened = false;
    }
  });

  window.setSubmenuActive = function (active) {
    isSubmenuActive = active;
    isMouseOverSubmenu = active;

    if (active) {
      clearTimeout(submenuHideTimeout);

      if (isClickOpened) {
        startInactivityTimer();
      }
    }
  };

  let domContentLoaded = false;
  let pageLoaded = false;

  let shouldShowMenuAfterLoad = false;

  function checkMousePosition() {
    const savedMouseX = parseInt(localStorage.getItem("mouseX")) || 0;
    const savedMouseY = parseInt(localStorage.getItem("mouseY")) || 0;
    mouseX = savedMouseX;
    mouseY = savedMouseY;

    const toggleRect = dropdownToggle.getBoundingClientRect();

    const isOverToggle =
      mouseX >= toggleRect.left &&
      mouseX <= toggleRect.right &&
      mouseY >= toggleRect.top &&
      mouseY <= toggleRect.bottom;

    const wasOverToggle =
      localStorage.getItem("isMouseOverFirstToggle") === "true";

    let isCurrentlyHovered = false;
    try {
      isCurrentlyHovered = dropdownToggle.matches(":hover");
    } catch (e) {
      isCurrentlyHovered = false;
    }

    if (isOverToggle || wasOverToggle || isCurrentlyHovered) {
      shouldShowMenuAfterLoad = true;
      if (domContentLoaded) {
        setTimeout(() => {
          showMenu();
        }, 50);
      }
    }

    if (localStorage.getItem("isFirstMenuOpen") === "true") {
      isClickOpened = true;
      if (domContentLoaded) {
        setTimeout(() => {
          showMenu();
        }, 50);
      } else {
        shouldShowMenuAfterLoad = true;
      }
    }
  }
/*  document.addEventListener("DOMContentLoaded", function () {
    domContentLoaded = true;

    checkMousePosition();

    if (shouldShowMenuAfterLoad) {
      showMenu();
    }
  });*/

  window.addEventListener("load", function () {
    pageLoaded = true;

    if (dropdownContent.style.display === "block") {
      startPositionMonitoring();
    }

    if (!domContentLoaded) {
      domContentLoaded = true;
      checkMousePosition();

      if (shouldShowMenuAfterLoad) {
        showMenu();
      }
    }
  });

  setTimeout(function () {
    if (!domContentLoaded) {
      checkMousePosition();
    }
  }, 0);
}

/*let mouseMoveThrottle = false;
document.addEventListener("mousemove", function (e) {
  mouseX = e.clientX;
  mouseY = e.clientY;

  if (!mouseMoveThrottle) {
    mouseMoveThrottle = true;
    setTimeout(() => {
      localStorage.setItem("mouseX", mouseX);
      localStorage.setItem("mouseY", mouseY);
      mouseMoveThrottle = false;
    }, 50);
  }
});*/

let lastMouseUpdate = 0;
const MOUSE_UPDATE_INTERVAL = 100;

document.addEventListener("mousemove", function (e) {
  const now = Date.now();

  mouseX = e.clientX;
  mouseY = e.clientY;
  lastMouseMoveTime = now;

  if (now - lastMouseUpdate > MOUSE_UPDATE_INTERVAL) {
    localStorage.setItem("mouseX", mouseX);
    localStorage.setItem("mouseY", mouseY);
    lastMouseUpdate = now;
  }
});

/*window.addEventListener("beforeunload", function () {
  localStorage.removeItem("mouseX");
  localStorage.removeItem("mouseY");
  localStorage.removeItem("isMouseOverFirstToggle");
});*/

/*window.addEventListener("load", function () {
  setTimeout(function () {
    if (typeof isClickOpened === "undefined" || !isClickOpened) {
      localStorage.removeItem("isFirstMenuOpen");
    }
    localStorage.removeItem("isMouseOverFirstToggle");
  }, 5000);
});*/

window.dropdownMenu = {
  closeFirstMenu: function () {
    if (typeof window.closeFirstMenu === "function") {
      window.closeFirstMenu();
    }
  },

  isFirstMenuOpen: function () {
    return dropdownContent && dropdownContent.style.opacity === "1";
  },

  getMousePosition: function () {
    return { x: mouseX, y: mouseY };
  },
};

// ==== DRUHÝ DROPDOWN ==== //
const dropdownToggle2 = document.querySelector(".dropdown-toggle-second");
const dropdownContent2 = document.querySelector(".dropdown-content-second");

if (dropdownToggle2 && dropdownContent2) {
  let hideTimeoutSecond;
  let animationTimeoutSecond;
  let inactivityTimeoutSecond;
  let repositionTimeoutSecond;
  const inactivityDelay = 2000;
  let isClickOpened2 = false;
  let isClosingInProgress2 = false;

  dropdownContent2.style.transition =
    "opacity 0.3s ease-in-out, visibility 0.3s ease-in-out";
  dropdownContent2.style.opacity = "0";
  dropdownContent2.style.visibility = "hidden";
  dropdownContent2.style.display = "none";

  const deadZoneElement2 = document.createElement("div");
  deadZoneElement2.className = "dropdown-dead-zone-second";

  document.body.appendChild(deadZoneElement2);
  deadZoneElement2.style.position = "absolute";
  deadZoneElement2.style.display = "none";
  deadZoneElement2.style.zIndex = "999";

  let domContentLoaded2 = false;
  let pageLoaded2 = false;

  let shouldShowMenuAfterLoad2 = false;

  function positionDeadZone2() {
    if (dropdownContent2.style.display === "block") {
      requestAnimationFrame(() => {
        const toggleRect = dropdownToggle2.getBoundingClientRect();
        const contentRect = dropdownContent2.getBoundingClientRect();

        const scrollX = window.scrollX;
        const scrollY = window.scrollY;

        const left = Math.min(toggleRect.left, contentRect.left) + scrollX + 2;
        const right =
          Math.max(toggleRect.right, contentRect.right) + scrollX - 2; 
        const width = right - left;

        const top = toggleRect.bottom + scrollY;
        let height = contentRect.top - toggleRect.bottom;

        if (height < 5) height = 5;

        deadZoneElement2.style.left = `${left}px`;
        deadZoneElement2.style.top = `${top - 1}px`;
        deadZoneElement2.style.width = `${width}px`;
        deadZoneElement2.style.height = `${height - 1}px`; 
        deadZoneElement2.style.zIndex = "9999";
        deadZoneElement2.style.pointerEvents = "auto";
        deadZoneElement2.style.display = "block";
      });
    } else {
      deadZoneElement2.style.display = "none";
    }
  }

  window.addEventListener("resize", () => {
    if (dropdownContent2.style.display === "block") {
      positionDeadZone2();
    }
  });

  function startPositionMonitoring2() {
    clearTimeout(repositionTimeoutSecond);

    positionDeadZone2();

    repositionTimeoutSecond = setTimeout(() => {
      if (dropdownContent2.style.display === "block") {
        startPositionMonitoring2();
      }
    }, 200);
  }

  function startInactivityTimer2() {
    clearTimeout(inactivityTimeoutSecond);
    inactivityTimeoutSecond = setTimeout(() => {
      if (window.tabNavigationActive2) {
        return;
      }
      const menuRect = dropdownContent2.getBoundingClientRect();
      const toggleRect = dropdownToggle2.getBoundingClientRect();

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

      const isMouseOverDeadZone =
        deadZoneElement2.style.display === "block" &&
        mouseX >= deadZoneElement2.getBoundingClientRect().left &&
        mouseX <= deadZoneElement2.getBoundingClientRect().right &&
        mouseY >= deadZoneElement2.getBoundingClientRect().top &&
        mouseY <= deadZoneElement2.getBoundingClientRect().bottom;

      if (!isMouseOverMenu && !isMouseOverToggle && !isMouseOverDeadZone) {
        hideMenu2();
        isClickOpened2 = false;
      } else {
        startInactivityTimer2();
      }
    }, inactivityDelay);
  }

  function showMenu2() {
    clearTimeout(hideTimeoutSecond);
    clearTimeout(animationTimeoutSecond);
    clearTimeout(inactivityTimeoutSecond);

    isClosingInProgress2 = false;

    dropdownContent2.style.display = "block";

    requestAnimationFrame(() => {
      dropdownContent2.style.opacity = "1";
      dropdownContent2.style.visibility = "visible";

      startPositionMonitoring2();
    });

    if (isClickOpened2) {
      startInactivityTimer2();
      localStorage.setItem("isSecondMenuOpen", "true");
    }
  }

  function hideMenu2() {
    if (window.tabNavigationActive2) {
      return;
    }
    clearTimeout(hideTimeoutSecond);
    clearTimeout(animationTimeoutSecond);
    clearTimeout(inactivityTimeoutSecond);
    clearTimeout(repositionTimeoutSecond);

    isClosingInProgress2 = true;

    dropdownContent2.style.opacity = "0";
    dropdownContent2.style.visibility = "hidden";

    animationTimeoutSecond = setTimeout(() => {
      dropdownContent2.style.display = "none";
      deadZoneElement2.style.display = "none";

      isClickOpened2 = false;
      localStorage.removeItem("isSecondMenuOpen");
      localStorage.removeItem("isMouseOverSecondToggle");
      isClosingInProgress2 = false;
    }, 300);

    clearTimeout(inactivityTimeoutSecond);
  }

  window.closeSecondMenu = function () {
    if (isClickOpened2) {
      hideMenu2();
      isClickOpened2 = false;
    }
  };

  function checkMousePosition2() {
    const savedMouseX = parseInt(localStorage.getItem("mouseX")) || 0;
    const savedMouseY = parseInt(localStorage.getItem("mouseY")) || 0;

    mouseX = savedMouseX;
    mouseY = savedMouseY;

    const toggleRect = dropdownToggle2.getBoundingClientRect();

    const isOverToggle =
      mouseX >= toggleRect.left &&
      mouseX <= toggleRect.right &&
      mouseY >= toggleRect.top &&
      mouseY <= toggleRect.bottom;

    const wasOverToggle =
      localStorage.getItem("isMouseOverSecondToggle") === "true";

    if (isOverToggle || wasOverToggle) {
      shouldShowMenuAfterLoad2 = true;
      if (domContentLoaded2) {
        showMenu2();
      }
    }

    if (localStorage.getItem("isSecondMenuOpen") === "true") {
      isClickOpened2 = true;
      if (domContentLoaded2) {
        showMenu2();
      } else {
        shouldShowMenuAfterLoad2 = true;
      }
    }
  }

/*  document.addEventListener("DOMContentLoaded", function () {
    domContentLoaded2 = true;

    checkMousePosition2();

    if (shouldShowMenuAfterLoad2) {
      showMenu2();
    }
  });*/

  window.addEventListener("load", function () {
    pageLoaded2 = true;

    if (dropdownContent2.style.display === "block") {
      startPositionMonitoring2();
    }

    if (!domContentLoaded2) {
      domContentLoaded2 = true;
      checkMousePosition2();

      if (shouldShowMenuAfterLoad2) {
        showMenu2();
      }
    }
  });

  setTimeout(function () {
    if (!domContentLoaded2) {
      checkMousePosition2();
    }
  }, 0);

  dropdownToggle2.addEventListener("mouseenter", function () {
    if (window.closeFirstMenu) {
      window.closeFirstMenu();
    }

    if (!isClickOpened2) {
      requestAnimationFrame(() => {
        showMenu2();
      });
    }

    localStorage.setItem("isMouseOverSecondToggle", "true");
  });

  dropdownToggle2.addEventListener("mouseleave", function (e) {
    localStorage.removeItem("isMouseOverSecondToggle");

    if (isClickOpened2) return;

    const toElement = e.relatedTarget;

    if (
      toElement !== deadZoneElement2 &&
      !deadZoneElement2.contains(toElement) &&
      toElement !== dropdownContent2 &&
      !dropdownContent2.contains(toElement)
    ) {
      hideTimeoutSecond = setTimeout(function () {
        if (!isClickOpened2) {
          hideMenu2();
        }
      }, 250);
    }
  });

  dropdownToggle2.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    clearTimeout(hideTimeoutSecond);
    clearTimeout(animationTimeoutSecond);
    clearTimeout(inactivityTimeoutSecond);

    isClosingInProgress2 = false;

    if (dropdownContent2.style.opacity === "1" && isClickOpened2) {
      hideMenu2();
      isClickOpened2 = false;
    } else {
      if (typeof closeAllMenusExcept === "function") {
        closeAllMenusExcept("second-menu");
      }

      isClickOpened2 = true;

      dropdownContent2.style.display = "block";

      requestAnimationFrame(() => {
        dropdownContent2.style.opacity = "1";
        dropdownContent2.style.visibility = "visible";

        startPositionMonitoring2();

        localStorage.setItem("isSecondMenuOpen", "true");

        startInactivityTimer2();
      });
    }
  });

  dropdownContent2.addEventListener("mouseenter", function () {
    if (!isClickOpened2) {
      clearTimeout(hideTimeoutSecond);
      clearTimeout(animationTimeoutSecond);

      dropdownContent2.style.display = "block";

      requestAnimationFrame(() => {
        dropdownContent2.style.opacity = "1";
        dropdownContent2.style.visibility = "visible";

        startPositionMonitoring2();
      });
    } else if (isClickOpened2) {
      startInactivityTimer2();
    }
  });

  dropdownContent2.addEventListener("mousemove", function () {
    if (isClickOpened2) {
      startInactivityTimer2();
    }
  });

  dropdownContent2.addEventListener("click", function () {
    if (isClickOpened2) {
      startInactivityTimer2();
    }
  });

  const searchElements2 = dropdownContent2.querySelectorAll(
    "input, select, textarea, button"
  );
  searchElements2.forEach((element) => {
    element.addEventListener("focus", function () {
      if (isClickOpened2) {
        startInactivityTimer2();
      }
    });

    element.addEventListener("input", function () {
      if (isClickOpened2) {
        startInactivityTimer2();
      }
    });

    element.addEventListener("click", function (e) {
      if (isClickOpened2) {
        startInactivityTimer2();
        e.stopPropagation();
      }
    });
  });

  const menuLinks2 = dropdownContent2.querySelectorAll("a");
  menuLinks2.forEach((link) => {
    link.addEventListener("click", function () {
      localStorage.removeItem("isFirstMenuOpen");
      localStorage.removeItem("isSecondMenuOpen");
      localStorage.removeItem("isSubMenuOpen");
      localStorage.removeItem("isMouseOverFirstToggle");
      localStorage.removeItem("isMouseOverSecondToggle");
    });
  });

  deadZoneElement2.addEventListener("mouseenter", function () {
    if (!isClickOpened2) {
      clearTimeout(hideTimeoutSecond);
      clearTimeout(animationTimeoutSecond);

      dropdownContent2.style.display = "block";

      requestAnimationFrame(() => {
        dropdownContent2.style.opacity = "1";
        dropdownContent2.style.visibility = "visible";
      });
    } else if (isClickOpened2) {
      startInactivityTimer2();
    }
  });

  dropdownContent2.addEventListener("mouseleave", function (e) {
    if (isClickOpened2) return; 

    const toElement = e.relatedTarget;

    if (
      toElement !== deadZoneElement2 &&
      !deadZoneElement2.contains(toElement) &&
      toElement !== dropdownToggle2 &&
      !dropdownToggle2.contains(toElement)
    ) {
      hideTimeoutSecond = setTimeout(function () {
        if (!isClickOpened2) {
          hideMenu2();
        }
      }, 400);
    }
  });

  deadZoneElement2.addEventListener("mouseleave", function (e) {
    if (isClickOpened2) return; 

    const toElement = e.relatedTarget;

    if (
      toElement !== dropdownToggle2 &&
      !dropdownToggle2.contains(toElement) &&
      toElement !== dropdownContent2 &&
      !dropdownContent2.contains(toElement)
    ) {
      hideTimeoutSecond = setTimeout(function () {
        if (!isClickOpened2) {
          hideMenu2();
        }
      }, 300);
    }
  });

  /*document.addEventListener("click", function (event) {
    if (
      !dropdownToggle2.contains(event.target) &&
      !dropdownContent2.contains(event.target) &&
      event.target !== deadZoneElement2
    ) {
      hideMenu2();
      isClickOpened2 = false;
    }
  });*/
}

/*let mouseX = 0;
let mouseY = 0;

document.addEventListener("mousemove", function (e) {
  mouseX = e.clientX;
  mouseY = e.clientY;

  localStorage.setItem("mouseX", mouseX);
  localStorage.setItem("mouseY", mouseY);
});*/

// ==== SUBDROPDOWN ==== //

const subDropdownToggle = document.querySelector(".sub-dropdown-toggle");
const subDropdownContent = document.querySelector(".sub-dropdown-content");

if (subDropdownToggle && subDropdownContent) {
  let hideTimeoutSub;
  let animationTimeoutSub;
  let isClickOpenedSub = false;
  let isMouseOverMenu = false;

  const originalDisplay = window.getComputedStyle(subDropdownContent).display;
  subDropdownContent.style.cssText = `
        transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
        opacity: 0;
        visibility: hidden;
        display: none;
    `;

  const deadZoneElementSub = document.createElement("div");
  deadZoneElementSub.className = "sub-dropdown-dead-zone";

  document.body.appendChild(deadZoneElementSub);
  deadZoneElementSub.style.position = "absolute";
  deadZoneElementSub.style.display = "none";
  deadZoneElementSub.style.zIndex = "999";

  let isClosingInProgressSub = false;

  function positionDeadZoneSub() {
    if (subDropdownContent.style.display !== "none") {
      const toggleRect = subDropdownToggle.getBoundingClientRect();
      const contentRect = subDropdownContent.getBoundingClientRect();

      const viewportWidth = window.innerWidth;
      const isMenuRightAligned =
        toggleRect.right + contentRect.width > viewportWidth;

      if (isMenuRightAligned) {
        deadZoneElementSub.style.left =
          contentRect.right -
          Math.max(contentRect.width, toggleRect.width) +
          window.scrollX +
          "px";
        deadZoneElementSub.style.top =
          toggleRect.bottom + window.scrollY + "px";
        deadZoneElementSub.style.width =
          Math.max(contentRect.width, toggleRect.width) + "px";
        deadZoneElementSub.style.height =
          contentRect.top - toggleRect.bottom + "px";
      } else {
        deadZoneElementSub.style.left =
          Math.min(toggleRect.left, contentRect.left) + window.scrollX + "px";
        deadZoneElementSub.style.top =
          toggleRect.bottom + window.scrollY + "px";
        deadZoneElementSub.style.width =
          Math.max(contentRect.width, toggleRect.width) + "px";
        deadZoneElementSub.style.height =
          contentRect.top - toggleRect.bottom + "px";
      }

      deadZoneElementSub.style.display = "block";
    } else {
      deadZoneElementSub.style.display = "none";
    }
  }

  function showMenuSub() {
    clearTimeout(hideTimeoutSub);
    clearTimeout(animationTimeoutSub);

    isClosingInProgressSub = false;

    subDropdownContent.style.display = originalDisplay || "block";

    setTimeout(() => {
      subDropdownContent.style.opacity = "1";
      subDropdownContent.style.visibility = "visible";

      positionDeadZoneSub();
    }, 10);

    if (window.setSubmenuActive) {
      window.setSubmenuActive(true);
    }

    if (isClickOpenedSub) {
      localStorage.setItem("isSubMenuOpen", "true");
    }
  }

  function smoothCloseSubMenu(skipDelay = false) {
    if (subDropdownContent.style.display === "none") return;

    clearTimeout(hideTimeoutSub);
    clearTimeout(animationTimeoutSub);

    isClosingInProgressSub = true;

    if (subDropdownContent.style.display === "none") {
      subDropdownContent.style.display = originalDisplay || "block";
      requestAnimationFrame(() => {
        subDropdownContent.style.opacity = "0";
        subDropdownContent.style.visibility = "hidden";
      });
    } else {
      subDropdownContent.style.opacity = "0";
      subDropdownContent.style.visibility = "hidden";
    }

    const animationDuration = 400;
    const delay = skipDelay
      ? Math.floor(animationDuration / 2)
      : animationDuration + 50;

    animationTimeoutSub = setTimeout(() => {
      if (!isMouseOverMenu) {
        subDropdownContent.style.display = "none";
        deadZoneElementSub.style.display = "none";

        if (isClickOpenedSub) {
          isClickOpenedSub = false;
          localStorage.removeItem("isSubMenuOpen");
        }

        if (window.setSubmenuActive) {
          window.setSubmenuActive(false);
        }
      } else {
        showMenuSub();
      }

      isClosingInProgressSub = false;
    }, delay);
  }

  function hideMenuSub() {
    if (isMouseOverMenu) return;
    smoothCloseSubMenu();
  }

  window.closeSubMenuWithParent = function () {
    isClickOpenedSub = false;
    smoothCloseSubMenu();
  };

  const mainDropdownToggle = document.querySelector(".dropdown-toggle");
  if (mainDropdownToggle) {
    mainDropdownToggle.addEventListener("mouseenter", function () {
      if (!isMouseOverMenu) {
        smoothCloseSubMenu();
      }
    });
  }

  const mainDropdownContent = document.querySelector(".dropdown-content");
  if (mainDropdownContent) {
    mainDropdownContent.addEventListener("mouseenter", function (e) {
      if (
        e.target === mainDropdownContent &&
        !subDropdownToggle.contains(e.target)
      ) {
        smoothCloseSubMenu();
      }
    });

    mainDropdownContent.addEventListener("mousemove", function (e) {
      const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY);

      if (
        mainDropdownContent.contains(elementUnderMouse) &&
        !subDropdownToggle.contains(elementUnderMouse) &&
        !subDropdownContent.contains(elementUnderMouse) &&
        !deadZoneElementSub.contains(elementUnderMouse)
      ) {
        isMouseOverMenu = false;

        if (subDropdownContent.style.opacity === "1" && !isClickOpenedSub) {
          smoothCloseSubMenu();
        }
      }
    });
  }

  subDropdownToggle.addEventListener("mouseenter", function () {
    isMouseOverMenu = true;

    if (isClosingInProgressSub) {
      showMenuSub();
    } else if (!isClickOpenedSub) {
      showMenuSub();
    }
  });

  subDropdownToggle.addEventListener("mouseleave", function () {
    isMouseOverMenu = false;
  });

  subDropdownToggle.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    clearTimeout(hideTimeoutSub);
    clearTimeout(animationTimeoutSub);

    const isCurrentlyVisible = subDropdownContent.style.opacity === "1";

    if (isCurrentlyVisible && isClickOpenedSub) {
      isMouseOverMenu = false;
      isClickOpenedSub = false;
      localStorage.removeItem("isSubMenuOpen");
      smoothCloseSubMenu(true);
    } else {
      isClickOpenedSub = true;
      isMouseOverMenu = true;
      isClosingInProgressSub = false;

      localStorage.setItem("isSubMenuOpen", "true");

      showMenuSub();
    }
  });
  subDropdownToggle.addEventListener("focus", function() {
  isMouseOverMenu = true;
  if (!isClickOpenedSub) {
    showMenuSub();
  }
});

subDropdownToggle.addEventListener("blur", function() {
  setTimeout(() => {
    if (!subDropdownContent.contains(document.activeElement)) {
      isMouseOverMenu = false;
      if (!isClickOpenedSub) {
        smoothCloseSubMenu();
      }
    }
  }, 100);
});

  const arrowElement = subDropdownToggle.querySelector(
    ".arrow, .dropdown-arrow, .caret, .arrow-icon, i.fa-chevron-down"
  );
  if (arrowElement) {
    arrowElement.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation(); 

      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      });

      subDropdownToggle.dispatchEvent(clickEvent);
    });
  }

  subDropdownContent.addEventListener("mouseenter", function () {
    isMouseOverMenu = true;

    if (isClosingInProgressSub) {
      showMenuSub();
    }

    if (window.setSubmenuActive) {
      window.setSubmenuActive(true);
    }
  });

  subDropdownContent.addEventListener("mouseleave", function () {
    isMouseOverMenu = false;

    if (!isClickOpenedSub) {
      hideTimeoutSub = setTimeout(() => {
        smoothCloseSubMenu();
      }, 300);
    }
  });

  deadZoneElementSub.addEventListener("mouseenter", function () {
    isMouseOverMenu = true;
    clearTimeout(hideTimeoutSub);

    if (isClosingInProgressSub) {
      showMenuSub();
    }
  });

  deadZoneElementSub.addEventListener("mouseleave", function () {
    isMouseOverMenu = false;

    if (!isClickOpenedSub) {
      hideTimeoutSub = setTimeout(() => {
        smoothCloseSubMenu();
      }, 100);
    }
  });

  document.addEventListener("click", function (e) {
    if (
      !subDropdownContent.contains(e.target) &&
      !subDropdownToggle.contains(e.target) &&
      !deadZoneElementSub.contains(e.target)
    ) {
      isMouseOverMenu = false;

      if (isClickOpenedSub) {
        isClickOpenedSub = false;
        localStorage.removeItem("isSubMenuOpen");
        smoothCloseSubMenu();
      }
    }
  });

  window.addEventListener("resize", positionDeadZoneSub);

  if (localStorage.getItem("isSubMenuOpen") === "true") {
    isClickOpenedSub = true;
    showMenuSub();
  }

  subDropdownToggle.classList.add("has-click-listener");

  subDropdownContent.classList.add("fade-dropdown");

  const computedStyle = window.getComputedStyle(subDropdownContent);
  if (
    !computedStyle.transition ||
    computedStyle.transition === "all 0s ease 0s"
  ) {
    subDropdownContent.style.transition =
      "opacity 0.3s ease-in-out, visibility 0.3s ease-in-out";
  }
  if (!subDropdownToggle.hasAttribute('tabindex')) {
    subDropdownToggle.setAttribute('tabindex', '0');
  }

  subDropdownToggle.addEventListener("focus", function() {
    isMouseOverMenu = true;
    if (!isClickOpenedSub) {
      showMenuSub();
    }
  });

  subDropdownToggle.addEventListener("blur", function() {
  });

  if (!window.tabObserverSetup) {
    window.tabObserverSetup = true;
setInterval(() => {
  const activeElement = document.activeElement;

  const dropdown1 = document.getElementById("dropdown-content");
  const toggle1 = document.querySelector(".dropdown-toggle"); 
  const dropdown2 = document.getElementById("dropdown-content-second");
  const toggle2 = document.querySelector(".dropdown-toggle-second");
  const subDropdown = document.querySelector(".sub-dropdown-content");
  const subToggle = document.querySelector(".sub-dropdown-toggle");

  if (
    dropdown1 &&
    dropdown1.contains(activeElement) &&
    (activeElement.tagName === "A" || activeElement.classList.contains("sub-dropdown-toggle"))
  ) {
    window.tabNavigationActive = true;
  } else if (window.tabNavigationActive) {
    window.tabNavigationActive = false;
    if (dropdown1 && dropdown1.style.opacity === "1") {
      if (typeof hideMenu === "function") hideMenu();
      isClickOpened = false;
    }
  }

  if (
    dropdown2 &&
    dropdown2.contains(activeElement) &&
    activeElement.tagName === "A"
  ) {
    window.tabNavigationActive2 = true;
  } else if (window.tabNavigationActive2) {
    window.tabNavigationActive2 = false;
    if (dropdown2 && dropdown2.style.opacity === "1") {
      if (typeof hideMenu2 === "function") hideMenu2();
      isClickOpened2 = false;
    }
  }

  const isArrowFocused = activeElement && activeElement.classList.contains("sub-dropdown-toggle");
  const isInSubmenu = subDropdown && subDropdown.contains(activeElement);
  
  if (isArrowFocused || isInSubmenu) {
    window.tabNavigationActiveSub = true;
    
    if (window.subMenuCloseTimer) {
      clearTimeout(window.subMenuCloseTimer);
      window.subMenuCloseTimer = null;
    }
    
    if (subDropdown && subDropdown.style.opacity !== "1") {
      subDropdown.style.opacity = "1";
      subDropdown.style.visibility = "visible";
      subDropdown.style.display = "block";
      isMouseOverMenu = true;
    }
  } else if (window.tabNavigationActiveSub) {
    if (!window.subMenuCloseTimer && !isClickOpenedSub) {
      window.subMenuCloseTimer = setTimeout(() => {
        const currentActive = document.activeElement;
        const stillOnArrow = currentActive && currentActive.classList.contains("sub-dropdown-toggle");
        const stillInMenu = subDropdown && subDropdown.contains(currentActive);
        
        if (!stillOnArrow && !stillInMenu && !isClickOpenedSub) {
          window.tabNavigationActiveSub = false;
          isMouseOverMenu = false;
          if (subDropdown && subDropdown.style.opacity === "1") {
            subDropdown.style.opacity = "0";
            subDropdown.style.visibility = "hidden";
            setTimeout(() => {
              if (subDropdown && subDropdown.style.display !== "none") {
                subDropdown.style.display = "none";
              }
            }, 300);
          }
        }
        window.subMenuCloseTimer = null;
      }, 200);
    }
  }
}, 200);

if (!window.dropdownEscapeListenerSetup) {
  window.dropdownEscapeListenerSetup = true;

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      const activeElement = document.activeElement;

      const dropdown1 = document.getElementById("dropdown-content");
      const toggle1 = document.querySelector(".dropdown-toggle");
      const dropdown2 = document.getElementById("dropdown-content-second");
      const toggle2 = document.querySelector(".dropdown-toggle-second");
      const subDropdown = document.querySelector(".sub-dropdown-content");
      const subToggle = document.querySelector(".sub-dropdown-toggle");

      if (
        window.tabNavigationActive &&
        dropdown1 &&
        dropdown1.contains(activeElement) &&
        activeElement.tagName === "A"
      ) {
        if (typeof hideMenu === "function") hideMenu();
        isClickOpened = false;
        toggle1?.focus(); 
        event.preventDefault();
      }

      if (
        window.tabNavigationActive2 &&
        dropdown2 &&
        dropdown2.contains(activeElement) &&
        activeElement.tagName === "A"
      ) {
        if (typeof hideMenu2 === "function") hideMenu2();
        isClickOpened2 = false;
        toggle2?.focus();
        event.preventDefault();
      }

      if (
        window.tabNavigationActiveSub &&
        subDropdown &&
        (subDropdown.contains(activeElement) || activeElement === subToggle)
      ) {
        isMouseOverMenu = false;
        if (isClickOpenedSub) {
          isClickOpenedSub = false;
          localStorage.removeItem("isSubMenuOpen");
        }
        smoothCloseSubMenu();
        subToggle?.focus();
        event.preventDefault();
      }
    }
  });
}
  }
}
