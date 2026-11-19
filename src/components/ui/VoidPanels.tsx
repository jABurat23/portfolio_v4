"use client";

import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import {
  type MouseEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { aboutConfig } from "@/config/about";
import { contactConfig } from "@/config/contact";
import { getVoidPanelsState } from "@/config/journey";
import {
  CONTACT_ROW_ARROW_CLASS,
  CONTACT_ROW_LABEL_CLASS,
  CONTACT_ROW_LINK_CLASS,
  CONTACT_ROW_VALUE_CLASS,
} from "@/lib/interactive";
import {
  getScrollProgress,
  scrollToTop,
  subscribeScrollProgress,
} from "@/lib/scrollProgress";
import { AsciiFrame } from "./AsciiFrame";
import { OutlinedButton } from "./OutlinedButton";

export interface ActiveVoidPanels {
  about: boolean;
  contact: boolean;
}

export interface VoidPanelsProps {
  visible: boolean;
  onActivePanelsChange?: (panels: ActiveVoidPanels) => void;
}

function applyPanelState(
  element: HTMLElement | null,
  opacity: number,
  active: boolean,
): void {
  if (!element) return;
  element.style.opacity = opacity.toFixed(3);
  element.style.visibility = opacity <= 0.001 ? "hidden" : "visible";
  element.style.pointerEvents = active ? "auto" : "none";
  element.inert = !active;
}

export default function VoidPanels({
  visible,
  onActivePanelsChange,
}: VoidPanelsProps) {
  const aboutRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const backWrapRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(visible);
  const exposedPanelsRef = useRef<ActiveVoidPanels>({
    about: false,
    contact: false,
  });
  const onActivePanelsChangeRef = useRef(onActivePanelsChange);

  useEffect(() => {
    onActivePanelsChangeRef.current = onActivePanelsChange;
  }, [onActivePanelsChange]);

  const emitExposedPanels = useCallback((about: boolean, contact: boolean) => {
    const prev = exposedPanelsRef.current;
    if (prev.about !== about || prev.contact !== contact) {
      const next = { about, contact };
      exposedPanelsRef.current = next;
      onActivePanelsChangeRef.current?.(next);
    }
  }, []);

  const syncPanels = useCallback(
    (progress: number) => {
      if (!visibleRef.current) {
        applyPanelState(aboutRef.current, 0, false);
        applyPanelState(contactRef.current, 0, false);
        applyPanelState(backWrapRef.current, 0, false);
        emitExposedPanels(false, false);
        return;
      }

      const state = getVoidPanelsState(progress);
      applyPanelState(aboutRef.current, state.aboutOpacity, state.aboutActive);
      applyPanelState(contactRef.current, state.contactOpacity, state.contactActive);
      applyPanelState(
        backWrapRef.current,
        state.backButtonOpacity,
        state.backButtonActive,
      );
      emitExposedPanels(state.aboutActive, state.contactActive);
    },
    [emitExposedPanels],
  );

  useLayoutEffect(() => {
    visibleRef.current = visible;
    syncPanels(getScrollProgress());
  }, [visible, syncPanels]);

  useEffect(() => {
    syncPanels(getScrollProgress());
    return subscribeScrollProgress(syncPanels);
  }, [syncPanels]);

  const handleBackToStart = (event: MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.blur();
    scrollToTop();
  };

  return (
    <section
      aria-label="About and Contact"
      className="pointer-events-none fixed inset-0 z-20 flex h-dvh items-center justify-center px-5 pt-10 pb-24 sm:px-10 sm:pt-12 sm:pb-28"
    >
      <div className="relative flex w-full max-w-lg items-center justify-center">
        <div ref={aboutRef} className="invisible w-full opacity-0">
          <AsciiFrame label={aboutConfig.label}>
            <p className="font-sans text-sm leading-relaxed text-ink sm:text-base">
              {aboutConfig.body}
            </p>
          </AsciiFrame>
        </div>

        <div
          ref={contactRef}
          className="invisible absolute inset-x-0 w-full opacity-0"
        >
          <AsciiFrame label={contactConfig.label}>
            <ul className="flex flex-col divide-y divide-line">
              {contactConfig.items.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    {...(item.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className={CONTACT_ROW_LINK_CLASS}
                  >
                    <span className={CONTACT_ROW_LABEL_CLASS}>{item.label}</span>
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span className={CONTACT_ROW_VALUE_CLASS}>{item.text}</span>
                      {item.external ? (
                        <ArrowUpRightIcon
                          size={14}
                          weight="regular"
                          aria-hidden="true"
                          className={CONTACT_ROW_ARROW_CLASS}
                        />
                      ) : null}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </AsciiFrame>

          <div
            ref={backWrapRef}
            className="invisible mt-4 flex justify-center opacity-0"
          >
            <OutlinedButton
              label={contactConfig.backToStartLabel}
              onClick={handleBackToStart}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
