import { Name } from "@coinbase/onchainkit/identity";
import { useOpenUrl } from "@coinbase/onchainkit/minikit";
import { useHighScores } from "../HighScoresProvider";
import { useEffect } from "react";
import { Score } from "@/lib/scores";
import { Identity } from "@coinbase/onchainkit/identity";
import ArrowSvg from "../svg/ArrowSvg";

export function HighScores() {
  const { highScores, isDbEnabled, loadHighScores } = useHighScores();
  const openUrl = useOpenUrl();

  useEffect(() => {
    loadHighScores();
  }, [loadHighScores]);

  const handleHighScoreClick = (score: Score) => {
    openUrl(`https://basescan.org/tx/${score.transactionHash}`);
  };

  return (
    <div className="flex flex-col items-center justify-center absolute top-32 w-[80%]">
      <h1 className="text-2xl mb-4">
        {isDbEnabled ? "HIGH SCORES" : "RECENT HIGH SCORES"}
      </h1>
      {highScores
        .sort((a, b) => b.score - a.score)
        .map((score, index) => (
          <button
            type="button"
            key={score.attestationUid}
            className="flex items-center w-full"
            onClick={() => handleHighScoreClick(score)}
          >
            <span className="text-black w-8">{index + 1}.</span>
            <div className="flex items-center flex-grow">
              <Identity
                className="!bg-inherit space-x-1 px-0 [&>div]:space-x-2"
                address={score.address}
              >
                <Name className="text-black" />
              </Identity>
              <div className="px-2">
                <ArrowSvg />
              </div>
            </div>
            <div className="text-black text-right flex-grow">{score.score}</div>
          </button>
        ))}
    </div>
  );
}