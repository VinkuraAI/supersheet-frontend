'use client'

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, Mail, Bell, Moon, Shield, LogOut } from "lucide-react"
import { useUser } from "@/lib/user-context"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

export default function UserSettingsPage() {
    const router = useRouter()
    const { user } = useUser()

    const getInitials = (name: string | undefined) => {
        if (!name) return 'U';
        const names = name.split(' ');
        if (names.length > 1) {
            return names[0][0] + names[names.length - 1][0];
        }
        return name.substring(0, 2);
    };

    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-slate-100"
                            onClick={() => router.push('/dashboard')}
                        >
                            <ArrowLeft className="h-5 w-5 text-slate-600" />
                        </Button>
                        <h1 className="text-xl font-bold text-slate-800">Settings</h1>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
                {/* Profile Section */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                >
                    <div className="p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        <div className="relative group">
                            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                                <AvatarImage src={user?.avatar || undefined} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl font-bold">
                                    {getInitials(user?.fullName)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                <span className="text-white text-xs font-medium">Change</span>
                            </div>
                        </div>
                        <div className="flex-1 space-y-1">
                            <h2 className="text-2xl font-bold text-slate-900">{user?.fullName || 'User'}</h2>
                            <p className="text-slate-500 flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                {user?.email}
                            </p>
                            <div className="pt-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Free Plan
                                </span>
                            </div>
                        </div>
                        <Button variant="outline" className="shrink-0">
                            Edit Profile
                        </Button>
                    </div>
                </motion.section>

                {/* Settings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Preferences */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                <Bell className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">Notifications</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <label className="text-sm font-medium text-slate-900">Email Notifications</label>
                                    <p className="text-xs text-slate-500">Receive updates about your workspaces</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <label className="text-sm font-medium text-slate-900">Marketing Emails</label>
                                    <p className="text-xs text-slate-500">Receive news and special offers</p>
                                </div>
                                <Switch />
                            </div>
                        </div>
                    </motion.section>

                    {/* Appearance */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                                <Moon className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">Appearance</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <label className="text-sm font-medium text-slate-900">Dark Mode</label>
                                    <p className="text-xs text-slate-500">Switch between light and dark themes</p>
                                </div>
                                <Switch disabled />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <label className="text-sm font-medium text-slate-900">Compact Mode</label>
                                    <p className="text-xs text-slate-500">Reduce whitespace in the interface</p>
                                </div>
                                <Switch />
                            </div>
                        </div>
                    </motion.section>

                    {/* Security */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 md:col-span-2"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                                <Shield className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">Security</h3>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="font-medium text-slate-900">Password</p>
                                <p className="text-sm text-slate-500">Last changed 3 months ago</p>
                            </div>
                            <Button variant="outline">Change Password</Button>
                        </div>
                    </motion.section>
                </div>

                {/* Danger Zone */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="border border-red-200 rounded-2xl p-6 bg-red-50/30"
                >
                    <h3 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="font-medium text-red-900">Delete Account</p>
                            <p className="text-sm text-red-700">Permanently delete your account and all data</p>
                        </div>
                        <Button variant="destructive">Delete Account</Button>
                    </div>
                </motion.section>
            </main>
        </div>
    )
}
