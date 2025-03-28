import { useHighScores } from "../HighScoresProvider";

type StatsProps = {
  score: number;
  level: number;
  width?: number;
};

export function Stats({ score, level, width = 390 }: StatsProps) {
  const { highScores } = useHighScores();
  const record = highScores?.[0]?.score ?? 0;
  return (
    <div className="grid grid-cols-2" style={{ width }}>
      {record > 0 && (
        <>
          <div className="text-lg mb-4 w-[200px]">RECORD</div>
          <div className="text-lg mb-4 text-right">{record}</div>
        </>
      )}
      <div className="text-lg mb-4 w-[200px]">LEVEL</div>
      <div className="text-lg mb-4 text-right">{level}</div>
      <div className="text-lg mb-4 w-[200px]">SCORE</div>
      <div className="text-lg mb-4 text-right">{score}</div>
    </div>
  );
}
