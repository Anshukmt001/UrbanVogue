import QRCode from "qrcode";
import { sendWelcomeEmail, type SendWelcomeEmailResult } from "./sendWelcomeEmail";
import Member from "@/models/Member";

export interface WelcomeEmailMemberInput {
  _id?: unknown;
  membershipNumber: number;
  name: string;
  email?: string | undefined;
  discountPercentage: number;
}

const FALLBACK_BASE_URL = "https://urbanvogue.vercel.app";

export function getBaseUrl(): string {
  const raw = process.env.APP_BASE_URL?.trim() || FALLBACK_BASE_URL;
  return raw.replace(/\/+$/, "");
}

export function buildPassUrl(membershipNumber: number): string {
  return `${getBaseUrl()}/membership/${membershipNumber}`;
}

export function buildVerifyQrValue(membershipNumber: number): string {
  return `${getBaseUrl()}/verify/uv-${membershipNumber}`;
}

export async function buildQrDataUrl(
  membershipNumber: number
): Promise<string | undefined> {
  try {
    return await QRCode.toDataURL(buildVerifyQrValue(membershipNumber), {
      margin: 1,
      width: 480,
      color: { dark: "#0A0A0A", light: "#FFFFFF" },
    });
  } catch {
    return undefined;
  }
}

export async function sendMemberWelcomeEmail(
  member: WelcomeEmailMemberInput
): Promise<SendWelcomeEmailResult> {
  const qrCode = await buildQrDataUrl(member.membershipNumber);

  return sendWelcomeEmail({
    name: member.name,
    email: member.email,
    memberId: member.membershipNumber,
    discount: member.discountPercentage,
    passUrl: buildPassUrl(member.membershipNumber),
    qrCode,
  });
}

export interface RecordedWelcomeEmailResult extends SendWelcomeEmailResult {
  membershipNumber: number;
  recorded: boolean;
}

export async function sendAndRecordWelcomeEmail(
  member: WelcomeEmailMemberInput
): Promise<RecordedWelcomeEmailResult> {
  const membershipNumber = member.membershipNumber;

  if (!member.email) {
    await updateWelcomeEmailFields(member, {
      welcomeEmailStatus: "skipped",
      welcomeEmailSent: false,
      welcomeEmailSentAt: null,
      welcomeEmailError: "No email address",
    });
    return {
      membershipNumber,
      ok: false,
      code: "invalid_recipient",
      messageId: null,
      error: "No email address",
      recorded: true,
    };
  }

  const result = await sendMemberWelcomeEmail(member);

  const recorded = await updateWelcomeEmailFields(member, {
    welcomeEmailStatus: result.ok ? "sent" : "failed",
    welcomeEmailSent: result.ok,
    welcomeEmailSentAt: result.ok ? new Date() : null,
    welcomeEmailError: result.ok ? null : `${result.code}${result.error ? `: ${result.error}` : ""}`,
  });

  return { membershipNumber, ...result, recorded };
}

async function updateWelcomeEmailFields(
  member: WelcomeEmailMemberInput,
  fields: {
    welcomeEmailStatus: "pending" | "sent" | "failed" | "skipped";
    welcomeEmailSent: boolean;
    welcomeEmailSentAt: Date | null;
    welcomeEmailError: string | null;
  }
): Promise<boolean> {
  if (!member._id) return false;
  try {
    await Member.updateOne({ _id: member._id }, { $set: fields });
    return true;
  } catch {
    return false;
  }
}
