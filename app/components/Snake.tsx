"use client";

import React, {
  useEffect,
  useRef,
  useMemo,
  useState,
  useCallback,
} from "react";
import { GameState, MoveState } from "../utils";
import { useKonami } from "../hooks/useKonami";
import { HighScoresProvider } from "../HighScoresProvider";
import { useGameLoop } from "../hooks/useGameLoop";
import { Intro } from "./Intro";
import { Dead } from "./Dead";
import { AwaitingNextLevel } from "./AwaitingNextLevel";
import { ControlButtons } from "./ControlButtons";
import { DPad } from "./DPad";

const COLORS = {
  blue: "#0052FF",
  white: "#FFFFFF",
  black: "#000000",
  random: () =>
    `#${Math.floor(Math.random() * 12582912)
      .toString(16)
      .padStart(6, "0")}`,
};
const NUM_TARGETS_PER_LEVEL = 10;

const LevelMaps: {
  [key: number]: { x1: number; y1: number; width: number; height: number }[];
} = {
  1: [
    { x1: 0, y1: 0, width: 10, height: 500 },
    { x1: 0, y1: 0, width: 500, height: 10 },
    { x1: 490, y1: 0, width: 10, height: 500 },
    { x1: 0, y1: 490, width: 500, height: 10 },
  ],
  2: [
    { x1: 0, y1: 0, width: 10, height: 500 },
    { x1: 0, y1: 0, width: 500, height: 10 },
    { x1: 490, y1: 0, width: 10, height: 500 },
    { x1: 0, y1: 490, width: 500, height: 10 },
    { x1: 250, y1: 0, width: 10, height: 200 },
    { x1: 250, y1: 300, width: 10, height: 200 },
  ],
  3: [
    { x1: 0, y1: 0, width: 10, height: 500 },
    { x1: 0, y1: 0, width: 500, height: 10 },
    { x1: 490, y1: 0, width: 10, height: 500 },
    { x1: 0, y1: 490, width: 500, height: 10 },
    { x1: 250, y1: 0, width: 10, height: 200 },
    { x1: 250, y1: 300, width: 10, height: 200 },
    { x1: 0, y1: 250, width: 200, height: 10 },
    { x1: 300, y1: 250, width: 200, height: 10 },
  ],
  4: [
    { x1: 0, y1: 0, width: 10, height: 500 },
    { x1: 0, y1: 0, width: 500, height: 10 },
    { x1: 490, y1: 0, width: 10, height: 500 },
    { x1: 0, y1: 490, width: 500, height: 10 },
    { x1: 100, y1: 0, width: 10, height: 200 },
    { x1: 200, y1: 0, width: 10, height: 200 },
    { x1: 300, y1: 0, width: 10, height: 200 },
    { x1: 400, y1: 0, width: 10, height: 200 },
    { x1: 100, y1: 300, width: 10, height: 200 },
    { x1: 200, y1: 300, width: 10, height: 200 },
    { x1: 300, y1: 300, width: 10, height: 200 },
    { x1: 400, y1: 300, width: 10, height: 200 },
  ],
};

const NumberOfMaps = Object.keys(LevelMaps).length;

const DIRECTION_MAP: Record<string, number> = {
  ArrowUp: MoveState.UP,
  ArrowRight: MoveState.RIGHT,
  ArrowDown: MoveState.DOWN,
  ArrowLeft: MoveState.LEFT,
};

type Segment = { x: number; y: number };

