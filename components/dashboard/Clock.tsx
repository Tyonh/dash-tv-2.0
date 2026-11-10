"use client";

import { useEffect, useState } from "react";

export function Clock() {
  const [agora, setAgora] = useState<Date | null>(null);

  useEffect(() => {
    setAgora(new Date());
    const id = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <span>{agora ? agora.toLocaleDateString("pt-BR") : "00/00/0000"}</span> |{" "}
      <span>{agora ? agora.toLocaleTimeString("pt-BR") : "00:00:00"}</span>
    </>
  );
}
