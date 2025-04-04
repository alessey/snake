import { Score } from "@/lib/scores";
import { MAX_SCORES } from "@/lib/scores-client";

const EAS_GRAPHQL_URL = "https://base.easscan.org/graphql";
export const SCHEMA_UID =
  "0xdc3cf7f28b4b5255ce732cbf99fe906a5bc13fbd764e2463ba6034b4e1881835";

export const GameState = {
  INTRO: 0,
  PAUSED: 1,
  RUNNING: 2,
  WON: 3,
  DEAD: 4,
  AWAITINGNEXTLEVEL: 5,
};

export const MoveState = {
  NONE: 0,
  UP: 1,
  RIGHT: 2,
  DOWN: 3,
  LEFT: 4,
};


export async function fetchDbEnabled() {
  const res = await fetch("/api/scores", { method: "OPTIONS" });
  const { enabled } = await res.json();
  return Boolean(enabled);
}

export type Attestation = {
  decodedDataJson: string;
  attester: string;
  time: string;
  id: string;
  txid: string;
};

export async function fetchLastAttestations() {
  const query = `
    query GetAttestations {
      attestations(
        where: { schemaId: { equals: "${SCHEMA_UID}" } }
        orderBy: { time: desc }
        take: 20
      ) {
        decodedDataJson
        attester
        time
        id
        txid
      }
    }
  `;

  const response = await fetch(EAS_GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  const { data } = await response.json();
  return (data?.attestations ?? [])
    .reduce((acc: Score[], attestation: Attestation) => {
      const parsedData = JSON.parse(attestation?.decodedDataJson ?? "[]");
      const pattern = /(0x[a-fA-F0-9]{40}) scored (\d+) on minikit/;
      const match = parsedData[0].value?.value?.match(pattern);
      if (match) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, address, score] = match;
        acc.push({
          score: parseInt(score),
          address,
          attestationUid: attestation.id,
          transactionHash: attestation.txid,
        });
      }
      return acc;
    }, [])
    .sort((a: Score, b: Score) => b.score - a.score)
    .slice(0, MAX_SCORES);
}
