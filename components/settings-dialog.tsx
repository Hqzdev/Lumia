'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  X,
  Settings,
  Bell,
  Smile,
  Puzzle,
  Database,
  Shield,
  User,
  ChevronRight,
  HelpCircle,
  Play,
  Globe,
  ChevronDown,
} from 'lucide-react';
import { signOut } from 'next-auth/react';

type SettingsSection =
  | 'general'
  | 'notifications'
  | 'personalization'
  | 'connected-apps'
  | 'data-controls'
  | 'security'
  | 'account';

interface SettingsDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function SettingsDialog(props: SettingsDialogProps) {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>('general');
  const isControlled =
    typeof props.open === 'boolean' && typeof props.onOpenChange === 'function';
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isControlled ? props.open : internalOpen;
  const setIsOpen = isControlled
    ? (open: boolean) => {
        if (props.onOpenChange) props.onOpenChange(open);
      }
    : setInternalOpen;

  // Settings state
  const [settings, setSettings] = useState({
    userInstructions: true,
    saveMemory: true,
    referenceHistory: true,
    theme: 'system',
    language: 'auto',
    conversationLanguage: 'auto',
    voice: 'breeze',
    showSuggestions: true,
    mfaEnabled: false,
    responseNotifications: 'push',
    taskNotifications: 'push-email',
    modelImprovement: true,
  });

  const sidebarItems = [
    { id: 'general' as const, label: 'General', icon: Settings },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'personalization' as const, label: 'Personalization', icon: Smile },
    { id: 'connected-apps' as const, label: 'Connected Apps', icon: Puzzle },
    { id: 'data-controls' as const, label: 'Data Controls', icon: Database },
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: 'account' as const, label: 'Account', icon: User },
  ];

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[90vh] flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-gray-50/50 border-r border-gray-200/50 flex flex-col">
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="hover:bg-gray-100 h-8 w-8"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    isActive ? 'bg-gray-100' : 'hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-900 text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50/30">
          <div className="p-8 max-w-4xl">
            {activeSection === 'general' && (
              <GeneralSettings
                settings={settings}
                updateSetting={updateSetting}
              />
            )}
            {activeSection === 'notifications' && (
              <NotificationSettings
                settings={settings}
                updateSetting={updateSetting}
              />
            )}
            {activeSection === 'personalization' && (
              <PersonalizationSettings
                settings={settings}
                updateSetting={updateSetting}
              />
            )}
            {activeSection === 'connected-apps' && <ConnectedAppsSettings />}
            {activeSection === 'data-controls' && (
              <DataControlsSettings
                settings={settings}
                updateSetting={updateSetting}
              />
            )}
            {activeSection === 'security' && (
              <SecuritySettings
                settings={settings}
                updateSetting={updateSetting}
              />
            )}
            {activeSection === 'account' && <AccountSettings />}
          </div>
        </div>
      </div>
    </div>
  );
}

function GeneralSettings({ settings, updateSetting }: any) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-medium text-gray-900 mb-2">Settings</h3>
        <div className="h-px bg-gray-200 mb-8" />
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <span className="text-base text-gray-900">Theme</span>
          <Select
            value={settings.theme}
            onValueChange={(value) => updateSetting('theme', value)}
            disabled
          >
            <SelectTrigger
              className="w-32 h-9 bg-transparent hover:bg-gray-100 border border-gray-200 text-sm"
              disabled
            >
              <SelectValue />
              <ChevronDown className="size-4" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-base text-gray-900">Language</span>
          <Select
            value={settings.language}
            onValueChange={(value) => updateSetting('language', value)}
            disabled
          >
            <SelectTrigger
              className="w-48 h-9 bg-transparent hover:bg-gray-100 border border-gray-200 text-sm"
              disabled
            >
              <SelectValue />
              <ChevronDown className="size-4" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto-detect</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <div>
            <span className="text-base text-gray-900">
              Conversation Language
            </span>
            <p className="text-sm text-gray-500 mt-1">
              For best results, select the language you primarily speak. If
              it&apos;s not listed, it may still be supported through automatic
              detection.
            </p>
          </div>
          <Select
            value={settings.conversationLanguage}
            onValueChange={(value) =>
              updateSetting('conversationLanguage', value)
            }
            disabled
          >
            <SelectTrigger
              className="w-48 h-9 bg-transparent hover:bg-gray-100 border border-gray-200 text-sm"
              disabled
            >
              <SelectValue />
              <ChevronDown className="size-4" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto-detect</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-base text-gray-900">Voice</span>
            <Play className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Play</span>
          </div>
          <Select
            value={settings.voice}
            onValueChange={(value) => updateSetting('voice', value)}
            disabled
          >
            <SelectTrigger
              className="w-32 h-9 bg-transparent hover:bg-gray-100 border border-gray-200 text-sm"
              disabled
            >
              <SelectValue />
              <ChevronDown className="size-4" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="breeze">Breeze</SelectItem>
              <SelectItem value="cove">Cove</SelectItem>
              <SelectItem value="ember">Ember</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-base text-gray-900">
            Show follow-up suggestions in chats
          </span>
          <Switch
            checked={settings.showSuggestions}
            onCheckedChange={(checked) =>
              updateSetting('showSuggestions', checked)
            }
            className="data-[state=checked]:bg-blue-500"
            disabled
          />
        </div>
      </div>
    </div>
  );
}

