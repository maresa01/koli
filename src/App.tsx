import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Welcome } from "./pages/Welcome";
import { Games } from "./pages/Games";
import { Tasks } from "./pages/Tasks";
import { GameVisualMemory } from "./pages/GameVisualMemory";
import { GameSequence } from "./pages/GameSequence";
import { GameNumberMemory } from "./pages/GameNumberMemory";
import { GameReaction } from "./pages/GameReaction";
import { GameSchulte } from "./pages/GameSchulte";
import { GameNeuro } from "./pages/GameNeuro";
import { GameStroop } from "./pages/GameStroop";
import { About } from "./pages/About";
import { Register } from "./pages/Register";
import { Login } from "./pages/Login";
import { Focus15 } from "./pages/Focus15";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Welcome />} />
          <Route path="/about" element={<About />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/games" element={<Games />} />
          <Route path="/games/visual" element={<GameVisualMemory />} />
          <Route path="/games/sequence" element={<GameSequence />} />
          <Route path="/games/number" element={<GameNumberMemory />} />
          <Route path="/games/reaction" element={<GameReaction />} />
          <Route path="/games/schulte" element={<GameSchulte />} />
          <Route path="/games/neuro" element={<GameNeuro />} />
          <Route path="/games/stroop" element={<GameStroop />} />
          <Route path="/focus" element={<Focus15 />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
