"use client";

import { Zap, Star, Award, Crown } from "lucide-react";
import Link from "next/link";

const models = [
  {
    name: "Lumia v1",
    description: "Fast, efficient, and reliable for everyday tasks.",
    icon: <Zap className="w-8 h-8 text-blue-500" />,
    link: "#",
  },
  {
    name: "Lumia v1 Max",
    description: "Enhanced version of v1 with more context and power.",
    icon: <Star className="w-8 h-8 text-purple-500" />,
    link: "#",
  },
  {
    name: "Lumia v2",
    description: "Next-gen model with improved reasoning and creativity.",
    icon: <Award className="w-8 h-8 text-green-500" />,
    link: "#",
  },
  {
    name: "Lumia v2 Pro",
    description: "Pro-level model for advanced and complex tasks.",
    icon: <Crown className="w-8 h-8 text-yellow-500" />,
    link: "#",
  },
];

export default function ExploreLumiaPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-blue-700 mb-4">Explore Lumia Models</h1>
        <p className="text-center text-gray-500 mb-10 text-lg">Choose the best AI model for your needs. Each Lumia model is designed for different scenarios and power levels.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {models.map((model) => (
            <div key={model.name} className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="mb-4">{model.icon}</div>
              <h2 className="text-xl font-semibold mb-2 text-blue-800">{model.name}</h2>
              <p className="text-gray-500 mb-6">{model.description}</p>
              <Link href={model.link} className="inline-block px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">Select</Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
} 