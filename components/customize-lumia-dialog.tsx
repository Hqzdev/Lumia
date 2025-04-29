"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; 
import { useSession } from 'next-auth/react';

const TRAITS = [
  "Bold",
  "Witty",
  "Honest",
  "Encouraging",
  "Gen Z",
  "Skeptical",
  "Traditional",
  "Visionary",
  "Poetic",
];

const CAPABILITIES = [
  { key: 'web', label: 'Web Search' },
  { key: 'dalle', label: 'DALL-E' },
  { key: 'code', label: 'Code' },
  { key: 'canvas', label: 'Canvas' },
  { key: 'voice', label: 'Advanced Voice Mode' },
];

export function CustomizeLumiaDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [nickname, setNickname] = useState("");
  const [occupation, setOccupation] = useState("");
  const [traits, setTraits] = useState<string[]>([]);
  const [additional, setAdditional] = useState("");
  const [forNewChats, setForNewChats] = useState(true);
  const [capabilities, setCapabilities] = useState({
    web: true,
    dalle: true,
    code: true,
    canvas: true,
    voice: true,
  });
  const [loading, setLoading] = useState(false);

  // Загрузка кастомизации при открытии
  useEffect(() => {
    if (open && userId) {
      setLoading(true);
      console.log('[CustomizeLumiaDialog] Fetching customization for userId:', userId);
      fetch(`/api/user-profile?userId=${userId}`)
        .then(res => {
          console.log('[CustomizeLumiaDialog] GET /api/user-profile status:', res.status);
          return res.json();
        })
        .then(data => {
          console.log('[CustomizeLumiaDialog] Received customization:', data);
          const customization = data.customization || {};
          setNickname(customization.nickname || "");
          setOccupation(customization.occupation || "");
          setTraits(customization.traits || []);
          setAdditional(customization.additional || "");
          setForNewChats(customization.forNewChats !== undefined ? customization.forNewChats : true);
          setCapabilities({
            web: customization.capabilities?.web ?? true,
            dalle: customization.capabilities?.dalle ?? true,
            code: customization.capabilities?.code ?? true,
            canvas: customization.capabilities?.canvas ?? true,
            voice: customization.capabilities?.voice ?? true,
          });
        })
        .catch(err => {
          console.error('[CustomizeLumiaDialog] Error fetching customization:', err);
        })
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userId]);

  const handleSave = async () => {
    if (!userId) {
      console.error('[CustomizeLumiaDialog] No userId, cannot save');
      return;
    }
    setLoading(true);
    const customization = {
      nickname,
      occupation,
      traits,
      additional,
      forNewChats,
      capabilities,
    };
    console.log('[CustomizeLumiaDialog] Saving customization:', customization, 'for userId:', userId);
    // Скрываем окно сразу
    onOpenChange(false);
    try {
      const res = await fetch('/api/user-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, customization }),
      });
      console.log('[CustomizeLumiaDialog] POST /api/user-profile status:', res.status);
      const data = await res.json();
      console.log('[CustomizeLumiaDialog] POST /api/user-profile response:', data);
      if (!res.ok) {
        console.error('[CustomizeLumiaDialog] Error saving customization:', data);
      }
    } catch (err) {
      console.error('[CustomizeLumiaDialog] Network or server error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTrait = (trait: string) => {
    setTraits((prev) => prev.includes(trait) ? prev.filter(t => t !== trait) : [...prev, trait]);
  };

  const toggleCapability = (key: string) => {
    setCapabilities((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className=" border-2 border-gray-200 sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Customize Lumia</DialogTitle>
          <DialogDescription>
            Introduce yourself to get more personalized answers from Lumia.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
          <div>
            <label className="block text-sm font-medium mb-1">How should Lumia address you?</label>
            <input
              type="text"
              className="w-full border border-gray-200 rounded-lg px-3 py-2"
              placeholder="Nickname"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">What is your occupation?</label>
            <input
              type="text"
              className="w-full border border-gray-200 rounded-lg px-3 py-2"
              placeholder="e.g. Student at Waterloo University"
              value={occupation}
              onChange={e => setOccupation(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">What personality traits should Lumia have?</label>
            <div className="flex flex-wrap gap-2">
              {TRAITS.map(trait => (
                <button
                  type="button"
                  key={trait}
                  className={`px-3 py-1 rounded-full border border-gray-200  text-sm ${traits.includes(trait) ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-700 border-gray-200'}`}
                  onClick={() => toggleTrait(trait)}
                >
                  {trait}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Anything else Lumia should know about you?</label>
            <textarea
              className="w-full border border-gray-200  rounded-lg px-3 py-2"
              placeholder="Interests, values, or preferences to remember"
              value={additional}
              onChange={e => setAdditional(e.target.value)}
              rows={3}
            />
          </div>
          {/* Advanced section */}
          <details className="mt-2" open>
  <summary className="font-medium cursor-pointer select-none mb-2">
    Advanced
  </summary>
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden mt-2"
    >
      <div className="mb-1 font-medium">Lumia Capabilities</div>
      <div className="flex flex-wrap gap-2">
        {CAPABILITIES.map(cap => (
          <label key={cap.key} className="flex items-center gap-2 px-3 py-1 rounded-lg border border-gray-200 bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={capabilities[cap.key as keyof typeof capabilities]}
              onChange={() => toggleCapability(cap.key)}
              className="accent-blue-600"
            />
            <span className="text-sm">{cap.label}</span>
          </label>
        ))}
      </div>
    </motion.div>
  </AnimatePresence>
</details>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="for-new-chats"
              checked={forNewChats}
              onChange={e => setForNewChats(e.target.checked)}
              className="accent-blue-600"
            />
            <label htmlFor="for-new-chats" className="text-sm">Enable for new chats</label>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className='bg-blue-600' type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 