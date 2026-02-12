import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Brain, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button2 } from "../component/UI/Button2";

type Plan = {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  badge?: string;
  cta: string;
  features: string[];
};

const plans: Plan[] = [
  {
    name: "Starter",
    description: "For students and solo creators building a personal second brain.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    cta: "Start Free",
    features: [
      "Up to 100 saved items",
      "Basic AI chat over saved content",
      "Only simple Chats",
      "Community support"
    ]
  },
  {
    name: "Pro",
    description: "For professionals who need deeper memory and faster research workflows.",
    monthlyPrice: 19,
    yearlyPrice: 15,
    badge: "Most Popular",
    cta: "Upgrade to Pro",
    features: [
      "Unlimited saved items",
      "Chat with Links, PDFs, Docs",
      "YouTube and media ingestion",
      "Priority processing and support",
      "Export and share collections"
    ]
  },
  {
    name: "Team",
    description: "For teams that need a shared knowledge system with control and governance.",
    monthlyPrice: 49,
    yearlyPrice: 39,
    cta: "Contact Sales",
    features: [
      "Everything in Pro",
      "Shared workspaces",
      "Role-based access",
      "Usage analytics",
      "Dedicated onboarding"
    ]
  }
];

const faqs = [
  {
    q: "Can I change plans later?",
    a: "Yes. You can upgrade or downgrade anytime from your account settings."
  },
  {
    q: "Do you offer a free trial for paid plans?",
    a: "Yes. Pro and Team include a 14-day free trial with full features."
  },
  {
    q: "What happens if I exceed the Starter limits?",
    a: "Your existing content stays safe. You will be prompted to upgrade before adding more items."
  },
  {
    q: "Is there a discount for annual billing?",
    a: "Yes. Annual billing reduces the effective monthly cost by about 20%."
  }
];

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="container px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 font-semibold cursor-pointer"
          >
            <div className="p-1.5 rounded-lg bg-primary">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            BrainBox
          </button>
          <div className="flex items-center gap-3">
            <Button2 variant="ghost" size="sm" onClick={() => navigate("/signin")}>
              Log in
            </Button2>
            <Button2 variant="default" size="sm" onClick={() => navigate("/signup")}>
              Get Started
            </Button2>
          </div>
        </div>
      </div>

      <main className="container px-4 py-16 md:py-24">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Pricing that scales with your <span className="text-primary">knowledge</span>
          </h1>
          <p className="mt-5 text-muted-foreground text-lg">
            Start free, then upgrade when your second brain becomes mission critical.
          </p>

          <div className="mt-10 inline-flex items-center rounded-xl border border-border p-1 bg-card">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !isYearly ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isYearly ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              Yearly
            </button>
            <span className="ml-2 mr-2 text-xs text-primary font-semibold">Save 20%</span>
          </div>
        </motion.section>

        <section className="mt-14 grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, idx) => {
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const isPopular = plan.badge === "Most Popular";

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className={`rounded-2xl border p-7 bg-card relative ${
                  isPopular ? "border-primary shadow-lg shadow-primary/10" : "border-border"
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-6 text-xs font-semibold bg-primary text-primary-foreground px-3 py-1 rounded-full">
                    {plan.badge}
                  </span>
                )}

                <h3 className="text-2xl font-semibold">{plan.name}</h3>
                <p className="text-muted-foreground mt-2 min-h-12">{plan.description}</p>

                <div className="mt-6 flex items-end gap-1">
                  <span className="text-4xl font-bold">${price}</span>
                  <span className="text-muted-foreground mb-1">/month</span>
                </div>
                {isYearly && plan.yearlyPrice > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">Billed annually</p>
                )}

                <Button2
                  variant={isPopular ? "default" : "outline"}
                  size="lg"
                  className="w-full mt-6"
                  onClick={() => navigate("/signup")}
                >
                  {plan.cta}
                </Button2>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </section>

        <section className="mt-20 max-w-5xl mx-auto rounded-2xl border border-border bg-surface/60 p-8 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold text-center">Feature Comparison</h2>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3">Capability</th>
                  <th className="text-left py-3">Starter</th>
                  <th className="text-left py-3">Pro</th>
                  <th className="text-left py-3">Team</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/70">
                  <td className="py-3">Saved items</td>
                  <td className="py-3">100</td>
                  <td className="py-3">Unlimited</td>
                  <td className="py-3">Unlimited</td>
                </tr>
                <tr className="border-b border-border/70">
                  <td className="py-3">Semantic search</td>
                  <td className="py-3">Basic</td>
                  <td className="py-3">Advanced</td>
                  <td className="py-3">Advanced</td>
                </tr>
                <tr className="border-b border-border/70">
                  <td className="py-3">Workspace sharing</td>
                  <td className="py-3">-</td>
                  <td className="py-3">Limited</td>
                  <td className="py-3">Full</td>
                </tr>
                <tr>
                  <td className="py-3">Support</td>
                  <td className="py-3">Community</td>
                  <td className="py-3">Priority</td>
                  <td className="py-3">Dedicated</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center">Frequently Asked Questions</h2>
          <div className="mt-8 grid md:grid-cols-2 gap-4">
            {faqs.map((item) => (
              <div key={item.q} className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold">{item.q}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20 text-center rounded-2xl border border-primary/20 bg-primary/5 p-8 md:p-12 max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold">Build your second brain today</h2>
          <p className="mt-4 text-muted-foreground">
            Get started in minutes and turn scattered content into connected knowledge.
          </p>
          <div className="mt-7 flex items-center justify-center gap-3 flex-wrap">
            <Button2 variant="hero" size="lg" onClick={() => navigate("/signup")}>
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Button2>
            <Button2 variant="heroOutline" size="lg" onClick={() => navigate("/")}>
              Back to Home
            </Button2>
          </div>
        </section>
      </main>
    </div>
  );
}
