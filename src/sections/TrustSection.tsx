import "./TrustSection.css";

/**
 * Step 5.5.2 — Trust Section visual parity with Reference 01.
 * Sibling AFTER StorytellingStage. Full-bleed top divider preserved.
 *
 * Layout conflict (reported): Step 5.5.1 centered ~880px single column
 * vs Reference 01 left-aligned full content-width rows
 * (number | title | body). Reference wins for 5.5.2.
 */
const TRUST_POINTS = [
  {
    n: "01",
    title: "Sentence-level analysis",
    body: "Instead of an obscure general score of AI probability, you get a clear picture with lines in question highlighted for your analysis. An essay concluding paragraph flagged as potentially AI-generated is a conversation-starter. 38% AI presence in the document is just a confusing number you don't know how to apply.",
  },
  {
    n: "02",
    title: "99% accuracy",
    body: "99.23%, to be exact. This is the percentage of sentences correctly classified by our AI detector across the seven most recent LLMs (Large Language Models) we tested. Our algorithm considers perplexity & burstiness, analysing the variability and structural characteristics of writing, recognizes predictive text patterns, and distinguishes between human-written vs AI-generated content sentence by sentence.",
  },
  {
    n: "03",
    title: "Multi-model AI detection",
    body: "Even the most trusted AI detector will fail if designed only as a GPT checker. Based on Natural Language Processing (NLP) and trained to recognize patterns from the most recent and popular providers, our tool reliably detects content by ChatGPT, Gemini, Claude, and Grok. The tests across seven different models show that our AI detector catches machine-generated text with 98.31%-99.87% accuracy, making it a precise ChatGPT checker and the best AI detector for the most used models.",
  },
] as const;

function TrustSection() {
  return (
    <section className="trust-section" aria-labelledby="trust-heading">
      <div className="trust-section__container">
        <header className="trust-section__header">
          <h2 id="trust-heading" className="trust-section__title">
            Why you can trust our AI content detector
          </h2>
        </header>

        <ul className="trust-section__list">
          {TRUST_POINTS.map((point) => (
            <li key={point.n} className="trust-section__row">
              <span
                className="trust-section__num editorial-numeral"
                aria-hidden="true"
              >
                {point.n}
              </span>
              <h3 className="trust-section__row-title">{point.title}</h3>
              <p className="trust-section__row-body editorial-lede">
                {point.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default TrustSection;
