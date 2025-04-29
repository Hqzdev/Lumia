"use client"

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, X, Zap, Star, Award, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession, signIn } from "next-auth/react";

const pricingTiers = [
  {
    id: 1,
    name: "Free",
    price: "$0",
    period: "Forever free",
    leads: "Unlimited*",
    popular: false,
    buttonText: "Get Started",
    buttonLink: "/signup",
    icon: "F",
    dbValue: "free",
    features: [
      { name: "Model: Lumia V2 (legacy, less powerful version)", included: true },
      { name: "Unlimited usage* (may be limited during peak hours)", included: true },
      { name: "Slower response speed", included: true },
      { name: "Lower understanding of complex queries", included: true },
      { name: "Sometimes struggles with long tasks", included: true },
      { name: "No image analysis, file uploads, or plugins", included: true },
      { name: "No team features", included: false },
      { name: "No advanced security", included: false },
      { name: "No API integrations", included: false },
      { name: "No priority support", included: false },
    ],
  },
  {
    id: 2,
    name: "Premium",
    price: "$20",
    period: "/month",
    leads: "Unlimited*",
    popular: true,
    buttonText: "Upgrade Now",
    buttonLink: "/signup",
    icon: "P",
    dbValue: "premium",
    features: [
      { name: "Access to all latest models (Lumia V4, GPT-4, etc.)", included: true },
      { name: "Image analysis & file uploads", included: true },
      { name: "Fast response speed, almost no queue", included: true },
      { name: "Best quality for complex tasks (code, business, SEO, essays)", included: true },
      { name: "Hourly request limit: 80 messages per 3 hours", included: true },
      { name: "No team workspace", included: false },
      { name: "No advanced security", included: false },
      { name: "No private model API integration", included: false },
      { name: "Priority support", included: true },
      { name: "Most popular for power users", included: true },
    ],
  },
  {
    id: 3,
    name: "Team",
    price: "$25+",
    period: "/month/user",
    leads: "Unlimited*",
    popular: false,
    buttonText: "Contact Sales",
    buttonLink: "/contact-sales",
    icon: "T",
    dbValue: "team",
    features: [
      { name: "Everything in Premium", included: true },
      { name: "Shared workspace for your team", included: true },
      { name: "Custom folders & project management", included: true },
      { name: "Advanced security settings", included: true },
      { name: "Private model API integration", included: true },
      { name: "Admin controls & permissions", included: true },
      { name: "Best for business & startups", included: true },
      { name: "Custom pricing for large teams", included: true },
      { name: "Dedicated account manager", included: true },
    ],
  },
];

const getIconComponent = (tierName: string) => {
  switch (tierName) {
    case "Free":
      return <Zap className="w-6 h-6 text-green-500" />;
    case "Premium":
      return <Award className="w-6 h-6 text-purple-500" />;
    case "Team":
      return <Crown className="w-6 h-6 text-red-500" />;
    default:
      return null;
  }
};

export function UpgradePlanDialog({ open, onOpenChange, userId }: { open: boolean, onOpenChange: (open: boolean) => void, userId: string }) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { data: session } = useSession();
  const currentSubscription = session?.user?.subscription ?? null;
  const [localSubscription, setLocalSubscription] = useState<string | null>(null);

  // При монтировании: если есть подписка в localStorage — используем её
  useEffect(() => {
    const saved = localStorage.getItem('selectedSubscription');
    if (saved) setLocalSubscription(saved);
  }, []);

  async function handleSelectPlan(planName: string, dbValue: string) {
    console.log('handleSelectPlan called', planName, dbValue);
    setSelectedPlan(planName);
    setLocalSubscription(dbValue);
    localStorage.setItem('selectedSubscription', dbValue);
    try {
      const res = await fetch("/api/upgrade-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, subscription: dbValue }),
      });
      console.log('fetch response:', res);
      const data = await res.json();
      console.log('response data:', data);
      if (res.ok) {
        console.log('Subscription updated, refreshing session...');
        // Можно очистить localStorage, если хотите, чтобы всегда бралась из БД после обновления
        // localStorage.removeItem('selectedSubscription');
        window.location.reload();
      } else {
        console.error("Ошибка при обновлении подписки", data);
      }
    } catch (e) {
      console.error("Ошибка сети при обновлении подписки", e);
    }
  }

  // Для UI используем localSubscription если есть, иначе currentSubscription
  const activeSubscription = localSubscription ?? currentSubscription;

  // Логируем сессию для диагностики
  console.log('session:', session);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-600">Upgrade Plan</DialogTitle>
          <DialogDescription>
            Lumia.ai outperforms human salespeople at 1/10th the cost. Choose the plan that fits your needs.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {pricingTiers.map((tier) => (
            <Card key={tier.id} className={cn("border-blue-100", tier.popular && "border-t-4 border-t-blue-500")}> 
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  {getIconComponent(tier.name)}
                  <CardTitle className="text-blue-600 text-lg">{tier.name}</CardTitle>
                </div>
                <CardDescription className="text-2xl font-bold text-gray-900">{tier.price} <span className="text-base font-normal text-gray-400">{tier.period}</span></CardDescription>
                <div className="text-sm text-gray-400 mt-1">{tier.leads} leads/mo</div>
                {tier.popular && (
                  <div className="mt-2"><span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs font-medium">MOST POPULAR</span></div>
                )}
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      {feature.included ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-400" />
                      )}
                      <span>{feature.name}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={cn(
                    "block w-full text-center py-2 px-4 rounded-lg font-medium transition-colors border",
                    activeSubscription === tier.dbValue
                      ? "bg-white border-blue-600 text-blue-600"
                      : "bg-blue-600 text-white border-transparent hover:bg-blue-700"
                  )}
                  onClick={() => {
                    console.log('Клик по кнопке смены плана', tier.name, tier.dbValue);
                    handleSelectPlan(tier.name, tier.dbValue);
                  }}
                >
                  {activeSubscription === tier.dbValue ? "Current Plan" : tier.buttonText}
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
} 