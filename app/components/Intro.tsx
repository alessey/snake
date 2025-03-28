import SnakeLogo from "../svg/SnakeLogo";
import { HighScores } from "./HighScores";

type IntroProps = {
  konami: boolean;
};

export function Intro({ konami }: IntroProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center bg-white/70 z-20 m-[10px] mb-[30px] pb-6">
      <div className="absolute top-12">
        <SnakeLogo width={300} height={60} animate={konami} />
      </div>
      <HighScores />
      <div className="absolute bottom-4">Press play or space to start</div>
    </div>
  );
}