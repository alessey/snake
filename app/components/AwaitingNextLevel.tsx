import { Stats } from "./Stats";

type AwaitingNextLevelProps = {
  score: number;
  level: number;
};

export function AwaitingNextLevel({ score, level }: AwaitingNextLevelProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 z-20 m-[10px] mb-[30px]">
      <h1 className="text-5xl mb-4">LEVEL COMPLETE!</h1>
      <Stats score={score} level={level} />
      <p className="absolute bottom-4 text-lg">
        Press play or space for the next level
      </p>
    </div>
  );
}