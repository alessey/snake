import { useAccount } from "wagmi";
import { ControlButton } from "./ControlButton";
import { WalletControl } from "./WalletControl";
import { GameState } from "../utils";

type ControlButtonsProps = {
  gameState: number;
  handleMobileGameState: () => void;
};

export function ControlButtons({
  gameState,
  handleMobileGameState,
}: ControlButtonsProps) {
  const { address } = useAccount();

  return (
    <>
      <div className="absolute left-8 top-16 w-24">
        <ControlButton className="block" onClick={handleMobileGameState} />
        <div className="ml-6 w-16 text-center -rotate-45 leading-[1.2]">
          {gameState === GameState.RUNNING ? "PAUSE" : "PLAY"}
        </div>
      </div>
      <div className="absolute right-0 top-4 w-24">
        <WalletControl />
        <div className="ml-4 w-20 text-center -rotate-45 leading-[1.2]">
          {address ? "LOGOUT" : "LOGIN"}
        </div>
      </div>
    </>
  );
}