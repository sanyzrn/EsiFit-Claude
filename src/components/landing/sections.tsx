"use client";

import { useMemo, useRef, useState } from "react";
import {
  Apple,
  Dumbbell,
  LayoutDashboard,
  LineChart,
  Trophy,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { landingContent } from "@/content/landing";
import { RevealOnScroll } from "@/components/ui-extended/motion";
import { SectionHeader } from "@/components/ui-extended/section";
import { GlassCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/overlays";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/overlays";
import { cn } from "@/lib/utils";

const icons = { LayoutDashboard, Dumbbell, Apple, LineChart, Trophy, Users } as const;

export function FeaturesSection() {
  return (
    <section id="features" className="container-esi py-24">
      <RevealOnScroll>
        <SectionHeader
          eyebrow="Platform"
          title="Everything in one calm operating system"
          description="Dashboards, training, nutrition, analytics, and community — designed as one composition, not a bolted-together gym site."
        />
      </RevealOnScroll>
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {landingContent.features.map((feature, i) => {
          const Icon = icons[feature.icon];
          return (
            <RevealOnScroll key={feature.title} delay={i * 0.05}>
              <GlassCard interactive className="h-full p-6">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--mint-dim)] text-[var(--mint)]">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="type-h4">{feature.title}</h3>
                <p className="type-body-sm mt-3 text-[var(--foreground-muted)]">{feature.description}</p>
              </GlassCard>
            </RevealOnScroll>
          );
        })}
      </div>
    </section>
  );
}

export function TransformationSlider() {
  const [pos, setPos] = useState(52);
  const trackRef = useRef<HTMLDivElement>(null);

  function updateFromClientX(clientX: number) {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(4, Math.min(96, next)));
  }

  return (
    <section className="container-esi py-24">
      <RevealOnScroll>
        <SectionHeader
          eyebrow="Progress"
          title="See the arc, not the noise"
          description="A before/after comparison built for honest milestones — drag to reveal."
        />
      </RevealOnScroll>
      <RevealOnScroll delay={0.08}>
        <div
          ref={trackRef}
          className="relative mx-auto mt-12 aspect-[16/10] max-w-4xl overflow-hidden rounded-[var(--radius-lg)] border border-[var(--surface-glass-border)] shadow-[var(--shadow-raised)] select-none"
          onPointerMove={(e) => e.buttons === 1 && updateFromClientX(e.clientX)}
          onPointerDown={(e) => {
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
            updateFromClientX(e.clientX);
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-3)] via-[var(--surface-2)] to-[var(--plasma-dim)]">
            <div className="absolute inset-0 flex items-end p-6">
              <div>
                <p className="type-caption font-semibold uppercase tracking-[0.14em] text-[var(--foreground-subtle)]">Before</p>
                <p className="type-h3 mt-1">Baseline week</p>
                <p className="type-data-md mt-2 text-[var(--foreground-muted)]">Consistency 41%</p>
              </div>
            </div>
          </div>
          <div
            className="absolute inset-0 bg-gradient-to-br from-[var(--mint-dim)] via-[var(--surface-1)] to-[var(--surface-2)]"
            style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
          >
            <div className="absolute inset-0 flex items-end justify-end p-6">
              <div className="text-right">
                <p className="type-caption font-semibold uppercase tracking-[0.14em] text-[var(--mint)]">After</p>
                <p className="type-h3 mt-1">Steady streak</p>
                <p className="type-data-md mt-2 text-[var(--mint)]">Consistency 88%</p>
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 z-10 w-0.5 bg-[var(--foreground)]" style={{ left: `${pos}%` }} aria-hidden>
            <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--foreground)] text-[var(--surface-0)] shadow-[var(--shadow-float)]">
              ⇄
            </div>
          </div>
          <input
            type="range"
            min={4}
            max={96}
            value={pos}
            onChange={(e) => setPos(Number(e.target.value))}
            className="absolute inset-0 z-20 cursor-ew-resize opacity-0"
            aria-label="Reveal transformation comparison"
          />
        </div>
      </RevealOnScroll>
    </section>
  );
}

export function TestimonialsSection() {
  return (
    <section className="container-esi py-24">
      <RevealOnScroll>
        <SectionHeader eyebrow="Members" title="Quiet confidence, loud results" />
      </RevealOnScroll>
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {landingContent.testimonials.map((t, i) => (
          <RevealOnScroll key={t.name} delay={i * 0.06}>
            <GlassCard className="h-full p-6">
              <p className="type-body-md text-[var(--foreground)]">“{t.quote}”</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--mint-dim)] type-caption font-bold text-[var(--mint)]">
                  {t.avatar}
                </div>
                <div>
                  <p className="type-body-sm font-semibold">{t.name}</p>
                  <p className="type-caption text-[var(--foreground-muted)]">{t.role}</p>
                </div>
              </div>
            </GlassCard>
          </RevealOnScroll>
        ))}
      </div>
    </section>
  );
}

