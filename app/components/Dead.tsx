import {
  Transaction,
  TransactionButton,
  TransactionResponse,
  TransactionToast,
  TransactionToastAction,
  TransactionToastIcon,
  TransactionToastLabel,
  TransactionError,
} from "@coinbase/onchainkit/transaction";
import {
  ConnectWallet,
  ConnectWalletText,
  Wallet,
} from "@coinbase/onchainkit/wallet";
import { useHighScores } from "../HighScoresProvider";
import { useAccount } from "wagmi";
import { useNotification } from "@coinbase/onchainkit/minikit";
import { useCallback, useMemo } from "react";
import { addScore } from "@/lib/scores-client";
import { SCHEMA_UID } from "../utils";
import { encodeAbiParameters } from "viem";
import { Address } from "@coinbase/onchainkit/identity";
import { Stats } from "./Stats";

const EAS_CONTRACT = "0x4200000000000000000000000000000000000021";
const easABI = [
  {
    name: "attest",
    type: "function" as const,
    stateMutability: "payable" as const,
    inputs: [
      {
        name: "request",
        type: "tuple",
        components: [
          { name: "schema", type: "bytes32" },
          {
            name: "data",
            type: "tuple",
            components: [
              { name: "recipient", type: "address" },
              { name: "expirationTime", type: "uint64" },
              { name: "revocable", type: "bool" },
              { name: "refUID", type: "bytes32" },
              { name: "data", type: "bytes" },
              { name: "value", type: "uint256" },
            ],
          },
        ],
      },
    ],
    outputs: [{ name: "", type: "bytes32" }],
  },
];

type DeadProps = {
  score: number;
  level: number;
  onGoToIntro: () => void;
  isWin: boolean;
};

export function Dead({ score, level, onGoToIntro, isWin }: DeadProps) {
  const { invalidateHighScores, checkIsHighScore } = useHighScores();
  const sendNotification = useNotification();
  const { address } = useAccount();
  const isHighScore = checkIsHighScore(score);

  const handleAttestationSuccess = useCallback(
    async (response: TransactionResponse) => {
      if (!address) {
        return null;
      }

      await addScore({
        address,
        score,
        attestationUid: response.transactionReceipts[0].logs[0].data,
        transactionHash: response.transactionReceipts[0].transactionHash,
      });

      await sendNotification({
        title: "Congratulations!",
        body: `You scored a new high score of ${score} on minikit!`,
      });

      invalidateHighScores();
    },
    [address, invalidateHighScores, score, sendNotification],
  );

  const transactionButton = useMemo(() => {
    if (!address) {
      return (
        <Wallet>
          <ConnectWallet>
            <ConnectWalletText>Login to save your high score</ConnectWalletText>
          </ConnectWallet>
        </Wallet>
      );
    }

    return (
      <Transaction
        calls={[
          {
            address: EAS_CONTRACT,
            abi: easABI,
            functionName: "attest",
            args: [
              {
                schema: SCHEMA_UID,
                data: {
                  recipient: address,
                  expirationTime: BigInt(0),
                  revocable: false,
                  refUID:
                    "0x0000000000000000000000000000000000000000000000000000000000000000",
                  data: encodeAbiParameters(
                    [{ type: "string" }],
                    [`${address} scored ${score} on minikit`],
                  ),
                  value: BigInt(0),
                },
              },
            ],
          },
        ]}
        onSuccess={handleAttestationSuccess}
        onError={(error: TransactionError) =>
          console.error("Attestation failed:", error)
        }
      >
        <TransactionButton
          text="Submit to save high score"
          className="mx-auto w-[60%]"
          successOverride={{
            text: "View High Scores",
            onClick: onGoToIntro,
          }}
        />
        <TransactionToast className="mb-4">
          <TransactionToastIcon />
          <TransactionToastLabel />
          <TransactionToastAction />
        </TransactionToast>
      </Transaction>
    );
  }, [address, handleAttestationSuccess, onGoToIntro, score]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 z-20 m-[10px] mb-[30px]">
      <h1 className="text-6xl mb-4">{isWin ? "YOU WON!" : "GAME OVER"}</h1>
      {isHighScore && <p className="text-2xl mb-4">You got a high score!</p>}
      <Stats score={score} level={level} width={250} />
      {isHighScore && address && (
        <fieldset className="border-2 border-gray-300 rounded-md mb-4">
          <legend className="text-sm">Attestation</legend>
          <div className="text-gray-800 px-2 py-1 italic">
            <Address className="text-inherit" address={address} /> scored{" "}
            {score} on minikit
          </div>
        </fieldset>
      )}

      {isHighScore && transactionButton}
      <p className="text-lg mb-4 absolute bottom-0">
        Press play or space to play again
      </p>
    </div>
  );
}
