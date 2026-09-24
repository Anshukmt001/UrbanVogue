import { toPng } from "html-to-image";

export async function downloadMembershipPass(
  container: HTMLElement,
  membershipNumber: number
) {
  const node =
    container.querySelector<HTMLElement>("[data-pass-card]") ?? container;

  const width = node.offsetWidth;
  const height = node.offsetHeight;
  if (!width || !height) {
    throw new Error("Card has no size");
  }

  const dataUrl = await toPng(node, {
    pixelRatio: 2,
    backgroundColor: "#141414",
    width,
    height,
    style: {
      transform: "none",
      margin: "0",
      boxSizing: "border-box",
    },
    filter: (target) => {
      if (!(target instanceof Element)) return true;
      return !target.closest("[data-html2canvas-ignore]");
    },
  });

  const link = document.createElement("a");
  link.download = `urban-vogue-member-${membershipNumber}.png`;
  link.href = dataUrl;
  link.click();
}
