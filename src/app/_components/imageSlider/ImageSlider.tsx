"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { BsChevronCompactLeft, BsChevronCompactRight } from "react-icons/bs";
import { RxDotFilled } from "react-icons/rx";

type Slider = {
  id: number;
  img: string;
  link: string;
  alt: string;
};

type ImageSliderProps = {
  slides: Slider[];
  interval?: number;
};

const DRAG_START_THRESHOLD = 8;
const SWIPE_VELOCITY_THRESHOLD = 0.45;

const ImageSlider = ({ slides, interval = 5000 }: ImageSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(slides.length > 1 ? 1 : 0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);

  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});
  const sliderRef = useRef<HTMLDivElement>(null);

  const pointerIdRef = useRef<number | null>(null);
  const pointerStartXRef = useRef(0);
  const pointerStartYRef = useRef(0);
  const pointerStartTimeRef = useRef(0);

  const lastPointerXRef = useRef(0);
  const lastPointerTimeRef = useRef(0);

  const dragAxisRef = useRef<"horizontal" | "vertical" | null>(null);
  const draggedRef = useRef(false);
  const snapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const virtualSlides =
    slides.length > 1 ? [slides[slides.length - 1], ...slides, slides[0]] : slides;

  const logicalIndex = slides.length > 1 ? (currentIndex - 1 + slides.length) % slides.length : 0;

  /*
   * Respect prefers-reduced-motion.
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateReducedMotion = () => {
      setIsReducedMotion(mediaQuery.matches);
    };

    updateReducedMotion();

    mediaQuery.addEventListener("change", updateReducedMotion);

    return () => {
      mediaQuery.removeEventListener("change", updateReducedMotion);
    };
  }, []);

  /*
   * Fallback snap: if the user lands on a cloned slide (e.g. transitionEnd
   * was interrupted by a rapid click), schedule a snap after the transition
   * duration so we never stay on a clone indefinitely.
   */
  useEffect(() => {
    if (slides.length <= 1 || isSnapping || isDragging || isReducedMotion) return;

    const atFirstClone = currentIndex === slides.length + 1;
    const atLastClone = currentIndex === 0;

    if (!atFirstClone && !atLastClone) return;

    snapTimeoutRef.current = setTimeout(() => {
      setIsSnapping(true);
      setCurrentIndex(atFirstClone ? 1 : slides.length);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsSnapping(false);
        });
      });
    }, 750);

    return () => {
      if (snapTimeoutRef.current) {
        clearTimeout(snapTimeoutRef.current);
        snapTimeoutRef.current = null;
      }
    };
  }, [currentIndex, slides.length, isSnapping, isDragging, isReducedMotion]);

  const handleImageLoad = useCallback((slideId: number) => {
    setImageLoaded((prev) => {
      if (prev[slideId]) return prev;

      return {
        ...prev,
        [slideId]: true,
      };
    });
  }, []);

  const nextSlide = useCallback(() => {
    if (slides.length <= 1) return;

    setCurrentIndex((prevIndex) => {
      // With reduced motion there is no transitionEnd event,
      // so wrap immediately.
      if (isReducedMotion && prevIndex === slides.length) {
        return 1;
      }

      // Clamp to the last virtual slide (the cloned first slide).
      return Math.min(prevIndex + 1, slides.length + 1);
    });
  }, [slides.length, isReducedMotion]);

  const prevSlide = useCallback(() => {
    if (slides.length <= 1) return;

    setCurrentIndex((prevIndex) => {
      // With reduced motion there is no transitionEnd event,
      // so wrap immediately.
      if (isReducedMotion && prevIndex === 1) {
        return slides.length;
      }

      // Clamp to the first virtual slide (the cloned last slide).
      return Math.max(prevIndex - 1, 0);
    });
  }, [slides.length, isReducedMotion]);

  const goToSlide = useCallback(
    (index: number) => {
      if (slides.length === 0) return;

      const safeIndex = Math.max(0, Math.min(index, slides.length - 1));

      // Real slides live at indexes 1..slides.length
      setCurrentIndex(slides.length > 1 ? safeIndex + 1 : 0);
    },
    [slides.length]
  );

  /*
   * Autoplay
   *
   * Pauses while:
   * - mouse is over the slider
   * - keyboard focus is inside the slider
   * - user is dragging
   * - reduced-motion is enabled
   */
  useEffect(() => {
    if (slides.length <= 1 || isHovered || isFocused || isDragging || isReducedMotion) {
      return;
    }

    const autoplay = window.setInterval(() => {
      nextSlide();
    }, interval);

    return () => {
      window.clearInterval(autoplay);
    };
  }, [
    currentIndex,
    interval,
    isHovered,
    isFocused,
    isDragging,
    isReducedMotion,
    nextSlide,
    slides.length,
  ]);

  /*
   * Pointer down
   */
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    // Only react to the primary mouse button.
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    if (slides.length <= 1) {
      return;
    }

    pointerIdRef.current = event.pointerId;

    pointerStartXRef.current = event.clientX;
    pointerStartYRef.current = event.clientY;
    pointerStartTimeRef.current = performance.now();

    lastPointerXRef.current = event.clientX;
    lastPointerTimeRef.current = performance.now();

    dragAxisRef.current = null;
    draggedRef.current = false;

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  /*
   * Pointer move
   */
  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId || slides.length <= 1) {
      return;
    }

    const deltaX = event.clientX - pointerStartXRef.current;
    const deltaY = event.clientY - pointerStartYRef.current;

    /*
     * Decide whether this gesture is horizontal or vertical.
     *
     * This is important on mobile:
     * a vertical gesture should scroll the page normally.
     */
    if (!dragAxisRef.current) {
      if (Math.abs(deltaX) < DRAG_START_THRESHOLD && Math.abs(deltaY) < DRAG_START_THRESHOLD) {
        return;
      }

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        dragAxisRef.current = "horizontal";
        setIsDragging(true);
      } else {
        dragAxisRef.current = "vertical";
        return;
      }
    }

    if (dragAxisRef.current !== "horizontal") {
      return;
    }

    draggedRef.current = true;

    /*
     * RTL: dragging left (negative deltaX) advances to next slide,
     * so we negate the offset.
     */
    const containerWidth = sliderRef.current?.clientWidth || window.innerWidth;

    const offsetPercent = -(deltaX / containerWidth) * 100;

    setDragOffset(offsetPercent);

    const now = performance.now();
    lastPointerXRef.current = event.clientX;
    lastPointerTimeRef.current = now;

    event.preventDefault();
  };

  /*
   * Finish drag
   */
  const finishDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (pointerIdRef.current !== event.pointerId) {
        return;
      }

      const deltaX = event.clientX - pointerStartXRef.current;

      const elapsed = Math.max(performance.now() - pointerStartTimeRef.current, 1);

      const velocity = Math.abs(deltaX) / elapsed;

      const containerWidth = sliderRef.current?.clientWidth || window.innerWidth;

      /*
       * Either:
       * - user dragged ~18% of the slider
       * - or made a quick flick
       */
      const distanceThreshold = Math.min(containerWidth * 0.18, 100);

      const shouldChangeSlide =
        Math.abs(deltaX) >= distanceThreshold || velocity >= SWIPE_VELOCITY_THRESHOLD;

      if (dragAxisRef.current === "horizontal" && draggedRef.current && shouldChangeSlide) {
        // RTL: drag left (deltaX < 0) = forward, drag right = backward
        if (deltaX < 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }

      setIsDragging(false);
      setDragOffset(0);

      pointerIdRef.current = null;
      dragAxisRef.current = null;
      draggedRef.current = false;
    },
    [nextSlide, prevSlide]
  );

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    finishDrag(event);

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already have been released.
    }
  };

  const handlePointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) {
      return;
    }

    setIsDragging(false);
    setDragOffset(0);

    pointerIdRef.current = null;
    dragAxisRef.current = null;
    draggedRef.current = false;
  };

  /*
   * Prevent <Link> navigation when the user actually dragged.
   *
   * A simple click should still work normally.
   */
  const handleSlideClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (draggedRef.current) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  /*
   * Keyboard support
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (slides.length <= 1) return;

    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        nextSlide();
        break;

      case "ArrowRight":
        event.preventDefault();
        prevSlide();
        break;

      case "Home":
        event.preventDefault();
        goToSlide(0);
        break;

      case "End":
        event.preventDefault();
        goToSlide(slides.length - 1);
        break;
    }
  };

  if (slides.length === 0) {
    return null;
  }

  // RTL: positive translateX advances through slides (right-to-left flex layout)
  const transform = `translateX(${currentIndex * 100 + dragOffset}%)`;

  const handleTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== "transform" || slides.length <= 1) {
      return;
    }

    // We animated to the cloned first slide – snap to the real first slide.
    if (currentIndex === slides.length + 1) {
      setIsSnapping(true);
      setCurrentIndex(1);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsSnapping(false);
        });
      });
    }

    // We animated to the cloned last slide – snap to the real last slide.
    if (currentIndex === 0) {
      setIsSnapping(true);
      setCurrentIndex(slides.length);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsSnapping(false);
        });
      });
    }
  };

  return (
    <div className="w-full px-6 py-8 min-[576px]:px-12 min-[992px]:px-20 min-[1200px]:px-24 md:px-16 2xl:px-40">
      <div
        ref={sliderRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="اسلایدر تصاویر"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={(event) => {
          /*
           * Only remove the focus state if focus actually
           * leaves the entire slider.
           */
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setIsFocused(false);
          }
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className={`group relative mx-auto max-w-[1580px] overflow-hidden rounded-[20px] outline-none ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        } focus-visible:ring-2 focus-visible:ring-white/80`}
        style={{
          touchAction: "pan-y",
        }}
      >
        <div className="relative w-full" style={{ aspectRatio: "1920 / 900" }}>
          <div
            onTransitionEnd={handleTransitionEnd}
            className="flex size-full flex-row"
            style={{
              transform,
              transition:
                isDragging || isReducedMotion || isSnapping
                  ? "none"
                  : "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {virtualSlides.map((slide, index) => {
              const isActive = index === currentIndex;

              return (
                <Link
                  href={slide.link}
                  prefetch={false}
                  key={`${slide.id}-${index}`}
                  className="relative block shrink-0 select-none"
                  style={{ flex: "0 0 100%", height: "100%" }}
                  tabIndex={isActive ? 0 : -1}
                  aria-hidden={!isActive}
                  draggable={false}
                  onClick={handleSlideClick}
                  onDragStart={(event) => event.preventDefault()}
                >
                  {!imageLoaded[slide.id] && !isActive && (
                    <div className="absolute inset-0 bg-gray-100" />
                  )}

                  <Image
                    className={`absolute inset-0 size-full object-cover ${
                      isReducedMotion ? "" : "transition-opacity duration-500"
                    } ${isActive || imageLoaded[slide.id] ? "opacity-100" : "opacity-0"}`}
                    src={slide.img}
                    alt={slide.alt}
                    width={1920}
                    height={900}
                    quality={75}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                    onLoad={() => handleImageLoad(slide.id)}
                    priority={isActive}
                    fetchPriority={isActive ? "high" : "auto"}
                    decoding="async"
                    placeholder="blur"
                    draggable={false}
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                  />
                </Link>
              );
            })}
          </div>

          {/* Next (RTL: left arrow = forward) */}
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              nextSlide();
            }}
            className="absolute top-1/2 left-4 hidden -translate-y-1/2 cursor-pointer rounded-full bg-black/30 p-2 text-2xl text-white transition-colors group-hover:block hover:bg-black/50 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none md:block"
            aria-label="اسلاید بعدی"
          >
            <BsChevronCompactLeft size={30} aria-hidden="true" />
          </button>

          {/* Previous (RTL: right arrow = backward) */}
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              prevSlide();
            }}
            className="absolute top-1/2 right-4 hidden -translate-y-1/2 cursor-pointer rounded-full bg-black/30 p-2 text-2xl text-white transition-colors group-hover:block hover:bg-black/50 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none md:block"
            aria-label="اسلاید قبلی"
          >
            <BsChevronCompactRight size={30} aria-hidden="true" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-0 left-1/2 hidden -translate-x-1/2 gap-1 rounded-t-2xl bg-[#f0f0f0] px-2 py-1 sm:flex sm:gap-2">
            {slides.map((_, slideIndex) => {
              const isActive = slideIndex === logicalIndex;

              return (
                <button
                  type="button"
                  className="cursor-pointer rounded-full text-xl transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none md:text-2xl"
                  key={slideIndex}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    goToSlide(slideIndex);
                  }}
                  aria-label={`رفتن به اسلاید ${slideIndex + 1}`}
                  aria-current={isActive ? "true" : undefined}
                >
                  <RxDotFilled
                    aria-hidden="true"
                    className={`transition-colors ${
                      isActive ? "text-[#000000]" : "text-[#0e8bff]"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Screen-reader status */}
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            اسلاید {logicalIndex + 1} از {slides.length}{" "}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageSlider;
