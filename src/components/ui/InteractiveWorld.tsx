"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SceneLoader from "@/components/scene/SceneLoader";
import { aboutConfig } from "@/config/about";
import { contactConfig } from "@/config/contact";
import { introConfig } from "@/config/intro";
import { getTotalJourneyVh } from "@/config/journey";
import { getNavTargetProgressForHash } from "@/config/nav";
import { worksConfig } from "@/config/works";
import Hero from "./Hero";
import IntroOverlay from "./IntroOverlay";
import ProjectCard from "./ProjectCard";
import ScrollManager from "./ScrollManager";
import SiteNavbar from "./SiteNavbar";
import VoidPanels, { type ActiveVoidPanels } from "./VoidPanels";
import { WebGLErrorBoundary } from "./WebGLErrorBoundary";

export interface InteractiveWorldProps {
  onWebGLUnavailable: () => void;
}

export default function InteractiveWorld({
  onWebGLUnavailable,
}: InteractiveWorldProps) {
  const [sceneReady, setSceneReady] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [introDidPlay, setIntroDidPlay] = useState(false);
  const [activeWorkIndex, setActiveWorkIndex] = useState<number | null>(null);
  const [activeVoidPanels, setActiveVoidPanels] = useState<ActiveVoidPanels>({
    about: false,
    contact: false,
  });
  const [initialHashTarget] = useState<number | null>(() =>
    typeof window !== "undefined"
      ? getNavTargetProgressForHash(window.location.hash)
      : null,
  );
  const [forceIntro] = useState<boolean>(() =>
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get(
          introConfig.forceQueryParam,
        ) === "1"
      : false,
  );
  const thresholdBiasRef = useRef(-1);
  const spacerRef = useRef<HTMLDivElement>(null);

  const handleSceneReady = useCallback(() => {
    setSceneReady(true);
  }, []);

  const handleIntroStart = useCallback(() => {
    setIntroDidPlay(true);
  }, []);

  const handleIntroComplete = useCallback(() => {
    setIntroDone(true);
  }, []);

  const handleWebGLFailure = useCallback(() => {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    onWebGLUnavailable();
  }, [onWebGLUnavailable]);

  useEffect(() => {
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  const totalScrollVh = getTotalJourneyVh();

  const remainingWorks = worksConfig.items.filter(
    (_, index) => index !== activeWorkIndex,
  );
  const showAboutSummary = !activeVoidPanels.about;
  const showContactSummary = !activeVoidPanels.contact;

  return (
    <>
      <IntroOverlay
        sceneReady={sceneReady}
        hasDeepLink={initialHashTarget !== null}
        thresholdBiasRef={thresholdBiasRef}
        onStart={handleIntroStart}
        onComplete={handleIntroComplete}
      />
      <ScrollManager
        spacerRef={spacerRef}
        introDone={introDone}
        introDidPlay={introDidPlay}
        initialTargetProgress={initialHashTarget}
        deferInitialScroll={forceIntro}
      />
      <Hero visible={introDone} />
      <ProjectCard
        visible={introDone}
        onActiveWorkChange={setActiveWorkIndex}
      />
      <VoidPanels
        visible={introDone}
        onActivePanelsChange={setActiveVoidPanels}
      />
      {introDone ? <SiteNavbar /> : null}
      {introDone && remainingWorks.length > 0 ? (
        <section aria-label="Works" className="sr-only">
          <h2>Works</h2>
          <ul>
            {remainingWorks.map((item) => (
              <li key={item.id}>
                <span>{item.title}</span> —{" "}
                <span>{item.description ?? item.caption}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {introDone && (showAboutSummary || showContactSummary) ? (
        <section aria-label="About and Contact summary" className="sr-only">
          {showAboutSummary ? (
            <>
              <h2>{aboutConfig.label}</h2>
              <p>{aboutConfig.body}</p>
            </>
          ) : null}
          {showContactSummary ? (
            <>
              <h2>{contactConfig.label}</h2>
              <ul>
                {contactConfig.items.map((item) => (
                  <li key={item.id}>
                    <span>{item.label}</span>: <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </section>
      ) : null}
      <div aria-hidden="true" className="fixed inset-0 h-dvh w-full">
        <WebGLErrorBoundary onError={handleWebGLFailure}>
          <SceneLoader
            onReady={handleSceneReady}
            onContextLost={handleWebGLFailure}
            thresholdBiasRef={thresholdBiasRef}
            introDone={introDone}
          />
        </WebGLErrorBoundary>
      </div>
      <div
        ref={spacerRef}
        aria-hidden="true"
        className="pointer-events-none w-full"
        style={{ height: `${totalScrollVh}svh` }}
      />
    </>
  );
}
