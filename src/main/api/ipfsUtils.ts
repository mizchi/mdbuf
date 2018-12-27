import IPFS from "ipfs";

export async function shareText(node: any, text: string) {
  const filesAdded = await node.files.add({
    path: "doc.md",
    content: Buffer.from(text)
  });
  return filesAdded[0].hash;
}

export async function fetchSharedText(node: any, hash: string) {
  const fileBuffer = await node.files.cat(hash);
  return fileBuffer.toString();
}

export async function ensureGatewayCache(hash: string) {
  return fetch(getIpfsLink(hash));
}

export function getIpfsLink(hash: string) {
  return `https://gateway.ipfs.io/ipfs/${hash}`;
}
