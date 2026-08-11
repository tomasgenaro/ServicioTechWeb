(() => {
  "use strict";

  document.documentElement.classList.add("js-enabled");

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const navigation = document.querySelector("[data-navigation]");

  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (menuToggle && navigation) {
    const closeMenu = ({ returnFocus = false } = {}) => {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Abrir menú");
      navigation.classList.remove("is-open");
      document.body.classList.remove("menu-open");

      if (returnFocus) menuToggle.focus();
    };

    const openMenu = () => {
      menuToggle.setAttribute("aria-expanded", "true");
      menuToggle.setAttribute("aria-label", "Cerrar menú");
      navigation.classList.add("is-open");
      document.body.classList.add("menu-open");

      const firstLink = navigation.querySelector("a");
      if (firstLink) firstLink.focus({ preventScroll: true });
    };

    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      if (isOpen) closeMenu();
      else openMenu();
    });

    navigation.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navigation.classList.contains("is-open")) {
        closeMenu({ returnFocus: true });
      }
    });

    document.addEventListener("pointerdown", (event) => {
      if (
        navigation.classList.contains("is-open") &&
        !navigation.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 1024) closeMenu();
    });
  }

  const revealElements = [...document.querySelectorAll(".reveal")];
  const revealGroups = [
    ".hero-grid > .reveal",
    ".featured-services > .reveal",
    ".secondary-services > .reveal",
    ".process-list > .reveal",
    ".review-grid > .reveal",
    ".location-card > .reveal",
  ];

  revealGroups.forEach((selector) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      element.style.setProperty(
        "--reveal-delay",
        `${Math.min(index * 90, 270)}ms`,
      );
    });
  });

  if ("IntersectionObserver" in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -8%",
        threshold: 0.08,
      },
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  const initializeCarousel = (carousel) => {
    const track = carousel.querySelector("[data-carousel-track]");
    if (!track) return;

    const items = [
      ...track.querySelectorAll(".gallery-card:not([data-carousel-clone])"),
    ];
    const controls = carousel.querySelector("[data-carousel-controls]");
    const previousButton = carousel.querySelector("[data-carousel-prev]");
    const nextButton = carousel.querySelector("[data-carousel-next]");
    const dotsContainer = carousel.querySelector("[data-carousel-dots]");
    const gallerySection = carousel.closest(".work-gallery") || carousel;

    if (
      items.length < 2 ||
      !controls ||
      !previousButton ||
      !nextButton ||
      !dotsContainer
    ) return;

    items.forEach((item, index) => {
      item.dataset.carouselIndex = String(index);
    });

    let activeIndex = 0;
    let dots = [];
    let dotsTrack = null;
    let scrollFrame = null;
    let resizeFrame = null;
    let desktopTimer = null;
    let currentMode = null;
    let desktopEventCounter = 0;
    let desktopSourceIndexes = [0, 1, 2, 3];
    let desktopCompositeHoldTimer = null;
    let compositeFormationActive = false;
    let compositeHoldActive = false;
    let galleryInView = false;
    let initialCompositeScheduled = false;
    let desktopSequenceToken = 0;
    const activeDesktopSlots = new Set();
    const desktopStartTimers = new Set();
    const desktopCompositeTimers = new Set();
    const lockedCompositeSlots = new Set();
    const reservedCompositeSlots = new Set();
    const desktopMedia = window.matchMedia("(min-width: 64rem)");
    const desktopTransitionDuration = 2150;
    const compositeExitDuration = 2400;
    const compositeHoldDuration = 5000;
    const initialCompositeDelay = 10000;
    const compositeReturnMin = 15000;
    const compositeReturnMax = 30000;
    const gallerySources = items.map((item) => {
      const image = item.querySelector("img");
      return {
        src: image?.getAttribute("src") || "",
        alt: image?.getAttribute("alt") || "Servicio técnico de ServicioTech",
      };
    });
    const desktopCompositeSources = [
      {
        src: "assets/images/serviciotech-composite-01.webp",
        alt: "ServicioTech, composición de marca, panel 1 de 4",
      },
      {
        src: "assets/images/serviciotech-composite-02.webp",
        alt: "ServicioTech, composición de marca, panel 2 de 4",
      },
      {
        src: "assets/images/serviciotech-composite-03.webp",
        alt: "ServicioTech, composición de marca, panel 3 de 4",
      },
      {
        src: "assets/images/serviciotech-composite-04.webp",
        alt: "ServicioTech, composición de marca, panel 4 de 4",
      },
    ];

    const clearClones = () => {
      track.querySelectorAll("[data-carousel-clone]").forEach((clone) => {
        clone.remove();
      });
    };

    const getItemStep = () => {
      const trackStyles = window.getComputedStyle(track);
      const gap = Number.parseFloat(trackStyles.columnGap) || 0;
      return (items[0]?.offsetWidth || 0) + gap;
    };

    const getScrollProgress = () => {
      const step = getItemStep();
      if (step <= 0) return activeIndex;

      return Math.max(
        0,
        Math.min(items.length - 1, track.scrollLeft / step),
      );
    };

    const updateDotWheel = () => {
      if (!dotsTrack || dots.length === 0) return;

      const progress = getScrollProgress();
      const selectedIndex = Math.round(progress);

      dots.forEach((dot, index) => {
        const distance = Math.abs(index - progress);
        const scale = Math.max(0.42, 1 - distance * 0.19);
        const verticalOffset = Math.min(2.7, distance * 0.8);
        const opacity = Math.max(0.5, 1 - distance * 0.11);

        dot.style.setProperty("--dot-scale", scale.toFixed(3));
        dot.style.setProperty("--dot-y", `${verticalOffset.toFixed(2)}px`);
        dot.style.setProperty("--dot-opacity", opacity.toFixed(2));
        dot.setAttribute(
          "aria-current",
          index === selectedIndex ? "true" : "false",
        );
      });

      const firstDot = dots[0];
      const dotStep = dots[1]
        ? dots[1].offsetLeft - firstDot.offsetLeft
        : firstDot.offsetWidth;
      const progressCenter =
        firstDot.offsetLeft + firstDot.offsetWidth / 2 + progress * dotStep;
      const viewportCenter = dotsContainer.clientWidth / 2;

      dotsTrack.style.setProperty(
        "--dots-wheel-offset",
        `${viewportCenter - progressCenter}px`,
      );
    };

    const restoreGallerySources = () => {
      items.forEach((item, index) => {
        const image = item.querySelector("img");
        if (image) {
          delete image.dataset.galleryTransition;
          image.getAnimations().forEach((animation) => animation.cancel());
        }

        item.classList.remove(
          "is-changing",
          "is-changing--dissolve",
          "is-changing--reduced",
        );
        item.style.removeProperty("--gallery-transition-duration");

        item.querySelectorAll(".gallery-transition-image").forEach((overlay) => {
          overlay.remove();
        });

        const source = gallerySources[index];
        if (!image || !source) return;
        image.src = source.src;
        image.alt = source.alt;
      });
    };

    const transitionDesktopImage = (
      image,
      source,
      {
        direction = "from-left",
        duration = desktopTransitionDuration,
        effect = "cinematic",
        onComplete,
      } = {},
    ) => {
      let completed = false;
      const completeTransition = () => {
        if (completed) return;
        completed = true;
        onComplete?.();
      };

      if (!source?.src || image.getAttribute("src") === source.src) {
        completeTransition();
        return;
      }

      const parent = image.parentElement;
      if (!parent) {
        completeTransition();
        return;
      }

      const lowMotion = reducedMotion.matches;
      const effectiveDuration = lowMotion
        ? Math.min(1200, Math.max(900, Math.round(duration * 0.55)))
        : duration;

      const overlay = new Image();
      const transitionToken = `${Date.now()}-${Math.random()}`;
      let revealed = false;
      let committed = false;
      let outgoingAnimation = null;

      image.dataset.galleryTransition = transitionToken;
      overlay.className = "gallery-transition-image";
      overlay.alt = "";
      overlay.decoding = "async";
      overlay.setAttribute("aria-hidden", "true");

      const commitImage = () => {
        if (committed) return;
        committed = true;

        if (
          image.dataset.galleryTransition !== transitionToken ||
          !desktopMedia.matches
        ) {
          overlay.remove();
          completeTransition();
          return;
        }

        image.src = source.src;
        image.alt = source.alt;
        delete image.dataset.galleryTransition;
        outgoingAnimation?.cancel();
        const finishCommit = () => {
          window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
              overlay.remove();
              parent.classList.remove(
                "is-changing",
                "is-changing--dissolve",
                "is-changing--reduced",
              );
              parent.style.removeProperty("--gallery-transition-duration");
              completeTransition();
            });
          });
        };

        if (typeof image.decode === "function") {
          image.decode().catch(() => {}).finally(finishCommit);
        } else {
          finishCommit();
        }
      };

      const revealImage = () => {
        if (revealed) return;
        revealed = true;
        parent.append(overlay);
        parent.classList.add("is-changing");
        parent.classList.toggle("is-changing--dissolve", effect === "dissolve");
        parent.classList.toggle("is-changing--reduced", lowMotion);
        parent.style.setProperty(
          "--gallery-transition-duration",
          `${effectiveDuration}ms`,
        );

        if (typeof overlay.animate !== "function") {
          overlay.style.setProperty(
            "--gallery-transition-duration",
            `${effectiveDuration}ms`,
          );
          overlay.classList.add("is-visible");
          window.setTimeout(commitImage, effectiveDuration);
          return;
        }

        const revealFromLeft = direction === "from-left";
        const incomingShift = revealFromLeft ? "-3.2%" : "3.2%";
        const outgoingShift = revealFromLeft ? "1.35%" : "-1.35%";
        const isDissolve = effect === "dissolve";
        const incomingFrames = lowMotion
          ? [
              {
                opacity: 0,
                filter: "none",
                transform: "none",
              },
              {
                opacity: 0.18,
                filter: "none",
                transform: "none",
                offset: 0.28,
              },
              {
                opacity: 0.76,
                filter: "none",
                transform: "none",
                offset: 0.76,
              },
              {
                opacity: 1,
                filter: "none",
                transform: "none",
              },
            ]
          : isDissolve
          ? [
              {
                opacity: 0,
                filter: "blur(7px) saturate(0.9) brightness(1.035)",
                transform: "translate3d(0, 1.4%, 0) scale(1.035)",
              },
              {
                opacity: 0.16,
                filter: "blur(5.4px) saturate(0.93) brightness(1.025)",
                transform: "translate3d(0, 1.05%, 0) scale(1.026)",
                offset: 0.24,
              },
              {
                opacity: 0.72,
                filter: "blur(1.8px) saturate(0.98) brightness(1.008)",
                transform: "translate3d(0, 0.3%, 0) scale(1.008)",
                offset: 0.74,
              },
              {
                opacity: 1,
                filter: "blur(0) saturate(1) brightness(1)",
                transform: "translate3d(0, 0, 0) scale(1)",
              },
            ]
          : [
              {
                opacity: 0,
                filter: "blur(8px) saturate(0.9) brightness(1.045)",
                transform: `translate3d(${incomingShift}, 1.2%, 0) scale(1.045)`,
              },
              {
                opacity: 0.14,
                filter: "blur(6px) saturate(0.93) brightness(1.032)",
                transform: `translate3d(${incomingShift}, 0.9%, 0) scale(1.032)`,
                offset: 0.22,
              },
              {
                opacity: 0.68,
                filter: "blur(2px) saturate(0.98) brightness(1.012)",
                transform: `translate3d(${revealFromLeft ? "-0.45%" : "0.45%"}, 0.2%, 0) scale(1.009)`,
                offset: 0.7,
              },
              {
                opacity: 1,
                filter: "blur(0) saturate(1) brightness(1)",
                transform: "translate3d(0, 0, 0) scale(1)",
              },
            ];
        const outgoingFrames = lowMotion
          ? [
              {
                opacity: 1,
                filter: "none",
                transform: "none",
              },
              {
                opacity: 0.84,
                filter: "none",
                transform: "none",
                offset: 0.36,
              },
              {
                opacity: 0.24,
                filter: "none",
                transform: "none",
                offset: 0.84,
              },
              {
                opacity: 0.04,
                filter: "none",
                transform: "none",
              },
            ]
          : isDissolve
          ? [
              {
                opacity: 1,
                filter: "blur(0) saturate(1) brightness(1)",
                transform: "translate3d(0, 0, 0) scale(1)",
              },
              {
                opacity: 0.86,
                filter: "blur(0.5px) saturate(0.98) brightness(0.995)",
                transform: "translate3d(0, -0.2%, 0) scale(0.997)",
                offset: 0.34,
              },
              {
                opacity: 0.28,
                filter: "blur(3px) saturate(0.9) brightness(0.96)",
                transform: "translate3d(0, -0.7%, 0) scale(0.982)",
                offset: 0.82,
              },
              {
                opacity: 0.06,
                filter: "blur(4px) saturate(0.86) brightness(0.93)",
                transform: "translate3d(0, -0.9%, 0) scale(0.977)",
              },
            ]
          : [
              {
                opacity: 1,
                filter: "blur(0) saturate(1) brightness(1)",
                transform: "translate3d(0, 0, 0) scale(1)",
              },
              {
                opacity: 0.9,
                filter: "blur(0.35px) saturate(0.985) brightness(0.995)",
                transform: `translate3d(${outgoingShift}, -0.1%, 0) scale(0.997)`,
                offset: 0.34,
              },
              {
                opacity: 0.3,
                filter: "blur(3px) saturate(0.9) brightness(0.955)",
                transform: `translate3d(${outgoingShift}, -0.55%, 0) scale(0.982)`,
                offset: 0.82,
              },
              {
                opacity: 0.05,
                filter: "blur(4.4px) saturate(0.86) brightness(0.925)",
                transform: `translate3d(${outgoingShift}, -0.75%, 0) scale(0.976)`,
              },
            ];

        const incomingAnimation = overlay.animate(
          incomingFrames,
          {
            duration: effectiveDuration,
            easing: "cubic-bezier(0.16, 0.84, 0.24, 1)",
            fill: "forwards",
          },
        );

        outgoingAnimation = image.animate(
          outgoingFrames,
          {
            duration: effectiveDuration,
            easing: "cubic-bezier(0.32, 0, 0.18, 1)",
            fill: "forwards",
          },
        );

        Promise.allSettled([
          incomingAnimation.finished,
          outgoingAnimation.finished,
        ]).then(commitImage);
      };

      overlay.addEventListener("load", revealImage, { once: true });
      overlay.addEventListener("error", commitImage, { once: true });
      overlay.src = source.src;

      if (overlay.complete && overlay.naturalWidth > 0) {
        window.requestAnimationFrame(revealImage);
      }
    };

    const shuffle = (values) => {
      const shuffled = [...values];
      for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[randomIndex]] = [
          shuffled[randomIndex],
          shuffled[index],
        ];
      }
      return shuffled;
    };

    const isValidDesktopArrangement = (arrangement) => {
      if (new Set(arrangement).size !== arrangement.length) return false;

      for (let index = 0; index < arrangement.length - 1; index += 1) {
        const pair = [arrangement[index], arrangement[index + 1]];
        if (pair.includes(1) && pair.includes(4)) return false;
      }

      return true;
    };

    const planDesktopSources = (slots) => {
      const availableSources = shuffle(
        gallerySources
          .map((_, index) => index)
          .filter((index) => !desktopSourceIndexes.includes(index)),
      );
      const arrangement = [...desktopSourceIndexes];

      const assignSource = (position, remainingSources) => {
        if (position >= slots.length) {
          return isValidDesktopArrangement(arrangement)
            ? [...arrangement]
            : null;
        }

        const slot = slots[position];
        for (const sourceIndex of remainingSources) {
          const previousSourceIndex = desktopSourceIndexes[slot];
          const isForbiddenSuccession =
            (previousSourceIndex === 1 && sourceIndex === 4) ||
            (previousSourceIndex === 4 && sourceIndex === 1);

          if (isForbiddenSuccession) continue;

          arrangement[slot] = sourceIndex;
          const result = assignSource(
            position + 1,
            remainingSources.filter((index) => index !== sourceIndex),
          );
          if (result) return result;
        }

        arrangement[slot] = desktopSourceIndexes[slot];
        return null;
      };

      return assignSource(0, availableSources);
    };

    const clearCompositeFormationTimers = () => {
      desktopCompositeTimers.forEach((timer) => window.clearTimeout(timer));
      desktopCompositeTimers.clear();
    };

    const clearCompositeTimers = () => {
      clearCompositeFormationTimers();
      if (desktopCompositeHoldTimer) {
        window.clearTimeout(desktopCompositeHoldTimer);
      }
      desktopCompositeHoldTimer = null;
    };

    const stopDesktopRotation = () => {
      if (desktopTimer) window.clearTimeout(desktopTimer);
      desktopTimer = null;
      clearCompositeTimers();
      desktopSequenceToken += 1;
      compositeFormationActive = false;
      compositeHoldActive = false;
      desktopStartTimers.forEach((timer) => window.clearTimeout(timer));
      desktopStartTimers.clear();
      activeDesktopSlots.clear();
      lockedCompositeSlots.clear();
      reservedCompositeSlots.clear();
    };

    const completeCompositeFormation = (sequenceToken) => {
      if (
        sequenceToken !== desktopSequenceToken ||
        lockedCompositeSlots.size !== desktopCompositeSources.length
      ) {
        return;
      }

      clearCompositeFormationTimers();
      reservedCompositeSlots.clear();
      compositeFormationActive = false;
      compositeHoldActive = true;
      const exitArrangement =
        planDesktopSources([0, 1, 2, 3]) || [0, 2, 5, 7];
      const exitSources = exitArrangement.map(
        (sourceIndex) => gallerySources[sourceIndex],
      );
      const exitImagesReady = Promise.allSettled(
        exitSources.map(
          (source) =>
            new Promise((resolve) => {
              const preloader = new Image();
              preloader.addEventListener("load", resolve, { once: true });
              preloader.addEventListener("error", resolve, { once: true });
              preloader.src = source.src;
              if (preloader.complete) resolve();
            }),
        ),
      );

      desktopCompositeHoldTimer = window.setTimeout(() => {
        desktopCompositeHoldTimer = null;
        if (
          sequenceToken !== desktopSequenceToken ||
          !desktopMedia.matches
        ) {
          return;
        }

        exitImagesReady.then(() => {
          if (
            sequenceToken !== desktopSequenceToken ||
            !desktopMedia.matches ||
            document.hidden
          ) {
            return;
          }

          desktopSourceIndexes = [...exitArrangement];
          let completedExits = 0;

          exitSources.forEach((source, slot) => {
            const image = items[slot]?.querySelector("img");
            if (!image) return;

            activeDesktopSlots.add(slot);
            transitionDesktopImage(image, source, {
              duration: compositeExitDuration,
              effect: "dissolve",
              onComplete: () => {
                if (sequenceToken !== desktopSequenceToken) return;
                activeDesktopSlots.delete(slot);
                completedExits += 1;

                if (completedExits !== exitSources.length) return;

                lockedCompositeSlots.clear();
                compositeHoldActive = false;
                scheduleDesktopRotation(true);
                scheduleCompositeFormation(
                  compositeHoldDuration + compositeExitDuration,
                );
              },
            });
          });
        });
      }, compositeHoldDuration);
    };

    const startCompositePiece = (slot, sequenceToken) => {
      const marker = `composite-${slot + 1}`;

      const tryStart = () => {
        if (
          sequenceToken !== desktopSequenceToken ||
          !desktopMedia.matches ||
          document.hidden ||
          lockedCompositeSlots.has(slot)
        ) {
          reservedCompositeSlots.delete(slot);
          return;
        }

        if (desktopSourceIndexes[slot] === marker) {
          const retryTimer = window.setTimeout(() => {
            desktopCompositeTimers.delete(retryTimer);
            tryStart();
          }, 140);
          desktopCompositeTimers.add(retryTimer);
          return;
        }

        reservedCompositeSlots.add(slot);
        const hasNearbyTransition = [...activeDesktopSlots].some(
          (activeSlot) => Math.abs(activeSlot - slot) <= 1,
        );

        if (hasNearbyTransition) {
          const retryTimer = window.setTimeout(() => {
            desktopCompositeTimers.delete(retryTimer);
            tryStart();
          }, 90);
          desktopCompositeTimers.add(retryTimer);
          return;
        }

        const image = items[slot]?.querySelector("img");
        if (!image) {
          reservedCompositeSlots.delete(slot);
          return;
        }

        activeDesktopSlots.add(slot);
        desktopSourceIndexes[slot] = marker;
        desktopEventCounter += 1;

        transitionDesktopImage(image, desktopCompositeSources[slot], {
          direction:
            (slot + desktopEventCounter) % 2 === 0
              ? "from-left"
              : "from-right",
          duration: desktopTransitionDuration,
          onComplete: () => {
            if (sequenceToken !== desktopSequenceToken) return;
            activeDesktopSlots.delete(slot);
            reservedCompositeSlots.delete(slot);
            lockedCompositeSlots.add(slot);

            if (lockedCompositeSlots.size === desktopCompositeSources.length) {
              completeCompositeFormation(sequenceToken);
            }
          },
        });
      };

      tryStart();
    };

    const scheduleCompositeFormation = (
      elapsedSinceFull = 0,
      { firstPieceDelay = null } = {},
    ) => {
      if (
        !desktopMedia.matches ||
        document.hidden ||
        compositeFormationActive ||
        compositeHoldActive
      ) {
        return;
      }

      clearCompositeFormationTimers();
      compositeFormationActive = true;
      const sequenceToken = ++desktopSequenceToken;
      const isInitialFormation = Number.isFinite(firstPieceDelay);
      const targetMinimum = isInitialFormation
        ? Math.max(20000, compositeReturnMin)
        : compositeReturnMin;
      const targetFullInterval =
        targetMinimum +
        Math.round(Math.random() * (compositeReturnMax - targetMinimum));
      const finalStartDelay = Math.max(
        6500,
        targetFullInterval - elapsedSinceFull - desktopTransitionDuration,
      );
      const firstStartDelay = isInitialFormation
        ? firstPieceDelay
        : 1200 + Math.round(Math.random() * 1200);
      const formationSpan = Math.max(0, finalStartDelay - firstStartDelay);
      const timingFractions = [0, 0.31, 0.67, 1];
      const startDelays = timingFractions.map((fraction, index) => {
        if (index === 0) return firstStartDelay;
        if (index === timingFractions.length - 1) return finalStartDelay;
        const jitter = (Math.random() - 0.5) * formationSpan * 0.08;
        return Math.round(firstStartDelay + formationSpan * fraction + jitter);
      });
      const formationOrder = shuffle([0, 1, 2, 3]);

      formationOrder.forEach((slot, index) => {
        const pieceTimer = window.setTimeout(() => {
          desktopCompositeTimers.delete(pieceTimer);
          startCompositePiece(slot, sequenceToken);
        }, startDelays[index]);
        desktopCompositeTimers.add(pieceTimer);
      });
    };

    const scheduleInitialCompositeIfReady = () => {
      if (
        !desktopMedia.matches ||
        !galleryInView ||
        initialCompositeScheduled ||
        compositeFormationActive ||
        compositeHoldActive ||
        document.hidden
      ) {
        return;
      }

      initialCompositeScheduled = true;
      scheduleCompositeFormation(0, {
        firstPieceDelay: initialCompositeDelay,
      });
    };

    const scheduleDesktopRotation = (firstRun = false) => {
      if (desktopTimer) window.clearTimeout(desktopTimer);
      if (!desktopMedia.matches || document.hidden) return;

      const delay = firstRun
        ? 1200
        : 900 + Math.round(Math.random() * 1800);

      desktopTimer = window.setTimeout(() => {
        desktopTimer = null;
        const availableSlots = [0, 1, 2, 3].filter(
          (slot) =>
            !activeDesktopSlots.has(slot) &&
            !lockedCompositeSlots.has(slot) &&
            !reservedCompositeSlots.has(slot) &&
            [...activeDesktopSlots].every(
              (activeSlot) => Math.abs(activeSlot - slot) > 1,
            ) &&
            [...reservedCompositeSlots].every(
              (reservedSlot) => Math.abs(reservedSlot - slot) > 1,
            ),
        );

        const singleGroups = shuffle(
          availableSlots.map((slot) => [slot]),
        );
        const doubleGroups = shuffle(
          availableSlots.flatMap((slot, index) =>
            availableSlots
              .slice(index + 1)
              .filter((otherSlot) => Math.abs(slot - otherSlot) > 1)
              .map((otherSlot) => [slot, otherSlot]),
          ),
        );
        const preferDouble = Math.random() < 0.4;
        const slotGroups = preferDouble
          ? [...doubleGroups, ...singleGroups]
          : [...singleGroups, ...doubleGroups];

        let selectedSlots = null;
        let plannedArrangement = null;

        for (const slots of slotGroups) {
          const arrangement = planDesktopSources(slots);
          if (!arrangement) continue;
          selectedSlots = slots;
          plannedArrangement = arrangement;
          break;
        }

        if (selectedSlots && plannedArrangement) {
          desktopEventCounter += 1;
          desktopSourceIndexes = plannedArrangement;
          const simultaneous = Math.random() < 0.52;
          const stagger = simultaneous
            ? 0
            : 90 + Math.round(Math.random() * 190);

          selectedSlots.forEach((slot, index) => {
            activeDesktopSlots.add(slot);

            const startTransition = () => {
              const image = items[slot]?.querySelector("img");
              const sourceIndex = desktopSourceIndexes[slot];
              const direction =
                (slot + desktopEventCounter) % 2 === 0
                  ? "from-left"
                  : "from-right";

              if (!image) {
                activeDesktopSlots.delete(slot);
                return;
              }

              transitionDesktopImage(image, gallerySources[sourceIndex], {
                direction,
                onComplete: () => activeDesktopSlots.delete(slot),
              });
            };

            if (index === 0 || stagger === 0) {
              startTransition();
              return;
            }

            const startTimer = window.setTimeout(() => {
              desktopStartTimers.delete(startTimer);
              startTransition();
            }, stagger);
            desktopStartTimers.add(startTimer);
          });
        }

        scheduleDesktopRotation();
      }, delay);
    };

    const buildDots = () => {
      dotsTrack = document.createElement("div");
      dotsTrack.className = "gallery-dots-track";

      dotsContainer.replaceChildren();
      dots = items.map((_, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.setAttribute(
          "aria-label",
          `Mostrar la imagen ${index + 1} de ${items.length} en primer lugar`,
        );
        button.addEventListener("click", () => scrollToItem(index));
        dotsTrack.append(button);
        return button;
      });

      dotsContainer.append(dotsTrack);
    };

    const getTargetLeft = (index) => {
      const safeIndex = Math.max(0, Math.min(index, items.length - 1));
      const firstItemOffset = items[0]?.offsetLeft ?? 0;
      return Math.max(0, items[safeIndex].offsetLeft - firstItemOffset);
    };

    const scrollToItem = (index) => {
      if (desktopMedia.matches) return;
      const safeIndex = Math.max(0, Math.min(index, items.length - 1));
      activeIndex = safeIndex;
      updateControls(false);

      track.scrollTo({
        left: getTargetLeft(safeIndex),
        behavior: reducedMotion.matches ? "auto" : "smooth",
      });
    };

    const findClosestItem = () => {
      const currentLeft = track.scrollLeft;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      for (let index = 0; index < items.length; index += 1) {
        const distance = Math.abs(getTargetLeft(index) - currentLeft);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      }

      return closestIndex;
    };

    const updateControls = (deriveFromScroll = true) => {
      if (desktopMedia.matches) return;

      if (deriveFromScroll) {
        activeIndex = findClosestItem();
      }

      previousButton.disabled = activeIndex === 0;
      nextButton.disabled = activeIndex === items.length - 1;
      updateDotWheel();
    };

    const refreshLayout = () => {
      clearClones();
      const nextMode = desktopMedia.matches ? "desktop" : "carousel";

      if (nextMode === currentMode) {
        if (nextMode === "carousel") {
          track.scrollTo({ left: getTargetLeft(activeIndex), behavior: "auto" });
          updateControls(false);
        }
        return;
      }

      currentMode = nextMode;
      restoreGallerySources();

      if (nextMode === "desktop") {
        track.classList.add("is-desktop-showcase");
        track.removeAttribute("tabindex");
        controls.hidden = true;
        activeIndex = 0;
        desktopSourceIndexes = [0, 1, 2, 3];
        desktopEventCounter = 0;
        items.forEach((item, index) => {
          item.hidden = index >= 4;
        });
        desktopCompositeSources.forEach((source) => {
          const preloader = new Image();
          preloader.src = source.src;
        });
        track.scrollTo({ left: 0, behavior: "auto" });
        scheduleDesktopRotation(true);
        scheduleInitialCompositeIfReady();
        return;
      }

      stopDesktopRotation();
      initialCompositeScheduled = false;
      track.classList.remove("is-desktop-showcase");
      track.setAttribute("tabindex", "0");
      controls.hidden = false;
      items.forEach((item) => {
        item.hidden = false;
      });
      activeIndex = 0;
      track.scrollTo({ left: 0, behavior: "auto" });
      updateControls(false);
    };

    previousButton.addEventListener("click", () => scrollToItem(activeIndex - 1));
    nextButton.addEventListener("click", () => scrollToItem(activeIndex + 1));

    track.addEventListener(
      "scroll",
      () => {
        if (desktopMedia.matches) return;
        if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
        scrollFrame = window.requestAnimationFrame(updateControls);
      },
      { passive: true },
    );

    track.addEventListener("keydown", (event) => {
      if (desktopMedia.matches) return;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollToItem(activeIndex + 1);
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollToItem(activeIndex - 1);
      }

      if (event.key === "Home") {
        event.preventDefault();
        scrollToItem(0);
      }

      if (event.key === "End") {
        event.preventDefault();
        scrollToItem(items.length - 1);
      }
    });

    window.addEventListener("resize", () => {
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(refreshLayout);
    });

    document.addEventListener("visibilitychange", () => {
      if (!desktopMedia.matches) return;
      if (document.hidden) {
        stopDesktopRotation();
        restoreGallerySources();
        desktopSourceIndexes = [0, 1, 2, 3];
        initialCompositeScheduled = false;
        return;
      }

      scheduleDesktopRotation(true);
      scheduleInitialCompositeIfReady();
    });

    if ("IntersectionObserver" in window) {
      const galleryObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.target !== gallerySection) return;
            galleryInView = entry.isIntersecting;
            if (galleryInView) scheduleInitialCompositeIfReady();
          });
        },
        { threshold: 0.2 },
      );

      galleryObserver.observe(gallerySection);
    } else {
      galleryInView = true;
    }

    track.scrollLeft = 0;
    buildDots();
    refreshLayout();
    scheduleInitialCompositeIfReady();
  };

  document.querySelectorAll("[data-carousel]").forEach(initializeCarousel);

  const initializeHeroShowcase = () => {
    const showcase = document.querySelector(".hero-showcase");
    const showcaseImages = [
      ...(showcase?.querySelectorAll(".showcase-card img") ?? []),
    ];
    const galleryImages = [
      ...document.querySelectorAll(
        "[data-carousel-track] .gallery-card:not([data-carousel-clone]) img",
      ),
    ].map((image) => ({
      src: image.getAttribute("src"),
      alt: image.getAttribute("alt") || "Servicio técnico de ServicioTech",
    }));

    if (!showcase || showcaseImages.length === 0 || galleryImages.length < 4) {
      return;
    }

    galleryImages.forEach(({ src }) => {
      if (!src) return;
      const preload = new Image();
      preload.src = src;
    });

    const initialSource = showcaseImages[0].getAttribute("src");
    let startIndex = galleryImages.findIndex(({ src }) => src === initialSource);
    if (startIndex < 0) startIndex = 0;

    let rotationTimer = null;

    const getTransitionSettings = () => {
      if (reducedMotion.matches) {
        return {
          duration: 1200,
          stagger: 90,
          blur: 0,
          lowMotion: true,
        };
      }

      if (window.matchMedia("(min-width: 64rem)").matches) {
        return {
          duration: 2450,
          stagger: 240,
          blur: 7,
          lowMotion: false,
        };
      }

      return {
        duration: 1750,
        stagger: 110,
        blur: 3.5,
        lowMotion: false,
      };
    };

    const transitionImage = (image, source, staggerIndex) => {
      const applySource = () => {
        image.src = source.src;
        image.alt = source.alt;
      };

      const { duration, stagger, blur, lowMotion } = getTransitionSettings();

      window.setTimeout(() => {
        const parent = image.parentElement;
        if (!parent) return;

        const overlay = new Image();
        const transitionToken = `${Date.now()}-${Math.random()}`;
        let revealed = false;
        let committed = false;
        let outgoingAnimation = null;

        image.dataset.showcaseTransition = transitionToken;

        const commitOverlay = () => {
          if (committed) return;
          committed = true;

          if (image.dataset.showcaseTransition !== transitionToken) {
            overlay.remove();
            return;
          }

          applySource();
          delete image.dataset.showcaseTransition;
          outgoingAnimation?.cancel();

          const removeOverlay = () => {
            window.requestAnimationFrame(() => {
              window.requestAnimationFrame(() => {
                overlay.remove();
                parent.classList.remove(
                  "is-transitioning",
                  "is-transitioning--reduced",
                );
                parent.style.removeProperty("--showcase-transition-duration");
              });
            });
          };

          if (typeof image.decode === "function") {
            image.decode().catch(() => {}).finally(removeOverlay);
          } else {
            removeOverlay();
          }
        };

        const revealOverlay = () => {
          if (revealed) return;
          revealed = true;
          parent.append(overlay);
          parent.classList.add("is-transitioning");
          parent.classList.toggle("is-transitioning--reduced", lowMotion);
          parent.style.setProperty(
            "--showcase-transition-duration",
            `${duration}ms`,
          );

          if (typeof overlay.animate === "function") {
            const horizontalShift = staggerIndex === 1
              ? "-3.2%"
              : staggerIndex === 2
                ? "3.2%"
                : "0";
            const outgoingShift = staggerIndex === 1
              ? "1.2%"
              : staggerIndex === 2
                ? "-1.2%"
                : "0";
            const entryFilter = blur > 0
              ? `blur(${blur}px) saturate(0.9) contrast(0.97) brightness(1.04)`
              : "none";

            const incomingFrames = lowMotion
              ? [
                  {
                    opacity: 0,
                    filter: "none",
                    transform: "none",
                  },
                  {
                    opacity: 0.2,
                    filter: "none",
                    transform: "none",
                    offset: 0.3,
                  },
                  {
                    opacity: 0.76,
                    filter: "none",
                    transform: "none",
                    offset: 0.78,
                  },
                  {
                    opacity: 1,
                    filter: "none",
                    transform: "none",
                  },
                ]
              : [
                {
                  opacity: 0,
                  filter: entryFilter,
                  transform: `translate3d(${horizontalShift}, 2%, 0) scale(1.045)`,
                },
                {
                  opacity: 0.12,
                  filter: entryFilter,
                  transform: `translate3d(${horizontalShift}, 1.5%, 0) scale(1.035)`,
                  offset: 0.22,
                },
                {
                  opacity: 0.7,
                  filter: blur > 0
                    ? `blur(${blur * 0.25}px) saturate(0.98) contrast(0.995) brightness(1.008)`
                    : "none",
                  transform: "translate3d(0, 0.25%, 0) scale(1.008)",
                  offset: 0.74,
                },
                {
                  opacity: 1,
                  filter: "blur(0) saturate(1) contrast(1) brightness(1)",
                  transform: "translate3d(0, 0, 0) scale(1)",
                },
              ];
            const outgoingFrames = lowMotion
              ? [
                  {
                    opacity: 1,
                    filter: "none",
                    transform: "none",
                  },
                  {
                    opacity: 0.82,
                    filter: "none",
                    transform: "none",
                    offset: 0.38,
                  },
                  {
                    opacity: 0.22,
                    filter: "none",
                    transform: "none",
                    offset: 0.86,
                  },
                  {
                    opacity: 0.04,
                    filter: "none",
                    transform: "none",
                  },
                ]
              : [
                  {
                    opacity: 1,
                    filter: "blur(0) saturate(1) brightness(1)",
                    transform: "translate3d(0, 0, 0) scale(1)",
                  },
                  {
                    opacity: 0.9,
                    filter: "blur(0.4px) saturate(0.985) brightness(0.995)",
                    transform: `translate3d(${outgoingShift}, -0.2%, 0) scale(0.996)`,
                    offset: 0.36,
                  },
                  {
                    opacity: 0.28,
                    filter: "blur(3px) saturate(0.9) brightness(0.95)",
                    transform: `translate3d(${outgoingShift}, -0.7%, 0) scale(0.978)`,
                    offset: 0.84,
                  },
                  {
                    opacity: 0.05,
                    filter: "blur(4px) saturate(0.86) brightness(0.92)",
                    transform: `translate3d(${outgoingShift}, -0.9%, 0) scale(0.972)`,
                  },
                ];

            const incomingAnimation = overlay.animate(
              incomingFrames,
              {
                duration,
                easing: "cubic-bezier(0.16, 0.84, 0.24, 1)",
                fill: "forwards",
              },
            );

            outgoingAnimation = image.animate(
              outgoingFrames,
              {
                duration,
                easing: "cubic-bezier(0.32, 0, 0.18, 1)",
                fill: "forwards",
              },
            );

            Promise.allSettled([
              incomingAnimation.finished,
              outgoingAnimation.finished,
            ]).then(commitOverlay);
            return;
          }

          overlay.style.setProperty(
            "--showcase-transition-duration",
            `${duration}ms`,
          );

          window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
              overlay.classList.add("is-visible");
            });
          });

          window.setTimeout(commitOverlay, duration + 80);
        };

        overlay.className = "showcase-transition-image";
        overlay.alt = "";
        overlay.decoding = "async";
        overlay.setAttribute("aria-hidden", "true");
        overlay.addEventListener("load", revealOverlay, { once: true });
        overlay.addEventListener("error", commitOverlay, { once: true });
        overlay.src = source.src;

        if (overlay.complete && overlay.naturalWidth > 0) {
          window.requestAnimationFrame(revealOverlay);
        }
      }, staggerIndex * stagger);
    };

    const rotateImages = () => {
      startIndex = (startIndex + 1) % galleryImages.length;

      showcaseImages.forEach((image, index) => {
        const source = galleryImages[
          (startIndex + index * 2) % galleryImages.length
        ];

        if (!source?.src) return;
        transitionImage(image, source, index);
      });
    };

    const stopRotation = () => {
      if (!rotationTimer) return;
      window.clearInterval(rotationTimer);
      rotationTimer = null;
    };

    const startRotation = () => {
      stopRotation();
      if (document.hidden) return;
      rotationTimer = window.setInterval(rotateImages, 7800);
    };

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopRotation();
      else startRotation();
    });

    startRotation();
  };

  initializeHeroShowcase();

  const floatingWhatsApp = document.querySelector(".floating-whatsapp");
  const floatingObstacles = [
    ...document.querySelectorAll(".final-cta, .site-footer"),
  ];

  if (
    floatingWhatsApp &&
    floatingObstacles.length > 0 &&
    "IntersectionObserver" in window
  ) {
    const visibleObstacles = new Set();
    const floatingObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visibleObstacles.add(entry.target);
          else visibleObstacles.delete(entry.target);
        });

        floatingWhatsApp.classList.toggle(
          "is-context-hidden",
          visibleObstacles.size > 0,
        );
      },
      { threshold: 0.02 },
    );

    floatingObstacles.forEach((element) => floatingObserver.observe(element));
  }

  const currentYear = document.querySelector("[data-current-year]");
  if (currentYear) currentYear.textContent = String(new Date().getFullYear());
})();
