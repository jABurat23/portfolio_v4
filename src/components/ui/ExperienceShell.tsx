"use client";

import { useCallback, useRef, useState } from "react";
import SceneLoader from "@/components/scene/SceneLoader";
import { aboutConfig } from "@/config/about";
import { contactConfig } from "@/config/contact";
import { getTotalJourneyVh } from "@/config/journey";
import { worksConfig } from "@/config/works";
import Hero from "./Hero";
import Hud from "./Hud";
import IntroOverlay from "./IntroOverlay";
import ScrollManager from "./ScrollManager";
import VoidPanels from "./VoidPanels";

export default function ExperienceShell() {
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
      <VoidPanels visible={introDone} />
      <Hud visible={introDone} />
      <section aria-label="Works" className="sr-only">
        <h2>Works</h2>
        <ul>
          {worksConfig.items.map((item) => (
            <li key={item.id}>
              <span>{item.title}</span> — <span>{item.caption}</span>
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
        <SceneLoader
          onReady={handleSceneReady}
          thresholdBiasRef={thresholdBiasRef}
        />
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
