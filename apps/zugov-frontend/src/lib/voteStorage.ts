export type StoredVote = { type: "simple"; optionIndex: number } | { type: "ranked"; rankedOptions: string[] };

export function saveVote(pollAddress: string, walletAddress: string, vote: StoredVote): void {
  const key = `vote_${pollAddress.toLowerCase()}_${walletAddress.toLowerCase()}`;
  localStorage.setItem(key, JSON.stringify(vote));
}

export function getStoredVote(pollAddress: string, walletAddress: string): StoredVote | null {
  const key = `vote_${pollAddress.toLowerCase()}_${walletAddress.toLowerCase()}`;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredVote;
  } catch {
    return null;
  }
}
