import { godById, type GodId } from "../sim/gods";
import type { Power } from "../sim/powers";
import { STAGES } from "../sim/vitality";
import { TIERS, tierFor, type RankTier } from "./ranking";
import type { Progress } from "./store";

export const RENT_MS = 30 * 60 * 1000;

export interface Offer {
  power: Power;
  god: GodId;
  tier: RankTier["id"];
  buy: number;
  rent: number;
}

export const OFFERS: Offer[] = [
  { power: "gust", god: "wind", tier: "wisp", buy: 120, rent: 30 },
  { power: "chill", god: "wind", tier: "wisp", buy: 100, rent: 25 },
  { power: "rain", god: "water", tier: "spring", buy: 200, rent: 40 },
  { power: "sun", god: "water", tier: "spring", buy: 200, rent: 40 },
];

export type OfferStatus = "owned" | "rented" | "locked" | "available";

const tierIndex = (id: RankTier["id"]): number => TIERS.findIndex((tier) => tier.id === id);

const offerFor = (power: Power): Offer | undefined => OFFERS.find((offer) => offer.power === power);

export const reachable = (progress: Progress, offer: Offer): boolean => tierIndex(tierFor(progress.earned).id) >= tierIndex(offer.tier);

export const rentedUntil = (progress: Progress, power: Power): number => progress.rentals[power] ?? 0;

export const offerStatus = (progress: Progress, offer: Offer, now: number): OfferStatus => {
  if (progress.owned.includes(offer.power)) return "owned";
  if (rentedUntil(progress, offer.power) > now) return "rented";
  return reachable(progress, offer) ? "available" : "locked";
};

export const buyPower = (progress: Progress, power: Power, now: number): Progress => {
  const offer = offerFor(power);
  if (!offer || offerStatus(progress, offer, now) === "owned" || !reachable(progress, offer) || progress.points < offer.buy) return progress;
  const { [power]: _spent, ...rentals } = progress.rentals;
  return { ...progress, points: progress.points - offer.buy, owned: [...progress.owned, power], rentals };
};

export const rentPower = (progress: Progress, power: Power, now: number): Progress => {
  const offer = offerFor(power);
  if (!offer || offerStatus(progress, offer, now) !== "available" || progress.points < offer.rent) return progress;
  return { ...progress, points: progress.points - offer.rent, rentals: { ...progress.rentals, [power]: now + RENT_MS } };
};

export const runPowers = (progress: Progress, god: GodId, now: number, stage = 0): Power[] => {
  const rented = OFFERS.filter((offer) => rentedUntil(progress, offer.power) > now).map((offer) => offer.power);
  const earned = STAGES.slice(0, stage + 1).flatMap((s) => (s.power ? [s.power] : []));
  return [...new Set<Power>([...godById(god).powers, ...progress.owned, ...rented, ...earned])];
};
