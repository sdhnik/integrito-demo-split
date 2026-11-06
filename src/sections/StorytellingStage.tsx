import "./StorytellingStage.css";

/**
 * Layout skeleton + Step 1.1 editorial rhythm convention.
 *
 * Future editorial sequence (not created yet):
 *   Hero → Introduction → How It Works 01 → 02 → 03
 * each as .editorial-section inside this stage.
 *
 * SpiralLayer: full-width sibling of ContentContainer (deferred).
 * TrustSection: sibling AFTER this stage (deferred).
 */
function LeftColumn() {
  return (
    <div className="left-column">
      <div className="layout-placeholder layout-placeholder--left">
        LEFT — EDITORIAL CONTENT
      </div>
    </div>
  );
}

function RightColumn() {
  return (
    <div className="right-column">
      <div className="layout-placeholder layout-placeholder--right">
        RIGHT — DETECTOR
      </div>
    </div>
  );
}

function SplitGrid() {
  return (
    <div className="split-grid">
      <LeftColumn />
      <RightColumn />
    </div>
  );
}

function ContentContainer() {
  return (
    <div className="content-container">
      {/* First section only — viewport below Header. No extra empty sections. */}
      <div className="editorial-section editorial-section--first">
        <SplitGrid />
      </div>
    </div>
  );
}

function StorytellingStage() {
  return (
    <section className="storytelling-stage" aria-label="Storytelling stage">
      {/* SpiralLayer slot: full-width peer of ContentContainer — not rendered yet */}
      <ContentContainer />
    </section>
  );
}

export default StorytellingStage;
