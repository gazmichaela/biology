/**
 * ModalImageViewer - Systém pro zobrazení obrázků v modálním okně
 *
 * Umožňuje responzivní prohlížení obrázků s možností zoomování (klik/tap pro desktop, jen klik pro mobile), posouvání a touch ovládání.
 * Automaticky detekuje zařízení a optimalizuje UX pro desktop i mobilní platformy.
 *
 * @fileoverview Modální prohlížeč obrázků s možností zoomu
 * @author Michaela Gažová
 * @version 2.0.3
 * @since 2025-05-05
 * @updated 2026-05-08
 * @license MIT
 */



(function () {
  class ModalImageViewer {
    constructor(options) {
      options = options || {};
      this.zoomFactor = options.zoomFactor || 2.5;
      this.debounceDelay = options.debounceDelay || 100;
      this.transitionDelay = options.transitionDelay || 50;

      this.selectors = {
        zoomableImages: "img.zoomable",
        modal: ".modal-image-viewer",
        modalImg: ".modal-content",
        closeButton: ".modal-close",
        sourceContainer: ".source-container",
        imageContainer: ".image-container",
        mainContainer: ".main-container",
        closeBtnContainer: ".close-btn-container",
      };

      this.cssClasses = {
        modal: "modal-image-viewer",
        modalContent: "modal-content",
        modalClose: "modal-close",
        sourceContainer: "source-container",
        imageContainer: "image-container",
        mainContainer: "main-container",
        closeBtnContainer: "close-btn-container",
        bodyNoScroll: "modal-no-scroll",
      };

      this.elements = {};
      this.state = {
        // isDragging, wasDragging - rozlišujeme tažení od kliknutí
        isDragging: false,
        wasDragging: false,
        isZoomed: false,
        currentScale: 1,
        translateX: 0,
        translateY: 0,
        startX: 0,
        startY: 0,
        lastX: 0,
        lastY: 0,
        touchStartX: 0,
        touchStartY: 0,
        touchMoved: false,
        imgNaturalWidth: 0,
        imgNaturalHeight: 0,
      };

      this.isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        );
      this.isInitialized = false;

      this.handleResize = this._debounce(
        this._onResize.bind(this),
        this.debounceDelay,
      );
      this.handleKeydown = this._onKeydown.bind(this);
      this.handleDocumentClick = this._onDocumentClick.bind(this);

      this.init();
    }

    init() {
      this._createModalStructure();
      this._cacheElements();
      this._addNoSelectionStyles();
      this._setupEventListeners();
      this._preloadImages();
      this.isInitialized = true;
    }

    _createModalStructure() {
      if (document.querySelector(this.selectors.modal)) return;

      this.elements.modal = this._createElement("div", {
        className: this.cssClasses.modal,
        styles: {
          display: "none",
          position: "fixed",
          zIndex: "1000",
          left: "0",
          top: "0",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          alignItems: "center",
          justifyContent: "center",
        },
      });

      this.elements.mainContainer = this._createElement("div", {
        className: this.cssClasses.mainContainer,
        styles: {
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        },
      });

      this.elements.imageContainer = this._createElement("div", {
        className: this.cssClasses.imageContainer,
        styles: {
          position: "relative",
          width: "90%",
          height: "90%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        },
      });

      this.elements.imageWrapper = this._createElement("div", {
        styles: {
          width: this.isMobile ? "100%" : "82%",
          height: this.isMobile ? "100%" : "82%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      });

      // Základní element pro DOM strukturu (zajišťuje centrování)
      this.elements.modalImg = this._createElement("img", {
        className: this.cssClasses.modalContent,
        styles: {
          maxWidth: "100%",
          maxHeight: "100%",
          cursor: "zoom-in",
          transition: "transform 0.4s ease, border-radius 0.4s ease",
          objectFit: "contain",
          background: "transparent",
        },
        attributes: {
          // draggable="false" - aby se nezobrazoval ghost při tažení
          draggable: "false",
          tabIndex: -1,
        },
      });

      this.elements.imageWrapper.appendChild(this.elements.modalImg);
      this.elements.imageContainer.appendChild(this.elements.imageWrapper);

      // Přidává pokročilé styly a funkce
      this.elements.modalImg = this._createElement("img", {
        className: this.cssClasses.modalContent,
        styles: {
          display: "block",
          maxWidth: "100%",
          maxHeight: "100%",
          cursor: "zoom-in",
          transition: "transform 0.4s ease, border-radius 0.4s ease",
          objectFit: "contain",
          outline: "none",
          webkitTapHighlightColor: "transparent",
          userSelect: "none",
          webkitUserSelect: "none",
          msUserSelect: "none",
          mozUserSelect: "none",
          imageRendering: "auto",
          background: "transparent",
          willChange: "transform",
          backfaceVisibility: "hidden",
          filter: "blur(0px)",
        },
        attributes: {
          draggable: "false",
          tabIndex: -1,
        },
      });

      this.elements.sourceContainer = this._createElement("div", {
        className: this.cssClasses.sourceContainer,
        styles: {
          position: "absolute",
          top: "90%",
          transform: "translateY(-90%)",
          right: "20px",
          backgroundColor: "transparent",
          color: "#fff",
          padding: "10px",
          width: "150px",
          fontSize: window.innerWidth < 768 ? "12px" : "14px",
          zIndex: "9999",
          transition: "opacity 0.1s ease",
          opacity: "1",
          textAlign: "left",
        },
      });

      this.elements.closeBtnContainer = this._createElement("div", {
        className: this.cssClasses.closeBtnContainer,
        styles: {
          position: "absolute",
          top: "15px",
          right: "15px",
          width: "30px",
          height: "30px",
          overflow: "hidden",
          zIndex: "1001",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      });

      this.elements.closeButton = this._createElement("span", {
        className: this.cssClasses.modalClose,
        innerHTML: "&times;",
        styles: {
          fontSize: "45px",
          fontWeight: "bold",
          color: "#bbb",
          textDecoration: "none",
          margin: "0",
          padding: "0",
          width: "40px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          lineHeight: "0.5",
          outline: "none",
          webkitTapHighlightColor: "transparent",
          userSelect: "none",
          webkitUserSelect: "none",
          msUserSelect: "none",
          mozUserSelect: "none",
        },
        attributes: {
          tabIndex: -1,
        },
      });

      this.elements.imageContainer.appendChild(this.elements.modalImg);
      this.elements.mainContainer.appendChild(this.elements.imageContainer);
      this.elements.mainContainer.appendChild(this.elements.sourceContainer);
      this.elements.closeBtnContainer.appendChild(this.elements.closeButton);
      this.elements.modal.appendChild(this.elements.closeBtnContainer);
      this.elements.modal.appendChild(this.elements.mainContainer);
      document.body.appendChild(this.elements.modal);
    }

    _createElement(tag, options = {}) {
      const element = document.createElement(tag);

      if (options.className) element.className = options.className;
      if (options.innerHTML) element.innerHTML = options.innerHTML;

      if (options.styles) {
        Object.assign(element.style, options.styles);
      }

      if (options.attributes) {
        Object.entries(options.attributes).forEach(([key, value]) => {
          element.setAttribute(key, value);
        });
      }

      return element;
    }

    _cacheElements() {
      this.elements.modal = document.querySelector(this.selectors.modal);
      this.elements.modalImg = document.querySelector(this.selectors.modalImg);
      this.elements.closeButton = document.querySelector(
        this.selectors.closeButton,
      );
      this.elements.sourceContainer = document.querySelector(
        this.selectors.sourceContainer,
      );
      this.elements.imageContainer = document.querySelector(
        this.selectors.imageContainer,
      );
      this.elements.mainContainer = document.querySelector(
        this.selectors.mainContainer,
      );
      this.elements.closeBtnContainer = document.querySelector(
        this.selectors.closeBtnContainer,
      );
      this.elements.body = document.body;
    }

    _addNoSelectionStyles() {
      const style = document.createElement("style");
      style.innerHTML = `
        img.zoomable, .modal-content {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-tap-highlight-color: transparent !important;
          outline: none !important;
        }
        img.zoomable:focus, .modal-content:focus {
          outline: none !important;
        }
      `;
      document.head.appendChild(style);
    }

    _setupEventListeners() {
      this._setupImageListeners();
      this._setupModalEventListeners();
      this._setupCloseListeners();

      window.addEventListener("resize", this.handleResize);
      document.addEventListener("keydown", this.handleKeydown);
    }

    _setupImageListeners() {
      const images = document.querySelectorAll(this.selectors.zoomableImages);
      images.forEach((img) => {
        img.style.cursor = "pointer";
        img.addEventListener("click", (e) => {
          if (e.detail === 0 || (e.touches && e.touches.length > 1)) return;

          const bigSrc = img.getAttribute("data-full") || img.src;
          const fallbackSrc = img.getAttribute("data-fallback") || null;
          const sourceText = img.getAttribute("data-source") || "";
          const thumbSrc = img.src;

          this.openModal(bigSrc, sourceText, thumbSrc, fallbackSrc);
        });
      });
    }

    _setupModalEventListeners() {
      if (this.elements.modalImg) {
        this._setupImageClickListeners();
        this._setupTouchListeners();
        this._setupMouseListeners();
        this._setupWheelListener();
      }
    }

    _setupImageClickListeners() {
      this.elements.modalImg.addEventListener("click", (e) => {
        if (
          !this.isMobile &&
          !this.state.isDragging &&
          !this.state.wasDragging
        ) {
          this._handleZoomToggle(e.clientX, e.clientY);
        }
        e.preventDefault();
        e.stopPropagation();
      });
    }

    _setupTouchListeners() {
      this.elements.modalImg.addEventListener(
        "touchstart",
        (e) => {
          this.state.touchStartX = e.touches[0].clientX;
          this.state.touchStartY = e.touches[0].clientY;
          this.state.touchMoved = false;

          if (this.state.isZoomed) {
            this.state.isDragging = true;
            this.state.wasDragging = false;
            this.state.startX = e.touches[0].clientX;
            this.state.startY = e.touches[0].clientY;
            this.state.lastX = this.state.startX;
            this.state.lastY = this.state.startY;
            this.elements.modalImg.style.transition = "none";
          }
        },
        { passive: true },
      );

      this.elements.modalImg.addEventListener(
        "touchmove",
        (e) => {
          const touchX = e.touches[0].clientX;
          const touchY = e.touches[0].clientY;

          if (
            Math.abs(touchX - this.state.touchStartX) > 3 ||
            Math.abs(touchY - this.state.touchStartY) > 3
          ) {
            this.state.touchMoved = true;
          }

          if (this.state.isDragging && this.state.isZoomed) {
            this._handleDrag(touchX, touchY);
            e.preventDefault();
          }
        },
        { passive: false },
      );

      this.elements.modalImg.addEventListener("touchend", () => {
        if (this.state.isDragging) {
          this.state.isDragging = false;
          setTimeout(() => {
            this.state.wasDragging = false;
          }, 100);
        }
      });
    }

    _setupMouseListeners() {
      this.elements.modalImg.addEventListener("mousedown", (e) => {
        if (this.state.isZoomed) {
          this.state.isDragging = true;
          this.state.wasDragging = false;
          this.state.startX = e.clientX;
          this.state.startY = e.clientY;
          this.state.lastX = this.state.startX;
          this.state.lastY = this.state.startY;
          this.elements.modalImg.style.cursor = "grabbing";
          this.elements.modalImg.style.transition = "none";
          e.preventDefault();
        }
      });

      document.addEventListener("mousemove", (e) => {
        if (this.state.isDragging && this.state.isZoomed) {
          this._handleDrag(e.clientX, e.clientY);
          e.preventDefault();
        }
      });

      document.addEventListener("mouseup", () => {
        if (this.state.isDragging) {
          this.state.isDragging = false;
          if (this.state.isZoomed) {
            this.elements.modalImg.style.cursor = "zoom-out";
          }
          setTimeout(() => {
            this.state.wasDragging = false;
          }, 100);
        }
      });

      if (!this.isMobile) {
        this.elements.closeButton.addEventListener("mouseenter", function () {
          this.style.color = "#fff";
        });

        this.elements.closeButton.addEventListener("mouseleave", function () {
          this.style.color = "#bbb";
        });
      }
    }

    _setupWheelListener() {
      this.elements.modalImg.addEventListener(
        "wheel",
        (e) => {
          e.preventDefault();

          if (e.deltaY < 0 && !this.state.isZoomed) {
            this._handleZoomToggle(e.clientX, e.clientY);
          } else if (e.deltaY > 0 && this.state.isZoomed) {
            this.resetZoom();
          }
        },
        { passive: false },
      );
    }

    _setupCloseListeners() {
      if (this.elements.closeBtnContainer) {
        this.elements.closeBtnContainer.addEventListener("click", (e) => {
          this.closeModal();
          e.stopPropagation();
          e.preventDefault();
        });

        this.elements.closeBtnContainer.addEventListener("touchend", (e) => {
          this.closeModal();
          e.stopPropagation();
          e.preventDefault();
        });
      }

      if (this.elements.modal) {
        this.elements.modal.addEventListener("click", (e) => {
          if (!this.state.wasDragging && e.target !== this.elements.modalImg) {
            this.closeModal();
          }
        });
      }
    }

    _handleDrag(x, y) {
      const deltaX = x - this.state.lastX;
      const deltaY = y - this.state.lastY;

      this.state.lastX = x;
      this.state.lastY = y;

      this.state.translateX += deltaX;
      this.state.translateY += deltaY;

      this.elements.modalImg.style.transform = `translate(${this.state.translateX}px, ${this.state.translateY}px) scale(${this.state.currentScale})`;

      if (
        Math.abs(x - this.state.startX) > 5 ||
        Math.abs(y - this.state.startY) > 5
      ) {
        this.state.wasDragging = true;
      }
    }

    _handleZoomToggle(x, y) {
      if (!this.state.isZoomed) {
        this.state.isZoomed = true;
        this.state.currentScale = this.zoomFactor;
        this.elements.modalImg.style.cursor = "zoom-out";
        // Zoom na místo, kde uživatel klikl (u desktopu)
        this._zoomAtPoint(x, y);
      } else {
        this.resetZoom();
      }
    }

    _zoomAtPoint(pointX, pointY) {
      const rect = this.elements.modalImg.getBoundingClientRect();

      const relX = (pointX - rect.left) / rect.width;
      const relY = (pointY - rect.top) / rect.height;

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      this.elements.modalImg.style.maxWidth = "none";
      this.elements.modalImg.style.maxHeight = "none";
      this.elements.modalImg.style.borderRadius = "20px";

      this._toggleSourceVisibility(false);

      requestAnimationFrame(() => {
        // this.elements.modalImg.style.transform = `scale(${this.state.currentScale})`;

        requestAnimationFrame(() => {
          const scaledRect = this.elements.modalImg.getBoundingClientRect();
          const scaledPointX = scaledRect.left + relX * scaledRect.width;
          const scaledPointY = scaledRect.top + relY * scaledRect.height;

          const baseTranslateX = centerX - scaledPointX;
          const baseTranslateY = centerY - scaledPointY;

          const correctionFactors = this._getCorrectionFactors();

          this.state.translateX =
            baseTranslateX * correctionFactors.x + correctionFactors.fixX;
          this.state.translateY =
            baseTranslateY * correctionFactors.y + correctionFactors.fixY;

          const finalTransform = `translate3d(${Math.round(
            this.state.translateX,
          )}px, ${Math.round(this.state.translateY)}px, 0) scale(${
            this.state.currentScale
          })`;

          if (this._prefersReducedMotion()) {
            this.elements.modalImg.style.transition = "none";
          }
          this.elements.modalImg.style.transform = finalTransform;
          this.elements.modalImg.style.webkitTransform = finalTransform;
        });
      });
    }

    // Každý obrázek má jiné korekční faktory
    _getCorrectionFactors() {
  const imgWidth = this.state.imgNaturalWidth;
  const imgHeight = this.state.imgNaturalHeight;

  if (imgWidth === 5780 && imgHeight === 3987) {
    return { x: 0.49, y: 0.49, fixX: 0, fixY: 0 };
  } else if (imgWidth === 2200 && imgHeight === 1772) {
    return { x: 0.65, y: 0.65, fixX: 0, fixY: 0 };
  } else if (imgWidth === 2052 && imgHeight === 1508) {
    return { x: 0.75, y: 0.75, fixX: 0, fixY: 0 };
  } else if (imgWidth === 505 && imgHeight === 448) {
    return { x: 2.0, y: 2.0, fixX: 0, fixY: 0 };
  } else if (imgWidth === 679 && imgHeight === 416) {
    return { x: 2.0, y: 2.0, fixX: 0, fixY: 0 };
 } else if (imgWidth === 1076 && imgHeight === 1064) {
  return { x: 0.7, y: 0.7, fixX: 0, fixY: 0 };
} else if (imgWidth === 4500 && imgHeight === 3800) {
  return { x: 0.49, y: 0.49, fixX: 0, fixY: 0 };
} else {
  return { x: 0.58, y: 0.58, fixX: 0, fixY: 0 };
}
}

   _setZoomFactor() {
  const width = this.state.imgNaturalWidth;
  const height = this.state.imgNaturalHeight;

  if (width === 5780 && height === 3987) {
    this.zoomFactor = 0.5;
  } else if (width === 2200 && height === 1772) {
    this.zoomFactor = 0.7;
  } else if (width === 2052 && height === 1508) {
    this.zoomFactor = 0.8;
  } else if (width === 505 && height === 448) {
    this.zoomFactor = 2.0;
  } else if (width === 679 && height === 416) {
    this.zoomFactor = 2.0;
  } else if (width === 1076 && height === 1064) {
    this.zoomFactor = 0.8;
  } else if (width === 4500 && height === 3800) {
    this.zoomFactor = 0.55;
  } else if (width === 2800 && height === 2800) {
    this.zoomFactor = 0.7;
  } else if (width === 1920 && height === 1358) {
    this.zoomFactor = 0.9;
  } else if (width === 1900 && height === 1069) {
    this.zoomFactor = 0.9;
  } else if (width === 1868 && height === 1297) {
    this.zoomFactor = 0.9;
  } else if (width === 1774 && height === 887) {
    this.zoomFactor = 0.9;
  } else if (width === 1578 && height === 1263) {
    this.zoomFactor = 0.9;
  } else if (width === 1469 && height === 822) {
    this.zoomFactor = 1.0;
  } else if (width === 1330 && height === 704) {
    this.zoomFactor = 1.0;
  } else if (width === 972 && height === 547) {
    this.zoomFactor = 1.2;
  } else if (width === 811 && height === 586) {
    this.zoomFactor = 1.2;
  } else {
    if (width > 3000) {
      this.zoomFactor = 0.6;
    } else if (width > 1500) {
      this.zoomFactor = 3.0;
    } else if (width > 800) {
      this.zoomFactor = 2.5;
    } else if (width > 400) {
      this.zoomFactor = 2.0;
    } else {
      this.zoomFactor = 1.8;
    }
  }
}
    _toggleSourceVisibility(visible) {
      if (this.elements.sourceContainer) {
        this.elements.sourceContainer.style.opacity = visible ? "1" : "0";
      }
    }

    _updateSourceContainerLayout() {
      const src = this.elements.sourceContainer;
      if (!src.innerHTML) {
        src.style.display = "none";
        src.style.width = "";
        return;
      }

      this._calculateBestLayout();
    }

    // Výpočet nejlepší pozice pro source kontejner
    _calculateBestLayout() {
      const src = this.elements.sourceContainer;

      src.style.display = "block";
      src.style.visibility = "hidden";
      src.style.position = "fixed";
      src.style.left = "0px";
      src.style.top = "0px";
      src.style.right = "auto";
      src.style.marginTop = "0";
      src.style.transform = "translateX(0)";
      src.style.width = "";
      src.style.whiteSpace = "";
      src.style.wordBreak = "";

      const imgRect = this.elements.modalImg.getBoundingClientRect();
      const modalRect = this.elements.modal.getBoundingClientRect();

      const srcRect = src.getBoundingClientRect();
      const rightSpace = modalRect.right - imgRect.right - 10;
      const bottomSpaceRight = modalRect.bottom - imgRect.bottom - 10;

      const offset =
        window.innerWidth < 768 ? 15 : window.innerWidth < 1200 ? 25 : 40;

      if (
        rightSpace >= srcRect.width &&
        bottomSpaceRight >= srcRect.height + offset
      ) {
        src.style.position = "absolute";
        src.style.left = imgRect.right - modalRect.left + 10 + "px";
        const extraOffset = -70;
        src.style.top =
          imgRect.bottom - modalRect.top + offset + extraOffset + "px";

        src.style.right = "auto";
        src.style.marginTop = "0";
        src.style.width = "";
        src.style.display = "block";
        src.style.visibility = "visible";
        src.style.whiteSpace = "";
        src.style.wordBreak = "";
        return;
      }

      const imgWidth = imgRect.width;
      const modalWidth = modalRect.width;
      const maxWidth = Math.min(imgWidth, modalWidth - 40);

      src.style.width = maxWidth + "px";
      src.style.whiteSpace = "normal";
      src.style.wordBreak = "break-word";

      const srcRectAfter = src.getBoundingClientRect();
      const bottomSpace = modalRect.bottom - imgRect.bottom - 10;

      if (bottomSpace >= srcRectAfter.height) {
        src.style.position = "absolute";
        src.style.left = "50%";
        src.style.top = imgRect.bottom - modalRect.top + 10 + "px";
        src.style.right = "auto";
        src.style.transform = "translateX(-50%)";
        src.style.marginTop = "0";
        src.style.display = "block";
        src.style.visibility = "visible";
        return;
      }

      src.style.display = "none";
      src.style.width = "";
      src.style.whiteSpace = "";
      src.style.wordBreak = "";
    }

    _preloadImages() {
      const images = document.querySelectorAll(this.selectors.zoomableImages);
      images.forEach((img) => {
        const srcWebp = img.getAttribute("data-full") || img.src;
        const srcPng = img.getAttribute("data-fallback") || null;

        const preloadImgWebp = new Image();
        preloadImgWebp.src = srcWebp;
        if (srcPng) {
          const preloadImgPng = new Image();
          preloadImgPng.src = srcPng;
        }
      });
    }

    _onResize() {
      if (
        this.elements.modal &&
        this.elements.modal.style.display === "flex" &&
        this.elements.sourceContainer &&
        this.elements.sourceContainer.innerHTML
      ) {
        this._updateSourceContainerLayout();
      }
    }

    _onKeydown(event) {
      if (event.key === "Escape") {
        this.closeModal();
      }
    }

    _onDocumentClick(e) {
      // Zavírání modal při kliknutí mimo obrázek
    }

    _debounce(fn, delay) {
      let timeout;
      return (...args) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
      };
    }

    _prefersReducedMotion() {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    openModal(imgSrc, sourceText, thumbSrc = null, fallbackSrc = null) {
      this.elements.modal.style.display = "flex";
      this.elements.sourceContainer.innerHTML = sourceText || "";
      this.elements.sourceContainer.style.display = "none";
      this.elements.sourceContainer.style.visibility = "hidden";
      this.resetZoom();
      this.elements.modalImg.style.visibility = "hidden";

      const bigImg = new Image();
      bigImg.loading = "eager";
      bigImg.fetchPriority = "high";
      bigImg.onload = () => {
        this.elements.modalImg.src = imgSrc;
        this.state.imgNaturalWidth = bigImg.naturalWidth;
        this.state.imgNaturalHeight = bigImg.naturalHeight;
        this._setZoomFactor();
        this.resetZoom();
        this.elements.modalImg.style.visibility = "visible";

        requestAnimationFrame(() => {
          this._updateSourceContainerLayout();
        });
      };
      bigImg.onerror = () => {
        if (fallbackSrc) {
          this.elements.modalImg.src = fallbackSrc;
          this.elements.modalImg.style.visibility = "visible";
          requestAnimationFrame(() => {
            this._updateSourceContainerLayout();
          });
        }
      };
      bigImg.src = imgSrc;

      this.elements.body.style.overflow = "hidden";
      this.scrollY = window.scrollY;
      document.body.style.top = `-${this.scrollY}px`;
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    }

    closeModal() {
      this.resetZoom();
      this._toggleSourceVisibility(true);
      this.elements.modal.style.display = "none";

      const scrollY = this.scrollY || 0;

      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      this.elements.body.style.overflow = "";

      document.documentElement.style.scrollBehavior = "auto";
      window.scrollTo(0, scrollY);
      document.documentElement.style.scrollBehavior = "";
    }

    resetZoom() {
      this.state.isZoomed = false;
      this.state.currentScale = 1;
      this.state.translateX = 0;
      this.state.translateY = 0;

      this.elements.modalImg.style.cursor = this.isMobile
        ? "default"
        : "zoom-in";
      this.elements.modalImg.style.maxWidth = "100%";
      this.elements.modalImg.style.maxHeight = "100%";
      this.elements.modalImg.style.borderRadius = "10px";
      this.elements.modalImg.style.transformOrigin = "center";
      this.elements.modalImg.style.transform = "translate(0px, 0px) scale(1)";
      this.elements.modalImg.style.transition = this._prefersReducedMotion()
        ? "none"
        : "transform 0.4s ease, border-radius 0.4s ease";

      this.elements.modalImg.style.imageRendering = "auto";
      this.elements.modalImg.style.setProperty("image-rendering", "smooth");
      this.elements.modalImg.style.setProperty(
        "image-rendering",
        "-webkit-optimize-contrast",
      );
      this.elements.modalImg.style.background = "transparent";
      this.elements.modalImg.style.willChange = "transform";
      this.elements.modalImg.style.backfaceVisibility = "hidden";
      this.elements.modalImg.style.filter = "blur(0px)";

      const handleTransitionEnd = () => {
        if (!this.state.isZoomed) {
          this._toggleSourceVisibility(true);
        }
        this.elements.modalImg.removeEventListener(
          "transitionend",
          handleTransitionEnd,
        );
      };
      this.elements.modalImg.addEventListener(
        "transitionend",
        handleTransitionEnd,
      );
    }

    refresh() {
      this._cacheElements();
      this._setupImageListeners();
    }

    destroy() {
      window.removeEventListener("resize", this.handleResize);
      document.removeEventListener("keydown", this.handleKeydown);

      if (this.elements.modal) {
        this.elements.modal.remove();
      }

      this.elements = {};
      this.state = {};
      this.isInitialized = false;
    }
  }

  let modalImageViewer;
  document.addEventListener("DOMContentLoaded", function () {
    modalImageViewer = new ModalImageViewer();

    window.openModal = (imgSrc, sourceText, thumbSrc, fallbackSrc) =>
      modalImageViewer.openModal(imgSrc, sourceText, thumbSrc, fallbackSrc);
    window.closeModal = () => modalImageViewer.closeModal();
    window.refreshModalViewer = () => modalImageViewer.refresh();
  });
})();

/* (tento script používá formátování prettier) */