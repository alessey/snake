import { useCallback, useMemo } from "react";
import { Score } from "@/lib/scores";
import { useState } from "react";
import { useContext } from "react";
import { createContext } from "react";
import { fetchLastAttestations } from "./utils";
import { fetchDbEnabled } from "./utils";
import { getTopScores, MAX_SCORES } from "@/lib/scores-client";

type HighScoresContextType = {
  isDbEnabled: boolean | undefined;
  highScores: Score[];
  checkIsHighScore: (currentScore: number) => boolean;
  invalidateHighScores: () => void;
  loadHighScores: () => Promise<void>;
};

const emptyHighScoresContext = {} as HighScoresContextType;
export const HighScoresContext = createContext<HighScoresContextType>(
  emptyHighScoresContext,
);
export function useHighScores() {
  const context = useContext(HighScoresContext);
  if (context === emptyHighScoresContext) {
    throw new Error(
      "useHighScores must be used within an HighScoresProvider component",
    );
  }
  return context;
}

export function HighScoresProvider({ children }: { children: React.ReactNode }) {
  const [highScores, setHighScores] = useState<Score[]>([]);
  const [invalidate, setInvalidate] = useState(true);
  const [isDbEnabled, setIsDbEnabled] = useState<boolean>();

  const loadHighScores = useCallback(async () => {
    if (invalidate) {
      setInvalidate(false);
      const dbEnabled = isDbEnabled ?? (await fetchDbEnabled());
      setIsDbEnabled(dbEnabled);

      // if db is enabled, fetch top scores, otherwise fetch last 8 attestations
      const scores = dbEnabled
        ? await getTopScores()
        : await fetchLastAttestations();
      setHighScores(scores ?? []);
    }
  }, [invalidate, isDbEnabled]);

  const invalidateHighScores = useCallback(() => {
    setInvalidate(true);
  }, []);

  const checkIsHighScore = useCallback(
    (currentScore: number) => {
      if (currentScore === 0) {
        return false;
      }

      // if less than MAX_SCORES scores or current score is higher than lowest score
      if (
        (highScores?.length ?? 0) < MAX_SCORES ||
        currentScore > (highScores?.[highScores.length - 1]?.score ?? 0)
      ) {
        return true;
      }
      return false;
    },
    [highScores],
  );

  const value = useMemo(
    () => ({
      highScores,
      invalidateHighScores,
      isDbEnabled,
      checkIsHighScore,
      loadHighScores,
    }),
    [
      highScores,
      invalidateHighScores,
      isDbEnabled,
      checkIsHighScore,
      loadHighScores,
    ],
  );

  return (
    <HighScoresContext.Provider value={value}>
      {children}
    </HighScoresContext.Provider>
  );
}