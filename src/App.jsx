import { useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import "./App.css";
import {
  N8AO,
  ChromaticAberration,
  EffectComposer,
  SMAA,
} from "@react-three/postprocessing";
import Interface from "./Interface";
import Octogonal from "./Octogonal";
import { useContext } from "react";
import { AppContext } from "./AppContext";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
function App() {
  const [state, setState] = useContext(AppContext);

  const ref = useRef();

  useEffect(() => {
    setState((prevState) => ({ ...prevState, canvas: ref.current }));
  }, []);

  return (
    <>
      <Interface />
      <Canvas
        ref={ref}
        gl={{
          antialias: false,
          logarithmicDepthBuffer: false,
          preserveDrawingBuffer: true,
        }}
        shadows
        camera={{ position: [0, 1.5, 8], fov: 35 }}
      >
        <color attach="background" args={["#C1C1C1"]} />
        <ambientLight />
        <Octogonal />

        <EffectComposer>
          <N8AO
            halfRes
            color="black"
            aoRadius={0.1}
            intensity={state.aoIntensity}
            aoSamples={6}
            denoiseSamples={4}
          />
          <SMAA />
          <ChromaticAberration
            opacity={0.2}
            offset={state.chromaticAberrationOffset}
          />
          {/* <Vignette eskil={false} offset={0.3} darkness={0.6} /> */}
        </EffectComposer>

        <OrbitControls
          target={[0, 0.5, 0]}
          enablePan={true}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2.05}
        />
        <Environment
          files={
            "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_08_1k.hdr"
          }
        />
      </Canvas>
    </>
  );
}

export default App;
