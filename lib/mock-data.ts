export interface MockMember {
  membershipNumber: number;
  name: string;
  mobile: string;
  email?: string;
  discountPercentage: 5 | 10;
  membershipTier: "first100" | "next50";
  status: "active" | "revoked";
  discountRedeemed: boolean;
  redeemedAt: string | null;
  createdAt: string;
}

export const MOCK_CAMPAIGN = {
  total: 100,
  claimed: 0,
  remaining: 100,
  tenPercentMembers: 0,
  fivePercentMembers: 0,
  tenPercentLimit: 50,
  fivePercentLimit: 50,
  redeemed: 0,
  unredeemed: 0,
  status: "open" as const,
  allowRegistration: true,
  launchDate: "2026-02-14",
};

export const MOCK_MEMBER: MockMember = {
  membershipNumber: 37,
  name: "Rahul Sharma",
  mobile: "+91 98765 43210",
  email: "rahul.sharma@example.com",
  discountPercentage: 10,
  membershipTier: "first100",
  status: "active",
  discountRedeemed: false,
  redeemedAt: null,
  createdAt: "2026-01-12T11:20:00.000Z",
};

export const MOCK_MEMBERS: MockMember[] = [];

export function getMockMemberByNumber(
  membershipNumber: number
): MockMember {
  const found = MOCK_MEMBERS.find(
    (m) => m.membershipNumber === membershipNumber
  );
  if (found) return found;
  const index = membershipNumber % 10;
  const base = ["Aakash Nair", "Riya Gupta", "Ishaan Das", "Pooja Shah",
    "Aditya Verma", "Ananya Rao", "Rohan Mishra", "Kavya Joshi",
    "Siddharth Bansal", "Lakshay Chauhan"][index];
  return {
    membershipNumber,
    name: base,
    mobile: "+91 98888 00000",
    discountPercentage: membershipNumber <= 50 ? 10 : 5,
    membershipTier: membershipNumber <= 50 ? "first100" : "next50",
    status: "active",
    discountRedeemed: false,
    redeemedAt: null,
    createdAt: "2026-02-01T09:00:00.000Z",
  };
}

export type VerifyState =
  | "valid_active"
  | "valid_redeemed"
  | "revoked"
  | "invalid";

export interface VerifyResult {
  state: VerifyState;
  member?: MockMember;
}

export function getMockVerify(token: string): VerifyResult {
  switch (token) {
    case "demo-redeemed":
      return {
        state: "valid_redeemed",
        member: { ...MOCK_MEMBER, discountRedeemed: true, redeemedAt: "2026-02-02T18:30:00.000Z" },
      };
    case "demo-revoked":
      return { state: "revoked", member: { ...MOCK_MEMBER, status: "revoked" } };
    case "demo-invalid":
      return { state: "invalid" };
    default:
      return { state: "valid_active", member: MOCK_MEMBER };
  }
}

export const REGISTRATION_CHART: { label: string; count: number }[] = [
  { label: "Jan 20", count: 0 },
  { label: "Jan 21", count: 0 },
  { label: "Jan 22", count: 0 },
  { label: "Jan 23", count: 0 },
  { label: "Jan 24", count: 0 },
  { label: "Jan 25", count: 0 },
  { label: "Jan 26", count: 0 },
  { label: "Jan 27", count: 0 },
  { label: "Jan 28", count: 0 },
  { label: "Jan 29", count: 0 },
  { label: "Jan 30", count: 0 },
  { label: "Jan 31", count: 0 },
];

export const MOCK_ADMIN = {
  name: "Admin",
  email: "admin@urbanvogue.com",
};