const Sammy = () => {
  const gameCanvasRef = useRef<HTMLCanvasElement>(null);
  const mapCanvasRef = useRef<HTMLCanvasElement>(null);
  const sammyCanvasRef = useRef<HTMLCanvasElement>(null);
  const scoreCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const levelRef = useRef(1); // track level with a ref to ensure it is updated correctly in dev mode

  const [gameState, setGameState] = useState(GameState.INTRO);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState({ points: 2000, total: 0 });
  const [sammy, setSammy] = useState<{
    x: number;
    y: number;
    length: number;
    direction: number;
    newDirection: number;
    segments: Segment[];
  }>({
    x: 50,
    y: 100,
    length: 10,
    direction: MoveState.DOWN,
    newDirection: MoveState.NONE,
    segments: [],
  });
  const [target, setTarget] = useState({
    exists: false,
    num: 0,
    x: 0,
    y: 0,
    color: COLORS.black,
  });
  const [scale, setScale] = useState<number | null>(null);
  const { konami, updateSequence } = useKonami(gameState);

  const getStartingScore = useCallback(
    (level: number, adjust = false) => {
      const startingScore = 2000 + (level - 1) * 500;
      if (adjust) {
        return konami ? startingScore + 1 : startingScore + 2;
      }
      return startingScore;
    },
    [konami],
  );

  const updateGameState = useCallback(() => {
    setGameState((prev) => {
      switch (prev) {
        case GameState.RUNNING:
          return GameState.PAUSED;
        case GameState.PAUSED:
        case GameState.INTRO:
          return GameState.RUNNING;
        case GameState.WON:
        case GameState.DEAD:
          setSammy({
            x: 50,
            y: 100,
            length: 10,
            direction: MoveState.DOWN,
            newDirection: MoveState.NONE,
            segments: [],
          });
          setScore({ points: getStartingScore(1), total: 0 });
          setTarget({ exists: false, num: 0, x: 0, y: 0, color: "" });
          setLevel(1);
          return GameState.RUNNING;
        case GameState.AWAITINGNEXTLEVEL:
          setSammy({
            x: 50,
            y: 100,
            length: 10,
            direction: MoveState.DOWN,
            newDirection: MoveState.NONE,
            segments: [],
          });
          setScore((prevScore) => ({
            ...prevScore,
            points: getStartingScore(levelRef.current + 1),
          }));
          setTarget({ exists: false, num: 0, x: 0, y: 0, color: "" });
          setLevel(levelRef.current + 1);
          return GameState.RUNNING;
        default:
          return prev;
      }
    });
  }, [getStartingScore, setGameState]);

  useEffect(() => {
    const handleResize = () => {
      setScale(
        Math.min(
          window.document.body.clientWidth / 520,
          window.document.body.clientHeight / 520,
          1,
        ),
      );
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const newDirection = DIRECTION_MAP[e.code];
      if (newDirection || e.code === "Space") {
        e.preventDefault();
        if (e.code === "Space") {
          updateGameState();
        } else {
          setSammy((prev) => ({
            ...prev,
            newDirection: newDirection || prev.newDirection,
          }));
          updateSequence(newDirection);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [konami, updateGameState, updateSequence]);

  const drawMap = useCallback(() => {
    const ctx = mapCanvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, 500, 520);
      ctx.fillStyle = COLORS.white;
      ctx.fillRect(0, 0, 500, 520);
      LevelMaps[level].forEach((wall) => {
        ctx.fillStyle = COLORS.blue;
        ctx.fillRect(wall.x1, wall.y1, wall.width, wall.height);
      });
    }
  }, [level]);

  useEffect(() => {
    if (mapCanvasRef.current) {
      drawMap();
    }
  }, [drawMap, level, scale]);

  const createTarget = useCallback(() => {
    if (!target.exists) {
      let isValidPosition = false;
      const newTarget = {
        x: 0,
        y: 0,
        exists: true,
        num: target.num + 1,
        color: COLORS.black,
      };

      while (!isValidPosition) {
        newTarget.x = Math.floor(Math.random() * 48) * 10 + 10;
        newTarget.y = Math.floor(Math.random() * 48) * 10 + 10;
        newTarget.color = COLORS.random();

        // check if target overlaps with any wall
        isValidPosition = !LevelMaps[level].some((wall) => {
          const targetLeft = newTarget.x;
          const targetRight = newTarget.x + 10;
          const targetTop = newTarget.y;
          const targetBottom = newTarget.y + 10;

          const wallLeft = wall.x1;
          const wallRight = wall.x1 + wall.width;
          const wallTop = wall.y1;
          const wallBottom = wall.y1 + wall.height;

          return !(
            targetLeft > wallRight ||
            targetRight < wallLeft ||
            targetTop > wallBottom ||
            targetBottom < wallTop
          );
        });
      }

      const ctx = sammyCanvasRef.current?.getContext("2d");
      if (ctx) {
        ctx.fillStyle = newTarget.color;
        ctx.fillRect(newTarget.x, newTarget.y, 10, 10);
      }

      setTarget(newTarget);
    }
  }, [level, setTarget, target]);

  const moveSammy = useCallback(() => {
    const newSammy = { ...sammy };

    if (newSammy.newDirection !== MoveState.NONE) {
      const isHorizontal =
        newSammy.newDirection === MoveState.LEFT ||
        newSammy.newDirection === MoveState.RIGHT;
      const isVertical =
        newSammy.newDirection === MoveState.UP ||
        newSammy.newDirection === MoveState.DOWN;

      // only change direction on a grid
      if (
        (isHorizontal && newSammy.y % 10 === 0) ||
        (isVertical && newSammy.x % 10 === 0)
      ) {
        newSammy.direction = newSammy.newDirection;
        newSammy.newDirection = MoveState.NONE;
      }
    }

    switch (newSammy.direction) {
      case MoveState.UP:
        newSammy.y--;
        break;
      case MoveState.RIGHT:
        newSammy.x++;
        break;
      case MoveState.DOWN:
        newSammy.y++;
        break;
      case MoveState.LEFT:
        newSammy.x--;
        break;
    }

    const newSegment = { x: newSammy.x, y: newSammy.y };
    newSammy.segments = [newSegment].concat(newSammy.segments);

    if (newSammy.segments.length > newSammy.length) {
      newSammy.segments.pop();
    }

    setSammy(newSammy);
  }, [sammy, setSammy]);

  const checkCollisions = useCallback(() => {
    // wall collisions
    const hitWall = LevelMaps[level].some((wall) => {
      const sammyLeft = sammy.x;
      const sammyRight = sammy.x + 10;
      const sammyTop = sammy.y;
      const sammyBottom = sammy.y + 10;

      // adjust padding to allow wall sliding
      const wallLeft = wall.x1 + 1;
      const wallRight = wall.x1 + wall.width - 2;
      const wallTop = wall.y1 + 1;
      const wallBottom = wall.y1 + wall.height - 2;

      return !(
        sammyLeft > wallRight ||
        sammyRight < wallLeft ||
        sammyTop > wallBottom ||
        sammyBottom < wallTop
      );
    });

    // self collision
    const hitSelf = sammy.segments
      .slice(1)
      .some((segment) => segment.x === sammy.x && segment.y === sammy.y);

    if (hitWall || hitSelf) {
      setGameState(GameState.DEAD);
    }

    // target collision
    if (target.exists && sammy.x === target.x && sammy.y === target.y) {
      if (target.num < NUM_TARGETS_PER_LEVEL) {
        setSammy((prev) => ({
          ...prev,
          length: prev.length + (10 * target.num * target.num) / 2,
        }));
        setScore((prev) => ({
          points: getStartingScore(levelRef.current),
          total: prev.total + prev.points,
        }));
        setTarget((prev) => ({ ...prev, exists: false }));
      } else {
        if (level === NumberOfMaps) {
          setGameState(GameState.WON);
        } else {
          setScore((prev) => ({
            points: getStartingScore(levelRef.current + 1, true),
            total: prev.total + prev.points,
          }));
          setGameState(GameState.AWAITINGNEXTLEVEL);
        }
      }
    }
  }, [
    level,
    sammy,
    setSammy,
    setGameState,
    setScore,
    getStartingScore,
    target,
  ]);

  const updateScore = useCallback(() => {
    const scoreCtx = scoreCanvasRef.current?.getContext("2d");
    if (scoreCtx) {
      scoreCtx.clearRect(0, 0, 500, 530);
      scoreCtx.font = "20px Pixelify Sans";
      scoreCtx.fillStyle = COLORS.black;
      scoreCtx.fillText(`Score: ${score.total}`, 10, 520);
      scoreCtx.fillText(`Points: ${score.points}`, 200, 520);
      scoreCtx.fillText(`Level: ${level}`, 400, 520);
    }
  }, [level, score]);

  const drawGame = useCallback(() => {
    if (gameState !== GameState.RUNNING) {
      return;
    }

    const ctx = sammyCanvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, 500, 520);

      // draw sammy
      ctx.fillStyle = COLORS.blue;
      sammy.segments.forEach((segment) => {
        ctx.fillRect(segment.x, segment.y, 10, 10);
      });

      // draw target if exists
      if (target.exists) {
        ctx.fillStyle = target.color;
        ctx.fillRect(target.x, target.y, 10, 10);
      }
    }

    // update score
    updateScore();
  }, [gameState, sammy, target, updateScore]);

  useGameLoop(() => {
    if (gameState === GameState.RUNNING) {
      moveSammy();
      checkCollisions();
      createTarget();
      drawGame();
      setScore((prev) => ({
        ...prev,
        points: Math.max(0, prev.points - (konami ? 1 : 2)),
      }));
    } else if (gameState === GameState.AWAITINGNEXTLEVEL) {
      updateScore();
    }
  }, [gameState, sammy, target, score]);

  const overlays = useMemo(() => {
    switch (gameState) {
      case GameState.INTRO:
      case GameState.PAUSED:
        return <Intro konami={konami} />;
      case GameState.WON:
      case GameState.DEAD:
        return (
          <Dead
            score={score.total}
            level={level}
            onGoToIntro={() => {
              updateGameState();
              setGameState(GameState.PAUSED);
            }}
            isWin={gameState === GameState.WON}
          />
        );
      case GameState.AWAITINGNEXTLEVEL:
        return <AwaitingNextLevel score={score.total} level={level} />;
      default:
        return null;
    }
  }, [gameState, konami, level, score.total, setGameState, updateGameState]);

  if (!scale) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="mt-1 mx-2">
      <div
        ref={containerRef}
        className="relative origin-top-left w-[500px] h-[520px]"
        style={{
          transform: `scale(${scale})`,
          marginBottom: `${-520 * (1 - scale)}px`,
        }}
      >
        <canvas
          ref={gameCanvasRef}
          id="gamestate"
          width={500}
          height={500}
          className="absolute top-0 left-0 z-4"
        />
        <canvas
          ref={mapCanvasRef}
          id="map"
          width={500}
          height={500}
          className="absolute top-0 left-0 z-3"
        />
        <canvas
          ref={sammyCanvasRef}
          id="sammy"
          width={500}
          height={500}
          className="absolute top-0 left-0 z-2"
        />
        <canvas
          ref={scoreCanvasRef}
          id="score"
          width={500}
          height={530}
          className="absolute top-0 left-0 z-1"
        />
        <HighScoresProvider>{overlays}</HighScoresProvider>
      </div>

      <div className="flex mt-6">
        <div className="flex flex-1 justify-center">
          <DPad
            onDirectionChange={(direction: number) => {
              setSammy((prev) => ({ ...prev, newDirection: direction }));
              updateSequence(direction);
            }}
          />
        </div>
        <div className="flex flex-1 relative">
          <ControlButtons
            gameState={gameState}
            handleMobileGameState={updateGameState}
          />
        </div>
      </div>
    </div>
  );
};

export default Sammy;
