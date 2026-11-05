import { describe, expect, it } from "vitest";
import { buyPower, rentPower, runPowers, RENT_MS, OFFERS, offerStatus } from "../src/meta/market";
import { addPoints, freshProgress, parseProgress } from "../src/meta/store";

const rich = () => addPoints(freshProgress(), 1000);
const NOW = 1_000_000;

describe("market", () => {
  it("refuses a power above the player rank", () => {
    const poor = addPoints(freshProgress(), 50);
    expect(buyPower(poor, "gust", NOW)).toBe(poor);
    expect(rentPower(poor, "gust", NOW)).toBe(poor);
  });

  it("buys a power for good and spends points once", () => {
    const bought = buyPower(rich(), "gust", NOW);
    expect(bought.points).toBe(880);
    expect(bought.owned).toContain("gust");
    expect(buyPower(bought, "gust", NOW)).toBe(bought);
    expect(runPowers(bought, "water", NOW + 10 * RENT_MS)).toContain("gust");
  });

  it("rents a power until the rental ends", () => {
    const rented = rentPower(rich(), "chill", NOW);
    expect(rented.points).toBe(975);
    expect(runPowers(rented, "water", NOW + 1)).toContain("chill");
    expect(runPowers(rented, "water", NOW + RENT_MS + 1)).not.toContain("chill");
    const offer = OFFERS.find((o) => o.power === "chill")!;
    expect(offerStatus(rented, offer, NOW + RENT_MS + 1)).toBe("available");
  });

  it("never lets points go below zero", () => {
    const poor = addPoints(freshProgress(), 130);
    expect(buyPower(poor, "gust", NOW).points).toBe(10);
    expect(rentPower(buyPower(poor, "gust", NOW), "chill", NOW).points).toBe(10);
  });

  it("keeps the god own powers and reads older saves", () => {
    expect(runPowers(freshProgress(), "wind", NOW)).toEqual(["gust", "chill"]);
    const old = parseProgress(JSON.stringify({ version: 1, points: 5, unlocked: ["water"] }));
    expect(old.owned).toEqual([]);
    expect(old.rentals).toEqual({});
  });
});
