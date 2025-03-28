import { useEffect, DependencyList } from "react";

const FPS = 60;
const MS_PER_FRAME = 1000 / FPS;

let msPrev = performance.now();
export const useGameLoop = (callback: () => void, dependencies: DependencyList) => {
  useEffect(() => {
    let frameId: number;
    const loop = () => {
      const msNow = performance.now();
      const delta = msNow - msPrev;
      if (delta > MS_PER_FRAME) {
        callback();
        msPrev = msNow - (delta % MS_PER_FRAME);
      }
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, callback]);
};