import { toPng } from "html-to-image";

export async function downloadMembershipPass(
  container: HTMLElement,
  membershipNumber: number
) {
  const node =
    container.querySelector<HTMLElement>("[data-pass-card]") ?? container;

  const dataUrl = await toPng(node, {
    pixelRatio: 3,
    backgroundColor: "#141414",
    width: node.offsetWidth,
    height: node.offsetHeight,
    style: {
      transform: "none",
      margin: "0",
    },
  });

  const link = document.createElement("a");
  link.download = `urban-vogue-member-${membershipNumber}.png`;
  link.href = dataUrl;
  link.click();
}
