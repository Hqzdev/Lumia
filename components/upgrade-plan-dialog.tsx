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
    leads: "100",
    popular: false,
    buttonText: "Get Started",
    buttonLink: "/signup",
    icon: "F",
    dbValue: "free",
    features: [
      { name: "Free Lumia addresses on a shared domain", included: true },
      { name: "275+ million leads available", included: true },
      { name: "AI-powered messaging and personalization", included: true },
      { name: "AI-powered with CERT", included: false },
      { name: "Email setup by Lumia", included: false },
      { name: "Upload leads via API/csv or a CSV file", included: false },
      { name: "Personalized video landing pages", included: false },
    ],
  },
  {
    id: 2,
    name: "Starter",
    price: "$12",
    period: "/month",
    leads: "300",
    popular: false,
    buttonText: "Get Started",
    buttonLink: "/signup",
    icon: "S",
    dbValue: "starter",
    features: [
      { name: "Free Lumia addresses on a shared domain", included: true },
      { name: "275+ million leads available", included: true },
      { name: "AI-powered messaging and personalization", included: true },
      { name: "AI-powered with CERT", included: true },
      { name: "Email setup by Lumia", included: false },
      { name: "Upload leads via API/csv or a CSV file", included: true },
      { name: "Personalized video landing pages", included: false },
    ],
  },
  {
    id: 3,
    name: "Starter Plus",
    price: "$16",
    period: "/month",
    leads: "1,000",
    popular: true,
    buttonText: "Get Started",
    buttonLink: "/signup",
    icon: "S+",
    dbValue: "starter_plus",
    features: [
      { name: "Free Lumia addresses on a shared domain", included: true },
      { name: "275+ million leads available", included: true },
      { name: "AI-powered messaging and personalization", included: true },
      { name: "AI-powered with CERT", included: true },
      { name: "Email setup by Lumia", included: true },
      { name: "Upload leads via API/csv or a CSV file", included: true },
      { name: "Personalized video landing pages", included: true },
    ],
  },
  {
    id: 4,
    name: "Premium",
    price: "$25",
    period: "/month",
    leads: "2,500",
    popular: false,
    buttonText: "Get Started",
    buttonLink: "/signup",
    icon: "P",
    dbValue: "premium",
    features: [
      { name: "Free Lumia addresses on a shared domain", included: true },
      { name: "275+ million leads available", included: true },
      { name: "AI-powered messaging and personalization", included: true },
      { name: "AI-powered with CERT", included: true },
      { name: "Email setup by Lumia", included: true },
      { name: "Upload leads via API/csv or a CSV file", included: true },
      { name: "Personalized video landing pages", included: true },
      { name: "Advanced analytics dashboard", included: true },
    ],
  },
  {
    id: 5,
    name: "Ultimate",
    price: "$50",
    period: "/month",
    leads: "5,000",
    popular: false,
    buttonText: "Get Started",
    buttonLink: "/signup",
    icon: "U",
    dbValue: "ultimate",
    features: [
      { name: "Free Lumia addresses on a shared domain", included: true },
      { name: "275+ million leads available", included: true },
      { name: "AI-powered messaging and personalization", included: true },
      { name: "AI-powered with CERT", included: true },
      { name: "Email setup by Lumia", included: true },
      { name: "Upload leads via API/csv or a CSV file", included: true },
      { name: "Personalized video landing pages", included: true },
      { name: "Advanced analytics dashboard", included: true },
      { name: "Dedicated account manager", included: true },
      { name: "Custom integrations", included: true },
    ],
  },
];

const getIconComponent = (tierName: string) => {
  switch (tierName) {
    case "Starter":
      return <Zap className="w-6 h-6 text-green-500" />;
    case "Starter Plus":
      return <Star className="w-6 h-6 text-yellow-500" />;
    case "Premium":
      return <Award className="w-6 h-6 text-purple-500" />;
    case "Ultimate":
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

  // При монтировании: если нет подписки в session, пробуем взять из localStorage
  useEffect(() => {
    if (!session?.user?.subscription) {
      const saved = localStorage.getItem('selectedSubscription');
      if (saved) setLocalSubscription(saved);
    }
  }, [session?.user?.subscription]);

  async function handleSelectPlan(planName: string, dbValue: string) {
    setSelectedPlan(planName);
    setLocalSubscription(dbValue);
    localStorage.setItem('selectedSubscription', dbValue);
    console.log("Вы выбрали подписку:", planName);
    console.log("userId:", userId);
    console.log("subscription (отправляется в БД):", dbValue);
    try {
      const res = await fetch("/api/upgrade-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, subscription: dbValue }),
      });
      const data = await res.json();
      console.log("Ответ сервера:", data);
      if (res.ok) {
        console.log("Подписка успешно обновлена в БД");
        // Принудительно обновляем сессию через signIn
        if (session?.user?.nickname) {
          await signIn("credentials", {
            redirect: false,
            nickname: session.user.nickname,
            password: "__force_refresh__"
          });
        } else {
          window.location.reload();
        }
      } else {
        console.error("Ошибка при обновлении подписки", data);
      }
    } catch (e) {
      console.error("Ошибка сети при обновлении подписки", e);
    }
  }

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
                    (localSubscription ?? currentSubscription) === tier.dbValue
                      ? "bg-white border-blue-600 text-blue-600"
                      : "bg-blue-600 text-white border-transparent hover:bg-blue-700"
                  )}
                  onClick={() => handleSelectPlan(tier.name, tier.dbValue)}
                >
                  {(localSubscription ?? currentSubscription) === tier.dbValue ? "Current Plan" : tier.buttonText}
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
} 