function NotificationSettings({ settings, updateSetting }: any) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-medium text-gray-900 mb-2">
          Notifications
        </h3>
        <div className="h-px bg-gray-200 mb-8" />
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-base text-gray-900">Responses</span>
            <Select
              value={settings.responseNotifications}
              onValueChange={(value) =>
                updateSetting('responseNotifications', value)
              }
              disabled
            >
              <SelectTrigger
                className="w-48 h-9 bg-transparent hover:bg-gray-100 border border-gray-200 text-sm"
                disabled
              >
                <SelectValue />
                <ChevronDown className="size-4" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="push">Push notifications</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="both">Push + Email</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-gray-500">
            Get notifications when LumiaAI responds to time-consuming requests,
            such as research or image creation.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-base text-gray-900">Tasks</span>
            <Select
              value={settings.taskNotifications}
              onValueChange={(value) =>
                updateSetting('taskNotifications', value)
              }
              disabled
            >
              <SelectTrigger
                className="w-64 h-9 bg-transparent hover:bg-gray-100 border border-gray-200 text-sm"
                disabled
              >
                <SelectValue />
                <ChevronDown className="size-4" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="push-email">
                  Push notifications, email
                </SelectItem>
                <SelectItem value="push">Push notifications</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-sm text-gray-500">
              Get notifications when tasks you&apos;ve created are updated.
            </p>
            <button
              type="button"
              className="text-sm text-gray-500 underline hover:text-gray-700"
              onClick={() => alert('Manage tasks (stub)')}
              disabled
            >
              Manage tasks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PersonalizationSettings({ settings, updateSetting }: any) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-medium text-gray-900 mb-2">
          Personalization
        </h3>
        <div className="h-px bg-gray-200 mb-8" />
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-base text-gray-900">User instructions</span>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              Enabled
            </span>
            <ChevronRight className="size-4" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-medium text-gray-900">Memory</h4>
            <HelpCircle className="size-4" />
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="saveMemory" className="text-base text-gray-900">
                  Save to memory
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  Allow LumiaAI to save and use memory when responding.
                </p>
              </div>
              <Switch
                id="saveMemory"
                checked={settings.saveMemory}
                onCheckedChange={(checked) =>
                  updateSetting('saveMemory', checked)
                }
                className="data-[state=checked]:bg-blue-500"
                disabled
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label
                  htmlFor="referenceHistory"
                  className="text-base text-gray-900"
                >
                  Reference chat history
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  Allow LumiaAI to reference recent discussions when responding.
                </p>
              </div>
              <Switch
                id="referenceHistory"
                checked={settings.referenceHistory}
                onCheckedChange={(checked) =>
                  updateSetting('referenceHistory', checked)
                }
                className="data-[state=checked]:bg-blue-500"
                disabled
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <span className="text-base text-gray-900">Memory management</span>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-4 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => alert('Memory management (stub)')}
                disabled
              >
                Manage
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConnectedAppsSettings() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-medium text-gray-900 mb-2">
          File Uploads
        </h3>
        <div className="h-px bg-gray-200 mb-4" />
        <p className="text-sm text-gray-500">
          These apps allow you to add files to LumiaAI messages.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
              <Globe className="size-6" />
            </div>
            <div>
              <h4 className="text-base font-medium text-gray-900">
                Google Drive
              </h4>
              <p className="text-sm text-gray-500">
                Upload documents, spreadsheets, presentations and other Google
                files.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-6 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full"
            onClick={() => alert('Connect (stub)')}
            disabled
          >
            Connect
          </Button>
        </div>

        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Globe className="size-6" />
            </div>
            <div>
              <h4 className="text-base font-medium text-gray-900">
                Microsoft OneDrive (Personal)
              </h4>
              <p className="text-sm text-gray-500">
                Upload Microsoft Word, Excel, PowerPoint and other files.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-6 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full"
            onClick={() => alert('Connect (stub)')}
            disabled
          >
            Connect
          </Button>
        </div>

        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center">
              <Globe className="size-6" />
            </div>
            <div>
              <h4 className="text-base font-medium text-gray-900">
                Microsoft OneDrive (Work/School)
              </h4>
              <p className="text-sm text-gray-500">
                Upload Microsoft Word, Excel, PowerPoint and other files,
                including from SharePoint sites.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-6 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full"
            onClick={() => alert('Connect (stub)')}
            disabled
          >
            Connect
          </Button>
        </div>
      </div>
    </div>
  );
}

