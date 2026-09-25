import fs from "node:fs";
import path from "node:path";

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.trim().startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key && !(key in process.env)) process.env[key] = value;
  }
}

async function main() {
  loadEnvLocal();

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set (.env.local missing)");
  }

  const { default: mongoose } = await import("mongoose");
  const { Member, Counter, getOrCreateSettings } = await import("../models");

  await mongoose.connect(uri);

  const apply = process.argv.includes("--apply");
  const settings = await getOrCreateSettings();

  const tierOnePercent =
    typeof settings.tierOnePercent === "number" ? settings.tierOnePercent : 10;
  const tierTwoPercent =
    typeof settings.tierTwoPercent === "number" ? settings.tierTwoPercent : 5;
  const tenPercentLimit =
    typeof settings.tenPercentLimit === "number" ? settings.tenPercentLimit : 100;

  const members = await Member.find()
    .sort({ membershipNumber: 1 })
    .select({ membershipNumber: 1, discountPercentage: 1, discountRedeemed: 1 })
    .lean();

  const total = members.length;
  const tierOneBefore = members.filter(
    (m) => m.discountPercentage === tierOnePercent
  ).length;
  const tierTwoBefore = members.filter(
    (m) => m.discountPercentage === tierTwoPercent
  ).length;

  const desired = members.map((m, index) => ({
    membershipNumber: m.membershipNumber,
    from: m.discountPercentage,
    to: index < tenPercentLimit ? tierOnePercent : tierTwoPercent,
  }));
  const changes = desired.filter((c) => c.from !== c.to);

  const counter = await Counter.findOne({ _id: "membership" }).lean();
  const maxMembershipNumber = total
    ? members[members.length - 1].membershipNumber
    : 0;

  console.log("=== Tier repair report ===");
  console.log(`tenPercentLimit      : ${tenPercentLimit}`);
  console.log(`tier percents        : ${tierOnePercent}% / ${tierTwoPercent}%`);
  console.log(`total members        : ${total}`);
  console.log(`10% tier (before)    : ${tierOneBefore}  -> free slots: ${Math.max(0, tenPercentLimit - tierOneBefore)}`);
  console.log(`5% tier (before)     : ${tierTwoBefore}`);
  console.log(`counter seq          : ${counter ? counter.seq : "missing"}`);
  console.log(`max membershipNumber : ${maxMembershipNumber}`);
  console.log(`members to change    : ${changes.length}`);
  for (const c of changes) {
    console.log(`  #${c.membershipNumber}: ${c.from}% -> ${c.to}%`);
  }

  if (!apply) {
    console.log("\nDry run only. Re-run with --apply to write the changes.");
    await mongoose.disconnect();
    return;
  }

  if (changes.length > 0) {
    await Member.bulkWrite(
      changes.map((c) => ({
        updateOne: {
          filter: { membershipNumber: c.membershipNumber },
          update: { $set: { discountPercentage: c.to } },
        },
      }))
    );
  }

  const tierOneAfter = await Member.countDocuments({
    discountPercentage: tierOnePercent,
  });
  const tierTwoAfter = await Member.countDocuments({
    discountPercentage: tierTwoPercent,
  });

  console.log("\nApplied.");
  console.log(`10% tier (after)     : ${tierOneAfter}`);
  console.log(`5% tier (after)      : ${tierTwoAfter}`);
  console.log(
    `free 10% slots now   : ${Math.max(0, tenPercentLimit - tierOneAfter)}`
  );

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
