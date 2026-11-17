import HowItWorksStep from "../components/HowItWorksStep";
import "./HowItWorks.css";

/**
 * How It Works editorial steps (Reference 01 + approved copy).
 * Section title + Step 1 live together; Steps 2–3 are separate viewport sections.
 */
function HowItWorks() {
  return (
    <div className="how-it-works">
      <header className="how-it-works__header">
        <h2 id="how-it-works-heading" className="how-it-works__title">
          AI detection in three simple steps
        </h2>
      </header>

      <HowItWorksStep
        number="01"
        heading="Insert your text"
        headingId="how-it-works-step-1"
        description="Paste the content for AI detection into the check window or add your file. You can submit various formats in your account cabinet or right on the website."
      />
    </div>
  );
}

export function HowItWorksStep2() {
  return (
    <div className="how-it-works">
      <HowItWorksStep
        number="02"
        heading="Get the report"
        headingId="how-it-works-step-2"
        description="See the parts the AI checker highlighted as likely machine-generated. Sentence-level analysis provides you with evidence instead of an abstract full-document score. Now you can actually make a decision instead of blindly trusting the tool's verdict."
      />
    </div>
  );
}

export function HowItWorksStep3() {
  return (
    <div className="how-it-works">
      <HowItWorksStep
        number="03"
        heading="Make your judgment"
        headingId="how-it-works-step-3"
        description="Decide on content authenticity based on AI detection results. A thesis paper would require a different approach than a blog post and shouldn't be measured by the same bar. We provide you with data, and you decide what is original."
      />
    </div>
  );
}

export default HowItWorks;