function DataControlsSettings({ settings, updateSetting }: any) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-medium text-gray-900 mb-2">
          Data Controls
        </h3>
        <div className="h-px bg-gray-200 mb-8" />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-base text-gray-900">
              Improve model for everyone
            </span>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              Enabled
            </span>
            <ChevronRight className="size-4" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-base text-gray-900">Shared links</span>
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-4 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full"
            onClick={() => alert('Shared links (stub)')}
            disabled
          >
            Manage
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-base text-gray-900">Archived chats</span>
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-4 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full"
            onClick={() => alert('Archived chats (stub)')}
            disabled
          >
            Manage
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-base text-gray-900">Archive all chats</span>
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-4 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full"
            onClick={() => alert('Archive all chats (stub)')}
            disabled
          >
            Archive all
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-base text-gray-900">Delete all chats</span>
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-4 bg-white border-red-300 text-red-600 hover:bg-red-50 rounded-full"
            onClick={() => alert('Delete all chats (stub)')}
            disabled
          >
            Delete all
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-base text-gray-900">Export data</span>
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-4 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full"
            onClick={() => alert('Export data (stub)')}
            disabled
          >
            Export
          </Button>
        </div>
      </div>
    </div>
  );
}

function SecuritySettings({ settings, updateSetting }: any) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-medium text-gray-900 mb-2">Security</h3>
        <div className="h-px bg-gray-200 mb-8" />
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="mfaEnabled" className="text-base text-gray-900">
              Multi-factor authentication
            </label>
            <Switch
              id="mfaEnabled"
              checked={settings.mfaEnabled}
              onCheckedChange={(checked) =>
                updateSetting('mfaEnabled', checked)
              }
              className="data-[state=checked]:bg-blue-500"
              disabled
            />
          </div>
          <p className="text-sm text-gray-500">
            Requires additional security verification when logging into the
            system. If you can&apos;t pass this verification, you&apos;ll have
            the option to recover your account via email.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-base text-gray-900">
            Log out of this device
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-4 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full"
            onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
            disabled
          >
            Log out
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-base text-gray-900">
              Log out of all devices
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 bg-white border-red-300 text-red-600 hover:bg-red-50 rounded-full"
              onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
              disabled
            >
              Log out of all
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Log out of all active sessions on all devices, including the current
            session. Logging out of the system on other devices may take up to
            30 minutes.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">
            Secure LumiaAI Login
          </h4>
          <p className="text-sm text-gray-500">
            Log into websites and apps on the internet with reliable LumiaAI
            security.{' '}
            <button
              type="button"
              className="text-gray-500 underline hover:text-gray-700"
              onClick={() => alert('Learn more (stub)')}
              disabled
            >
              Learn more
            </button>
          </p>

          <div className="bg-gray-100 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              You haven&apos;t used LumiaAI to log into any websites or apps
              yet. Once you do, they&apos;ll appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AccountSettings() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-medium text-gray-900 mb-2">Account</h3>
        <div className="h-px bg-gray-200 mb-8" />
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <span className="text-base text-gray-900">Delete account</span>
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-4 bg-white border-red-300 text-red-600 hover:bg-red-50 rounded-full"
            onClick={() => alert('Account deleted (stub)')}
            disabled
          >
            Delete
          </Button>
        </div>

        <div className="space-y-6">
          <h4 className="text-lg font-medium text-gray-900">
            GPT Builder Profile
          </h4>
          <p className="text-sm text-gray-500">
            Customize your builder profile to communicate with users of your
            GPTs. These settings apply to public GPTs.
          </p>

          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Database className="size-8" />
            </div>
            <p className="text-xs text-gray-400 mb-2">Preview</p>
            <h4 className="text-base font-medium text-gray-900 mb-1">
              GPT Builder
            </h4>
            <p className="text-sm text-gray-500">By community builder</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <HelpCircle className="size-5" />
              <div>
                <p className="text-sm text-blue-900 font-medium mb-1">
                  Complete verification to publish GPTs for everyone.
                </p>
                <p className="text-sm text-blue-700">
                  Verify your identity by adding payment information or
                  verifying domain ownership for a shared domain name.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">Links</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="size-4" />
              <span className="text-base text-gray-900">Select domain</span>
            </div>
            <ChevronDown className="size-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