export function PricingSection() {
  const [yearly, setYearly] = useState(true);
  const tiers = landingContent.pricing.tiers;

  return (
    <section id="pricing" className="container-esi py-24">
      <RevealOnScroll>
        <SectionHeader
          eyebrow="Pricing"
          title="Start free. Go deeper when you're ready."
          description={landingContent.pricing.billingNote}
        />
      </RevealOnScroll>
      <div className="mt-8 flex justify-center">
        <Tabs value={yearly ? "yearly" : "monthly"} onValueChange={(v) => setYearly(v === "yearly")}>
          <TabsList aria-label="Billing period">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {tiers.map((tier, i) => {
          const price = yearly ? tier.yearly : tier.monthly;
          const period = yearly ? "/yr" : "/mo";
          return (
            <RevealOnScroll key={tier.id} delay={i * 0.05}>
              <GlassCard
                elevated={tier.highlighted}
                className={cn(
                  "flex h-full flex-col p-6",
                  tier.badge === "vip-plus" && "ring-1 ring-[var(--gold)]/50",
                  tier.highlighted && "ring-1 ring-[var(--mint)]/40",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="type-h3">{tier.name}</h3>
                  <Badge variant={tier.badge}>{tier.name}</Badge>
                </div>
                <p className="type-body-sm mt-3 text-[var(--foreground-muted)]">{tier.description}</p>
                <p className="mt-6">
                  <span className="type-data-lg">${price}</span>
                  <span className="type-body-sm text-[var(--foreground-muted)]">{period}</span>
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="type-body-sm text-[var(--foreground-muted)]">
                      <span className="mr-2 text-[var(--mint)]">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="mt-8 w-full" variant={tier.highlighted ? "gradient-glow" : tier.badge === "vip-plus" ? "secondary" : "primary"}>
                  {tier.cta}
                </Button>
              </GlassCard>
            </RevealOnScroll>
          );
        })}
      </div>
    </section>
  );
}

export function FaqSection() {
  const faqJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: landingContent.faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    }),
    [],
  );

  return (
    <section id="faq" className="container-esi py-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <RevealOnScroll>
        <SectionHeader eyebrow="FAQ" title="Straight answers" />
      </RevealOnScroll>
      <RevealOnScroll delay={0.05}>
        <Accordion type="single" collapsible className="mx-auto mt-10 max-w-3xl">
          {landingContent.faq.map((item, i) => (
            <AccordionItem key={item.q} value={`item-${i}`}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </RevealOnScroll>
    </section>
  );
}

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      toast.error("Enter a valid email to join the list.");
      return;
    }
    setStatus("loading");
    await new Promise((r) => setTimeout(r, 700));
    setStatus("success");
    toast.success("You're on the list. Welcome to the calm side of fitness.");
    setEmail("");
  }

  return (
    <section id="newsletter" className="container-esi py-24">
      <RevealOnScroll>
        <GlassCard className="mx-auto max-w-3xl p-8 md:p-10">
          <SectionHeader
            align="left"
            eyebrow="Newsletter"
            title="Weekly clarity, not spam"
            description="One thoughtful note on training, recovery, and product updates."
            className="max-w-none"
          />
          <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row" noValidate>
            <label className="sr-only" htmlFor="newsletter-email">
              Email
            </label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              placeholder="you@example.com"
              className="h-12 flex-1 rounded-[var(--radius-sm)] border border-[var(--surface-glass-border)] bg-[var(--surface-2)] px-4 type-body-md outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              aria-invalid={status === "error"}
            />
            <Button type="submit" loading={status === "loading"} size="lg">
              {status === "success" ? "Subscribed" : "Subscribe"}
            </Button>
          </form>
          {status === "error" ? (
            <p className="type-body-sm mt-3 text-[var(--error)]" role="alert">
              Please enter a valid email address.
            </p>
          ) : null}
        </GlassCard>
      </RevealOnScroll>
    </section>
  );
}

export function FinalCtaSection() {
  const { finalCta } = landingContent;
  return (
    <section className="container-esi pb-28 pt-8">
      <RevealOnScroll>
        <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--surface-glass-border)] bg-gradient-to-br from-[var(--surface-2)] via-[var(--surface-1)] to-[var(--mint-dim)] px-8 py-16 text-center shadow-[var(--shadow-raised)]">
          <h2 className="type-h1">{finalCta.title}</h2>
          <p className="type-body-lg mx-auto mt-4 max-w-xl text-[var(--foreground-muted)]">{finalCta.description}</p>
          <div className="mt-8">
            <Button size="lg" variant="gradient-glow" asChild>
              <a href={finalCta.cta.href}>{finalCta.cta.label}</a>
            </Button>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}
