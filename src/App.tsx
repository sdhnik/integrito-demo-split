import Header from "./components/Header";
import StorytellingStage from "./sections/StorytellingStage";
import "./App.css";

/**
 * Step 2 — Header + existing layout skeleton.
 * Spiral, sticky, TrustSection, and product UI remain deferred.
 */
function App() {
  return (
    <div className="app">
      <Header />
      <main className="app__main">
        <StorytellingStage />
        {/* TrustSection: sibling AFTER StorytellingStage — deferred */}
      </main>
    </div>
  );
}

export default App;
