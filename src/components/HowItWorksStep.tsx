import "./HowItWorksStep.css";

type HowItWorksStepProps = {
  /** Optional step index, e.g. "01" */
  number?: string;
  heading: string;
  description: string;
  /** Optional id for the heading (section aria-labelledby). */
  headingId?: string;
};

/**
 * Reusable How It Works editorial step (Reference 01).
 * Number is decorative when provided; heading carries the accessible name.
 */
function HowItWorksStep({
  number,
  heading,
  description,
  headingId,
}: HowItWorksStepProps) {
  return (
    <div className="how-it-works-step">
      {number != null && number !== "" ? (
        <span
          className="how-it-works-step__number editorial-numeral"
          aria-hidden="true"
        >
          {number}
        </span>
      ) : null}
      <div className="how-it-works-step__copy">
        <h3 id={headingId} className="how-it-works-step__heading">
          {heading}
        </h3>
        <p className="how-it-works-step__description editorial-lede">
          {description}
        </p>
      </div>
    </div>
  );
}

export default HowItWorksStep;
