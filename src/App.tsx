import Header from "./components/Header";
import StorytellingStage from "./sections/StorytellingStage";
import TrustSection from "./sections/TrustSection";
import "./App.css";

/**
 * Step 5.5 — Header + StorytellingStage + TrustSection (outside stage).
 * Sticky Workspace/Spiral release at StorytellingStage bottom.
 */
function App() {
  return (
    <div className="app">
      <Header />
      <main className="app__main">
        <StorytellingStage />
        <TrustSection />
      </main>
    </div>
  );
}

export default App;
