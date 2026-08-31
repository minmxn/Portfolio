"use client";

import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";

interface ContactCtaProps {
  email: string;
  label?: string;
}

/**
 * Client wrapper around LiquidMetalButton so it can carry an onClick handler.
 * (Server components can't pass functions across the RSC boundary, so the
 * click behaviour lives here.)
 */
export function ContactCta({ email, label = "Get in touch" }: ContactCtaProps) {
  return (
    <LiquidMetalButton
      label={label}
      onClick={() => {
        window.location.href = `mailto:${email}`;
      }}
    />
  );
}
