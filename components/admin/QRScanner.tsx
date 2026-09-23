"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ScanLine, Camera, CameraOff, CheckCircle2, XCircle, Ban, SearchX } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { Badge } from "@/components/ui/Badge";

interface ScannedMember {
  name: string;
  membershipNumber: number;
  discountPercentage: 5 | 10;
}

type Outcome =
  | { kind: "valid"; member: ScannedMember }
  | { kind: "redeemed"; member: ScannedMember; message: string }
  | { kind: "revoked"; member: ScannedMember | null }
  | { kind: "not_found" }
  | { kind: "error"; message: string };

type CameraState =
  | { kind: "idle" }
  | { kind: "starting" }
  | { kind: "active" }
  | { kind: "denied"; message: string };

export function QRScanner() {
  const [input, setInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [camera, setCamera] = useState<CameraState>({ kind: "idle" });
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    return () => {
      const s = scannerRef.current;
      if (s) {
        s.stop().catch(() => {});
        s.clear();
      }
    };
  }, []);

  function parseNumber(value: string): number | null {
    const match = value.match(/uv-(\d+)/i) || value.match(/(\d)/);
    if (!match) return null;
    const n = parseInt(match[1], 10);
    if (isNaN(n) || n < 1) return null;
    return n;
  }

  async function lookup(membershipNumber: number) {
    setScanning(true);
    setOutcome(null);
    try {
      const res = await fetch(`/api/members/${membershipNumber}`);
      if (res.ok) {
        const json = await res.json();
        setOutcome({
          kind: "valid",
          member: {
            name: json.data.name,
            membershipNumber: json.data.membershipNumber,
            discountPercentage: json.data.discountPercentage,
          },
        });
      } else if (res.status === 403) {
        setOutcome({ kind: "revoked", member: null });
      } else if (res.status === 404) {
        setOutcome({ kind: "not_found" });
      } else {
        setOutcome({ kind: "error", message: "Something went wrong. Try again." });
      }
    } catch {
      setOutcome({ kind: "error", message: "Could not reach the server. Try again." });
    } finally {
      setScanning(false);
    }
  }

  async function handleScan(value: string) {
    const membershipNumber = parseNumber(value);
    if (!membershipNumber) {
      setOutcome({
        kind: "error",
        message: "This QR is not an Urban Vogue member pass. Scan the pass shown on the membership page.",
      });
      return;
    }
    await lookup(membershipNumber);
  }

  async function startCamera() {
    setCamera({ kind: "starting" });
    let scanner: Html5Qrcode;
    try {
      scanner = new Html5Qrcode("qr-reader", false);
    } catch {
      setCamera({
        kind: "denied",
        message: "Could not initialise the QR reader. Use manual entry below.",
      });
      return;
    }
    scannerRef.current = scanner;
    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        async (decodedText) => {
          const s = scannerRef.current;
          scannerRef.current = null;
          if (s) {
            await s.stop().catch(() => {});
          }
          setCamera({ kind: "idle" });
          await handleScan(decodedText);
        },
        () => {}
      );
      setCamera({ kind: "active" });
    } catch (err) {
      try {
        await scanner.clear();
      } catch {}
      scannerRef.current = null;
      const name = err instanceof Error ? err.name : "";
      let message = "Could not access the camera. Allow camera access and try again.";
      if (name === "NotAllowedError") {
        message = "Camera permission was denied. Enable camera access in your browser settings, then try again.";
      } else if (name === "NotFoundError" || name === "OverconstrainedError") {
        message = "No camera was found on this device.";
      } else if (name === "NotReadableError") {
        message = "The camera is busy or in use by another app.";
      } else if (name === "NotSupportedError" || name === "TypeError") {
        message = "QR scanning is not supported on this browser or device. Use manual entry below.";
      } else if (name === "SecurityError") {
        message = "Camera access requires a secure (HTTPS) connection. You may be on http:// — use the deployed HTTPS link or localhost.";
      }
      setCamera({ kind: "denied", message });
    }
  }

  async function stopCamera() {
    const s = scannerRef.current;
    scannerRef.current = null;
    if (s) {
      await s.stop().catch(() => {});
    }
    setCamera({ kind: "idle" });
  }

  async function doRedeem(member: ScannedMember) {
    setRedeeming(true);
    try {
      const res = await fetch("/api/admin/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membershipNumber: member.membershipNumber }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success) {
        setOutcome({ kind: "redeemed", member, message: "Discount applied." });
      } else if (res.status === 403) {
        setOutcome({ kind: "revoked", member });
      } else if (res.status === 409) {
        setOutcome({
          kind: "redeemed",
          member,
          message: "This discount has already been redeemed.",
        });
      } else {
        setOutcome({ kind: "error", message: "Could not redeem. Try again." });
      }
    } catch {
      setOutcome({ kind: "error", message: "Could not reach the server. Try again." });
    } finally {
      setRedeeming(false);
    }
  }

  function resetScan() {
    setOutcome(null);
    setInput("");
  }

  const invalidKind =
    outcome?.kind === "revoked" || outcome?.kind === "not_found";
  const member = outcome && "member" in outcome ? outcome.member : null;
  const cameraActive = camera.kind === "active";
  const cameraBusy = camera.kind === "starting";

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Scanner */}
      <div className="border border-border bg-card p-6 sm:p-10">
        <div className="flex items-center gap-2 mb-2">
          <ScanLine className="h-4 w-4 text-primary" />
          <h2 className="font-headline text-xl uppercase tracking-tight">
            Scan Member Pass
          </h2>
        </div>
        <p className="font-mono text-[8px] tracking-[0.28em] uppercase text-muted-foreground mb-6">
          Allow camera access, then point it at the member QR code.
        </p>

        <div className="relative aspect-[4/3] overflow-hidden bg-background border border-border">
          <div id="qr-reader" className="absolute inset-0" />
          {camera.kind === "denied" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-background">
              <CameraOff className="h-8 w-8 text-red-400" strokeWidth={1.5} />
              <p className="mt-3 font-mono text-[9px] leading-relaxed tracking-[0.18em] uppercase text-red-400">
                Camera unavailable
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{camera.message}</p>
            </div>
          )}
          {!cameraActive && camera.kind !== "denied" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute inset-0 grid-pattern opacity-40" />
              <div className="relative h-40 w-40">
                <span className="absolute top-0 left-0 h-8 w-8 border-t-2 border-l-2 border-primary" />
                <span className="absolute top-0 right-0 h-8 w-8 border-t-2 border-r-2 border-primary" />
                <span className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-primary" />
                <span className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-primary" />
                {cameraBusy && (
                  <motion.span
                    animate={{ y: [-64, 64, -64] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-0 right-0 h-px bg-primary"
                  />
                )}
              </div>
            </div>
          )}
          <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
            <p className="font-mono text-[8px] tracking-[0.3em] uppercase text-muted-foreground">
              {cameraBusy
                ? "Starting camera…"
                : cameraActive
                ? "Align the QR code inside the frame"
                : camera.kind === "denied"
                ? "Use manual entry below"
                : "Press Start Camera"}
            </p>
          </div>
        </div>

        {camera.kind !== "active" && camera.kind !== "starting" && (
          <button
            onClick={startCamera}
            disabled={cameraBusy}
            className="clip-notch mt-6 flex w-full items-center justify-center gap-2 bg-bone px-6 py-4 text-[10px] font-bold tracking-[0.22em] uppercase text-background hover:bg-[#c9a86a] transition-colors disabled:opacity-60 cursor-pointer"
          >
            <Camera className="h-4 w-4" />
            Start Camera
          </button>
        )}
        {camera.kind === "active" && (
          <button
            onClick={stopCamera}
            className="clip-notch mt-6 flex w-full items-center justify-center gap-2 border border-border px-6 py-4 text-[10px] font-bold tracking-[0.22em] uppercase text-muted-foreground hover:text-foreground hover:border-silver transition-all cursor-pointer"
          >
            <CameraOff className="h-4 w-4" />
            Stop Camera
          </button>
        )}

        <div className="mt-6 border-t border-border pt-5">
          <p className="mb-3 font-mono text-[8px] tracking-[0.28em] uppercase text-muted-foreground">
            Or enter the pass value manually
          </p>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleScan(input);
              }}
              placeholder="UV-3 or verify link…"
              className="flex-1 min-w-0 border border-border bg-background px-4 py-3 font-mono text-sm text-bone placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
            />
            <button
              onClick={() => handleScan(input)}
              disabled={scanning}
              className="border border-border px-4 text-[10px] font-bold tracking-[0.22em] uppercase text-muted-foreground hover:text-foreground hover:border-primary transition-all disabled:opacity-60 cursor-pointer"
            >
              {scanning ? "…" : "Scan"}
            </button>
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="border border-border bg-card p-6 sm:p-10 flex flex-col">
        <h2 className="font-headline text-xl uppercase tracking-tight mb-8">
          Scan Result
        </h2>

        {!outcome && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
            <ScanLine className="h-10 w-10 text-muted-foreground/30" strokeWidth={1} />
            <p className="mt-4 font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground">
              Awaiting a scan
            </p>
            {scanning && (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="mt-3 h-5 w-5 border border-primary border-t-transparent rounded-full"
              />
            )}
          </div>
        )}

        {outcome && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col"
          >
            {invalidKind && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-16 border border-red-500/30 bg-red-500/5">
                {outcome.kind === "revoked" ? (
                  <Ban className="h-10 w-10 text-red-400" strokeWidth={1.5} />
                ) : (
                  <SearchX className="h-10 w-10 text-red-400" strokeWidth={1.5} />
                )}
                <Badge tone="invalid" className="self-center mt-4">
                  {outcome.kind === "revoked" ? "Invalid · Revoked" : "Invalid Pass"}
                </Badge>
                <p className="mt-3 max-w-xs font-mono text-[10px] leading-relaxed tracking-[0.12em] text-muted-foreground">
                  {outcome.kind === "revoked"
                    ? "This pass was revoked by admin and can no longer be used."
                    : "No member matches this pass in the registry."}
                </p>
              </div>
            )}

            {outcome.kind === "error" && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-16 border border-red-500/30 bg-red-500/5">
                <XCircle className="h-10 w-10 text-red-400" strokeWidth={1.5} />
                <Badge tone="invalid" className="self-center mt-4">
                  Scan Failed
                </Badge>
                <p className="mt-3 font-mono text-[10px] tracking-[0.12em] text-muted-foreground">
                  {outcome.message}
                </p>
              </div>
            )}

            {(outcome.kind === "valid" || outcome.kind === "redeemed") && member && (
              <>
                <Badge
                  tone={outcome.kind === "valid" ? "active" : "redeemed"}
                  className="self-start mb-4"
                >
                  {outcome.kind === "valid" ? "Valid Member" : "Discount Redeemed"}
                </Badge>
                <p className="font-headline text-5xl leading-none text-bone">
                  #{String(member.membershipNumber).padStart(3, "0")}
                </p>
                <p className="mt-2 text-base text-muted-foreground tracking-wide">
                  {member.name}
                </p>
                <div className="mt-6 flex items-center gap-3 border border-border bg-background px-6 py-4 self-start">
                  <span className="font-headline text-3xl leading-none text-primary">
                    {member.discountPercentage}%
                  </span>
                  <span className="font-mono text-[8px] tracking-[0.3em] uppercase text-muted-foreground">
                    Off
                    <br />
                    Everything
                  </span>
                </div>
                {outcome.kind === "redeemed" && (
                  <p className="mt-4 font-mono text-[9px] tracking-[0.24em] uppercase text-amber-400">
                    {outcome.message}
                  </p>
                )}
              </>
            )}

            <div className="mt-auto pt-8 space-y-3">
              {outcome.kind === "valid" && member && (
                <button
                  onClick={() => doRedeem(member)}
                  disabled={redeeming}
                  className="clip-notch flex w-full items-center justify-center gap-2 bg-primary px-6 py-4 text-[10px] font-bold tracking-[0.22em] uppercase text-primary-foreground hover:bg-[#b7964e] transition-colors disabled:opacity-60 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {redeeming ? "Applying…" : "Redeem Discount"}
                </button>
              )}
              <button
                onClick={resetScan}
                className="w-full border border-border px-6 py-3 text-[10px] font-bold tracking-[0.22em] uppercase text-muted-foreground hover:text-foreground hover:border-silver transition-all cursor-pointer"
              >
                New Scan
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}