'use client'

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  User,
  Key,
  Lock,
  LogOut,
  Trash2,
  Copy,
  RefreshCw,
  Github,
  Mail,
  ChromeIcon as Google,
  LifeBuoy,
  AlertTriangle,
  Check,
} from "lucide-react"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [apiKey, setApiKey] = useState("sk_Luren_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6")
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKeyCopied, setApiKeyCopied] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isSupportChatOpen, setIsSupportChatOpen] = useState(false)

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
    setApiKeyCopied(true)
    setTimeout(() => setApiKeyCopied(false), 2000)
  }

  const handleRegenerateApiKey = () => {
    setApiKey(`sk_Luren_${Math.random().toString(36).substring(2, 15)}`)
    setShowApiKey(true)
  }

  const handlePasswordChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(false)
    onOpenChange(false)
  }

  const maskApiKey = (key: string) => {
    return showApiKey ? key : `${key.substring(0, 8)}${"•".repeat(24)}${key.substring(key.length - 4)}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-600">Account Settings</DialogTitle>
          <DialogDescription>Manage your account settings, security, and API access.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="security" className="mt-4">
          <TabsList className="grid grid-cols-4 mb-6 bg-blue-50 rounded-[20px] p-1">
            <TabsTrigger
              value="security"
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-[16px]"
            >
              <Lock className="size-4" />
              Security
            </TabsTrigger>
            <TabsTrigger
              value="connections"
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-[16px]"
            >
              <User className="size-4" />
              Connections
            </TabsTrigger>
            <TabsTrigger
              value="api"
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-[16px]"
            >
              <Key className="size-4" />
              API Access
            </TabsTrigger>
            <TabsTrigger
              value="support"
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-[16px]"
            >
              <LifeBuoy className="size-4" />
              Support
            </TabsTrigger>
          </TabsList>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="grid gap-6">
              <Card className="border-blue-100">
                <CardHeader className="border-b border-blue-50">
                  <CardTitle className="text-blue-600">Change Password</CardTitle>
                  <CardDescription>Update your password to keep your account secure.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
                        required
                        className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                        required
                        className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                        required
                        className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-0 h-auto font-medium"
                      variant="ghost"
                    >
                      Update Password
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-red-100">
                <CardHeader className="border-b border-red-50">
                  <CardTitle className="text-red-600">Danger Zone</CardTitle>
                  <CardDescription>Actions that can&apos;t be undone or require caution.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Log out of all devices</h4>
                      <p className="text-sm text-gray-500">This will log you out from all devices except this one.</p>
                    </div>
                    <Button
                      variant="ghost"
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-0 h-auto font-medium"
                    >
                      <LogOut className="size-4 mr-2" />
                      Log Out All
                    </Button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Delete account</h4>
                      <p className="text-sm text-gray-500">Permanently delete your account and all your data.</p>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 p-0 h-auto font-medium"
                    >
                      <Trash2 className="size-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Connections Tab */}
          <TabsContent value="connections">
            <Card className="border-blue-100">
              <CardHeader className="border-b border-blue-50">
                <CardTitle className="text-blue-600">Connected Accounts</CardTitle>
                <CardDescription>Manage accounts that are connected to your Luren AI account.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="flex justify-between items-center py-3 border-b border-blue-50">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-full">
                      <Mail className="size-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Email</h4>
                      <p className="text-sm text-gray-500">user@example.com</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-200">Primary</Badge>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-blue-50">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-full">
                      <Google className="size-5 text-red-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Google</h4>
                      <p className="text-sm text-gray-500">Connected</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-0 h-auto font-medium"
                  >
                    Disconnect
                  </Button>
                </div>

                <div className="flex justify-between items-center py-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-full">
                      <Github className="size-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">GitHub</h4>
                      <p className="text-sm text-gray-500">Not connected</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-0 h-auto font-medium"
                  >
                    Connect
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Access Tab */}
          <TabsContent value="api">
            <Card className="border-blue-100">
              <CardHeader className="border-b border-blue-50">
                <CardTitle className="text-blue-600">API Key</CardTitle>
                <CardDescription>Use this key to access Luren AI models via API.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                  <AlertTriangle className="size-4" />
                  <AlertTitle>Keep your <span className="text-blue-600">API</span> key secure</AlertTitle>
                  <AlertDescription>
                    Your API key has access to your account. Never share it publicly or in client-side code.
                  </AlertDescription>
                </Alert>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-0 h-auto font-medium"
                    onClick={() => window.open('https://luren-documentation.vercel.app/apikey', '_blank')}
                  >
                    <RefreshCw className="size-4 mr-2" />
                    Create Your Own New Key
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start pt-4 border-t border-blue-50">
                <h4 className="font-medium mb-2 text-blue-600">API Usage</h4>
                <div className="w-full bg-blue-100 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full w-[45%]"></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">45% of your monthly API quota used (4,500/10,000 requests)</p>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-blue-100">
                <CardHeader className="border-b border-blue-50">
                  <CardTitle className="text-blue-600">Contact Support</CardTitle>
                  <CardDescription>Get help from our support team.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <p className="text-sm">
                    Our support team is available 24/7 to help you with any issues or questions you may have.
                  </p>
                  <Button
                    variant="ghost"
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-0 h-auto font-medium"
                    onClick={() => window.open('https://support-lurenai.vercel.app', '_blank')}
                  >
                    Contact Support
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-blue-100">
                <CardHeader className="border-b border-blue-50">
                  <CardTitle className="text-blue-600">Documentation</CardTitle>
                  <CardDescription>Learn how to use Luren AI effectively.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <p className="text-sm">
                    Check our comprehensive documentation to learn about all features and capabilities.
                  </p>
                  <Button
                    variant="ghost"
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-0 h-auto font-medium"
                    onClick={() => window.open('https://luren-documentation.vercel.app', '_blank')}
                  >
                    View Documentation
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Delete Account Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h3 className="text-xl font-bold text-red-600 mb-2">Delete Account</h3>
              <p className="mb-4">
                Are you sure you want to delete your account? This action cannot be undone and all your data will be
                permanently lost.
              </p>
              <div className="flex justify-end gap-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-0 h-auto font-medium"
                >
                  Cancel
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleDeleteAccount}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50 p-0 h-auto font-medium"
                >
                  Yes, Delete My Account
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 