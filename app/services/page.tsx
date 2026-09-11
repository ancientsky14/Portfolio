import type { Metadata } from "next";
import { Container } from "@/components/site/container";
import { Method } from "@/components/services/method";
import { ServiceCards } from "@/components/services/service-cards";
import { UpdateFlow } from "@/components/services/update-flow";
import { ProofStrip } from "@/components/sections/proof-strip";
import { Engagement } from "@/components/sections/engagement";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Web apps, desktop apps, multi-site platforms, internal tools and the maintenance after — how I work, what you get, and who owns what afterwards.",
};

/**
 * Services — rebuilt 2026-09-11 after the reference's services page, with
 * Jan's own content: a header, then one frame holding the method (Scope.
 * Build. Keep running.), the five services, and a live diagram of
 * eBudget's update path; then who it was built for, and the five-step
 * process with its drawn line (#process).
 *
 * All content is in lib/services.ts with its receipts. The order is still
 * the argument: what I build → how it runs → who hired me → what happens
 * after we sign.
 */
export default function Services() {
  return (
    <>
      <section className="border-b border-line pb-14 pt-12 sm:pb-20 sm:pt-16">
        <Container width="wide">
          <p className="font-mono text-2xs font-semibold uppercase tracking-widest text-accent">
            Services
          </p>
          <h1
            data-split
            className="mt-3 max-w-4xl font-display text-2xl font-bold leading-tight tracking-tight text-text sm:text-3xl"
          >
            Web apps, desktop apps, multi-site platforms and internal tools.
          </h1>
          <p className="mt-3 text-text-2">
            What I build, how it runs, and what you get.
          </p>

          <div className="frame mt-8 p-3 sm:p-5">
            <Method />
            <ServiceCards />
            <UpdateFlow />
          </div>
        </Container>
      </section>
      <ProofStrip />
      <Engagement />
    </>
  );
}