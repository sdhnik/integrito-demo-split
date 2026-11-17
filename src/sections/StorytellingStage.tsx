import type React from "react";
import DetectorComposer from "../components/DetectorComposer";
import SpiralBackground from "../components/SpiralBackground";
import { RealCheckDemoLockBridge } from "../detection/RealCheckDemoLockBridge";
import { RealDetectionProvider } from "../detection/RealDetectionContext";
import {
  DemoExperienceProvider,
  useDemoExperience,
} from "../demo/DemoExperienceContext";
import BrandIntro from "./BrandIntro";
import Hero from "./Hero";
import HowItWorks, {
  HowItWorksStep2,
  HowItWorksStep3,
} from "./HowItWorks";
import "./StorytellingStage.css";

/**
 * EditorialRail: Brand Intro → How It Works Steps 1–3.
 *
 * DOM order (single Composer):
 *   1. Hero
 *   2. WorkspaceRail → DetectorComposer
 *   3. EditorialRail → BrandIntro → HowItWorks 01–03
 *
 * Sticky boundary = StorytellingStage.
 * Step 6.1 — scroll-driven demo text-preview via DemoExperienceProvider.
 */

function WorkspaceRail() {
  return (
    <div className="workspace-rail">
      <div className="workspace-rail__seat">
        <DetectorComposer />
      </div>
    </div>
  );
}

function EditorialRail() {
  const { step1Ref, step2Ref, step3Ref } = useDemoExperience();

  return (
    <div className="editorial-rail" aria-label="Editorial sections">
      <section
        className="editorial-section"
        aria-labelledby="brand-intro-heading"
      >
        <BrandIntro />
      </section>
      <section
        ref={step1Ref as React.RefObject<HTMLElement>}
        className="editorial-section"
        aria-labelledby="how-it-works-heading"
        data-demo-step="1"
      >
        <HowItWorks />
      </section>
      <section
        ref={step2Ref as React.RefObject<HTMLElement>}
        className="editorial-section"
        aria-labelledby="how-it-works-step-2"
        data-demo-step="2"
      >
        <HowItWorksStep2 />
      </section>
      <section
        ref={step3Ref as React.RefObject<HTMLElement>}
        className="editorial-section"
        aria-labelledby="how-it-works-step-3"
        data-demo-step="3"
      >
        <HowItWorksStep3 />
      </section>
    </div>
  );
}

function SplitGrid() {
  return (
    <div className="split-grid">
      {/*
        First-screen scene: Hero + Composer.
        display:contents on desktop so children join the parent grid;
        flex envelope on stacked so later EditorialRail does not shift them.
      */}
      <div className="split-grid__scene">
        <div className="editorial-section editorial-section--first">
          <Hero />
        </div>
        <WorkspaceRail />
      </div>
      <EditorialRail />
    </div>
  );
}

function ContentContainer() {
  return (
    <div className="content-container">
      <SplitGrid />
    </div>
  );
}

function StorytellingStageInner() {
  return (
    <section className="storytelling-stage" aria-label="Storytelling stage">
      {/*
        Absolute track = stage-tall sticky containing block (no layout shift).
        SpiralBackground stays a stage peer — not inside WorkspaceRail.
      */}
      <div className="spiral-sticky-track" aria-hidden="true">
        <SpiralBackground />
      </div>
      <ContentContainer />
    </section>
  );
}

function StorytellingStage() {
  return (
    <DemoExperienceProvider>
      {/*
        Real check lifecycle lives here so compact ↔ expanded does not reset it.
        Mock service when VITE_DETECTION_MODE=mock or local DEV; else disabled.
      */}
      <RealDetectionProvider>
        <RealCheckDemoLockBridge />
        <StorytellingStageInner />
      </RealDetectionProvider>
    </DemoExperienceProvider>
  );
}

export default StorytellingStage;
