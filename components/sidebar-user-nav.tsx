'use client';
import { CreditCard } from 'lucide-react';
import type { User } from 'next-auth';
import { useState } from 'react';

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { UpgradePlanDialog } from '@/components/upgrade-plan-dialog';

export function SidebarUserNav({ user }: { user: User }) {
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-12 flex items-center gap-3 px-2"
          onClick={() => setIsUpgradeOpen(true)}
        >
          <CreditCard strokeWidth={2.5} className="size-5 text-blue-600" />
          <div className="flex flex-col items-start">
            <span className="text-sm font-semibold text-blue-600">Update Plan</span>
            <span className="text-xs text-muted-foreground">Get more access to best features</span>
          </div>
        </SidebarMenuButton>
        {user.id && (
          <UpgradePlanDialog open={isUpgradeOpen} onOpenChange={setIsUpgradeOpen} userId={user.id} />
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
