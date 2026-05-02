import QRCode from "qrcode";

export async function createQrDataUrl(value: string): Promise<string> {
  const safeValue = value.trim() || "https://example.com";
  return QRCode.toDataURL(safeValue, {
    margin: 1,
    width: 320,
    errorCorrectionLevel: "M",
  });
}
