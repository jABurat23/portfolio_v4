"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SceneLoader from "@/components/scene/SceneLoader";
import { aboutConfig } from "@/config/about";
import { contactConfig } from "@/config/contact";
import { getTotalJourneyVh } from "@/config/journey";
import { worksConfig } from "@/config/works";
import Hero from "./Hero";
import IntroOverlay from "./IntroOverlay";
import ProjectCard from "./ProjectCard";
import ScrollManager from "./ScrollManager";
import SiteNavbar from "./SiteNavbar";
import VoidPanels from "./VoidPanels";
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

  return (
    <>
      <IntroOverlay
        sceneReady={sceneReady}
        thresholdBiasRef={thresholdBiasRef}
        onStart={handleIntroStart}
        onComplete={handleIntroComplete}
      />
      <ScrollManager
        spacerRef={spacerRef}
        introDone={introDone}
        introDidPlay={introDidPlay}
      />
      <Hero visible={introDone} />
      <ProjectCard visible={introDone} />
      <VoidPanels visible={introDone} />
      {introDone ? <SiteNavbar /> : null}
      <section aria-label="Works" className="sr-only">
        <h2>Works</h2>
        <ul>
          {worksConfig.items.map((item) => (
            <li key={item.id}>
              <span>{item.title}</span> —{" "}
              <span>{item.description ?? item.caption}</span>
            </li>
          ))}
        </ul>
      </section>
      <section aria-label="About and Contact summary" className="sr-only">
        <h2>{aboutConfig.label}</h2>
        <p>{aboutConfig.body}</p>
        <h2>{contactConfig.label}</h2>
        <ul>
          {contactConfig.items.map((item) => (
            <li key={item.id}>
              <span>{item.label}</span>: <span>{item.text}</span>
            </li>
          ))}
        </ul>
      </section>
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
