export type MembershipTier = "first100" | "next50";

export const DEFAULT_TIER_ONE_PERCENT = 10;

export function tierFromDiscount(
  discountPercentage: number,
  tierOnePercent?: number | null
): MembershipTier {
  const one =
    typeof tierOnePercent === "number" && Number.isFinite(tierOnePercent)
      ? tierOnePercent
      : DEFAULT_TIER_ONE_PERCENT;
  return Number(discountPercentage) >= one ? "first100" : "next50";
}
