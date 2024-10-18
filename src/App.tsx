import { ButtonClicker } from "./ButtonClicker";
import { SilenceDetector } from "./SilenceDetector";

const App = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div style={{ padding: "2rem" }}>
        <p style={{ fontSize: "large" }}>
          Sends stream on click on "Stop Recording"
        </p>
        <ButtonClicker />
      </div>
      <div style={{ padding: "2rem" }}>
        <p style={{ fontSize: "large" }}>
          Sends stream on 3 seconds of silence
        </p>
        <SilenceDetector />
      </div>
    </div>
  );
};

export default App;
