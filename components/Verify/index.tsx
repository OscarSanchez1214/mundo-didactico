"use client";

import {
  MiniKit,
  VerificationLevel,
  ISuccessResult,
} from "@worldcoin/minikit-js";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

export type VerifyCommandInput = {
  action: string;
  signal?: string;
  verification_level?: VerificationLevel;
};

const verifyPayload: VerifyCommandInput = {
  action: "vota-por-proyecto",
  signal: "",
  verification_level: VerificationLevel.Orb,
};

export const VerifyBlock = () => {
  const [status, setStatus] = useState("Verifica para leer las recomendaciones financieras de hoy");
  const router = useRouter();

  const handleVerify = useCallback(async () => {
    if (!MiniKit.isInstalled()) {
      setStatus("❌ MiniKit no está instalado. Abre esta MiniApp desde World App.");
      return;
    }

    try {
      const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload);

      if (finalPayload.status === "error") {
        console.warn("Verificación cancelada:", finalPayload);
        setStatus("❌ Verificación cancelada o fallida.");
        return;
      }

      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload: finalPayload as ISuccessResult,
          action: verifyPayload.action,
          signal: verifyPayload.signal,
        }),
      });

      const result = await res.json();

      if (res.status === 200 && result.success) {
        setStatus("✅ Verificación exitosa. Redirigiendo...");
        setTimeout(() => {
          router.push("/blog");
        }, 1000);
      } else if (result.verifyRes?.code === "already_verified") {
        setStatus("✅ Ya estabas verificado. Redirigiendo...");
        setTimeout(() => {
          router.push("/blog");
        }, 1000);
      } else {
        setStatus(`❌ Falló verificación: ${result.verifyRes?.detail || "Error desconocido."}`);
      }

    } catch (err) {
      console.error("Error al verificar:", err);
      setStatus("❌ Error inesperado en la verificación.");
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center mt-6">
      <h2 className="text-xl font-semibold mb-2">Verificación de Identidad</h2>
      <p className="mb-2 text-center">{status}</p>
      <button
        onClick={handleVerify}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
      >
        Verificar con World ID
      </button>
    </div>
  );
};
