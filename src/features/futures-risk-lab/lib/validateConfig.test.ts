import { describe, expect, it } from "vitest";
import { validateConfig } from "./validateConfig";
import { DEFAULT_CONFIG } from "./defaults";
import type { SimulationConfig } from "../types";

describe("validateConfig", () => {
  it("accepts the default MNQ config", () => {
    expect(validateConfig(DEFAULT_CONFIG)).toEqual([]);
  });

  it("flags a non-positive starting balance", () => {
    const config: SimulationConfig = { ...DEFAULT_CONFIG, startingBalance: 0 };
    expect(validateConfig(config).some((i) => i.field === "startingBalance")).toBe(true);
  });

  it("flags a win rate outside (0, 1)", () => {
    const config: SimulationConfig = {
      ...DEFAULT_CONFIG,
      synthetic: { ...DEFAULT_CONFIG.synthetic, winRate: 1.5 },
    };
    expect(validateConfig(config).some((i) => i.field === "winRate")).toBe(true);
  });

  it("flags a win rate of exactly 0 or 1 (degenerate distributions)", () => {
    const zero: SimulationConfig = { ...DEFAULT_CONFIG, synthetic: { ...DEFAULT_CONFIG.synthetic, winRate: 0 } };
    const one: SimulationConfig = { ...DEFAULT_CONFIG, synthetic: { ...DEFAULT_CONFIG.synthetic, winRate: 1 } };
    expect(validateConfig(zero).some((i) => i.field === "winRate")).toBe(true);
    expect(validateConfig(one).some((i) => i.field === "winRate")).toBe(true);
  });

  it("flags numTrades and numSimulations outside their allowed ranges", () => {
    const tooFewTrades: SimulationConfig = { ...DEFAULT_CONFIG, numTrades: 1 };
    const tooManySims: SimulationConfig = { ...DEFAULT_CONFIG, numSimulations: 10_000_000 };
    expect(validateConfig(tooFewTrades).some((i) => i.field === "numTrades")).toBe(true);
    expect(validateConfig(tooManySims).some((i) => i.field === "numSimulations")).toBe(true);
  });

  it("flags non-integer trade/simulation counts", () => {
    const config: SimulationConfig = { ...DEFAULT_CONFIG, numTrades: 40.5 };
    expect(validateConfig(config).some((i) => i.field === "numTrades")).toBe(true);
  });

  it("requires at least 10 empirical R multiples in empirical mode", () => {
    const config: SimulationConfig = { ...DEFAULT_CONFIG, mode: "empirical", empiricalRMultiples: [1, -1] };
    expect(validateConfig(config).some((i) => i.field === "empiricalRMultiples")).toBe(true);
  });

  it("does not require synthetic params to be valid in empirical mode", () => {
    const config: SimulationConfig = {
      ...DEFAULT_CONFIG,
      mode: "empirical",
      empiricalRMultiples: Array.from({ length: 20 }, () => 1),
      synthetic: { ...DEFAULT_CONFIG.synthetic, winRate: -5 },
    };
    expect(validateConfig(config).some((i) => i.field === "winRate")).toBe(false);
  });
});
