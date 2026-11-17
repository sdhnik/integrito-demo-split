import "./Hero.css";

/**
 * Step 3.1.1 — Hero copy restored from Reference 01.
 * No eyebrow in the reference; spiral “AI TEXT DETECTOR” is not Hero copy.
 */
function Hero() {
  return (
    <div className="hero-copy">
      <h1 className="hero-copy__title">
        AI Detector for
        <br />
        honest writing
      </h1>
      <p className="hero-copy__lede editorial-lede">
        Check every sentence, see the problematic parts, and make an informed
        decision. Try AI detection that provides data instead of making
        accusations. Run a free check to see how it works!
      </p>
    </div>
  );
}

export default Hero;
