import { sendMemberWelcomeEmail } from "../lib/email/member-welcome";

async function main() {
  const recipient = process.argv[2] || "urbanvogue2k26@gmail.com";
  const result = await sendMemberWelcomeEmail({
    membershipNumber: 1,
    name: "Test User",
    email: recipient,
    discountPercentage: 10,
  });
  console.log(JSON.stringify(result, null, 2));
}

main();
