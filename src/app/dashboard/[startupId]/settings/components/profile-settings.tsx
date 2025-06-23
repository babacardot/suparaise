'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useUser } from '@/lib/contexts/user-context'
import { PencilIcon, CheckIcon, CopyIcon } from 'lucide-react'
import { cn } from '@/lib/actions/utils'

export default function ProfileSettings() {
    const { user } = useUser()
    const [isLoading, setIsLoading] = useState(false)
    const [editingField, setEditingField] = useState<string | null>(null)
    const [isCopied, setIsCopied] = useState(false)

    const [formData, setFormData] = useState({
        firstName: user?.user_metadata?.firstName || '',
        lastName: user?.user_metadata?.lastName || '',
        email: user?.email || '',
        phone: user?.user_metadata?.phone || '',
        bio: user?.user_metadata?.bio || '',
        title: user?.user_metadata?.title || '',
        linkedinUrl: user?.user_metadata?.linkedinUrl || '',
        twitterUrl: user?.user_metadata?.twitterUrl || '',
    })

    // Update form data when user changes
    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.user_metadata?.firstName || '',
                lastName: user.user_metadata?.lastName || '',
                email: user.email || '',
                phone: user.user_metadata?.phone || '',
                bio: user.user_metadata?.bio || '',
                title: user.user_metadata?.title || '',
                linkedinUrl: user.user_metadata?.linkedinUrl || '',
                twitterUrl: user.user_metadata?.twitterUrl || '',
            })
        }
    }, [user])

    if (!user) {
        return <div>Loading...</div>
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleFieldEdit = (field: string) => {
        setEditingField(field)
        setTimeout(() => {
            document.getElementById(field)?.focus()
        }, 0)
    }

    const handleFieldSave = async (field: string) => {
        setIsLoading(true)
        try {
            // TODO: Implement save functionality with Supabase
            console.log(`Saving ${field}:`, formData[field as keyof typeof formData])
            setEditingField(null)
            // Show success toast
        } catch (error) {
            console.error(`Error saving ${field}:`, error)
            // Show error toast
        } finally {
            setIsLoading(false)
        }
    }

    const copyUserId = () => {
        if (user.id) {
            navigator.clipboard.writeText(user.id)
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 2000)
        }
    }

    const userInitials = `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="flex-shrink-0 pb-4">
                <h2 className="text-2xl font-semibold">Profile</h2>
                <p className="text-muted-foreground">
                    Update your personal information and preferences.
                </p>
            </div>

            <Separator className="flex-shrink-0" />

            <div className="flex-1 overflow-auto pt-6 max-h-[62vh] hide-scrollbar">
                <div className="space-y-6 pr-2">
                    {/* Profile Picture */}
                    <div className="flex items-center space-x-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={user.user_metadata?.avatar_url} />
                            <AvatarFallback className="text-lg">{userInitials}</AvatarFallback>
                        </Avatar>
                        <div className="space-x-2">
                            <Button variant="outline" size="sm" className="rounded-sm">
                                Update
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive">
                                Remove
                            </Button>
                        </div>
                    </div>

                    {/* Personal Information */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First name</Label>
                            <div className="relative">
                                <Input
                                    id="firstName"
                                    value={formData.firstName}
                                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                                    className={cn("rounded-sm pr-8", editingField !== 'firstName' && "bg-muted")}
                                    readOnly={editingField !== 'firstName'}
                                    placeholder="Enter your first name"
                                />
                                {editingField !== 'firstName' ? (
                                    <button
                                        onClick={() => handleFieldEdit('firstName')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                                    >
                                        <PencilIcon className="h-3 w-3" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleFieldSave('firstName')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-600"
                                        disabled={isLoading}
                                    >
                                        <CheckIcon className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last name</Label>
                            <div className="relative">
                                <Input
                                    id="lastName"
                                    value={formData.lastName}
                                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                                    className={cn("rounded-sm pr-8", editingField !== 'lastName' && "bg-muted")}
                                    readOnly={editingField !== 'lastName'}
                                    placeholder="Enter your last name"
                                />
                                {editingField !== 'lastName' ? (
                                    <button
                                        onClick={() => handleFieldEdit('lastName')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                                    >
                                        <PencilIcon className="h-3 w-3" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleFieldSave('lastName')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-600"
                                        disabled={isLoading}
                                    >
                                        <CheckIcon className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className={cn("rounded-sm pr-8", editingField !== 'email' && "bg-muted")}
                                    readOnly={editingField !== 'email'}
                                    placeholder="Enter your email"
                                />
                                {editingField !== 'email' ? (
                                    <button
                                        onClick={() => handleFieldEdit('email')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                                    >
                                        <PencilIcon className="h-3 w-3" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleFieldSave('email')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-600"
                                        disabled={isLoading}
                                    >
                                        <CheckIcon className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <div className="relative">
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    className={cn("rounded-sm pr-8", editingField !== 'phone' && "bg-muted")}
                                    readOnly={editingField !== 'phone'}
                                    placeholder="Enter your phone number"
                                />
                                {editingField !== 'phone' ? (
                                    <button
                                        onClick={() => handleFieldEdit('phone')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                                    >
                                        <PencilIcon className="h-3 w-3" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleFieldSave('phone')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-600"
                                        disabled={isLoading}
                                    >
                                        <CheckIcon className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="title">Role</Label>
                            <div className="relative">
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    className={cn("rounded-sm pr-8", editingField !== 'title' && "bg-muted")}
                                    readOnly={editingField !== 'title'}
                                    placeholder="e.g., CEO, Founder, CTO"
                                />
                                {editingField !== 'title' ? (
                                    <button
                                        onClick={() => handleFieldEdit('title')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                                    >
                                        <PencilIcon className="h-3 w-3" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleFieldSave('title')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-600"
                                        disabled={isLoading}
                                    >
                                        <CheckIcon className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="user-id">User ID</Label>
                            <div className="flex">
                                <Input
                                    id="user-id"
                                    value={user.id}
                                    readOnly
                                    className="rounded-l-sm rounded-r-none bg-muted"
                                />
                                <Button
                                    variant={isCopied ? "default" : "outline"}
                                    className={cn(
                                        "rounded-r-sm rounded-l-none h-full",
                                        isCopied && "bg-blue-500 hover:bg-blue-600"
                                    )}
                                    onClick={copyUserId}
                                >
                                    {isCopied ? (
                                        "Copied"
                                    ) : (
                                        <>
                                            <CopyIcon className="h-4 w-4 mr-2" />
                                            Copy
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <div className="relative">
                            <Textarea
                                id="bio"
                                value={formData.bio}
                                onChange={(e) => handleInputChange('bio', e.target.value)}
                                className={cn("rounded-sm pr-8 min-h-[80px]", editingField !== 'bio' && "bg-muted")}
                                readOnly={editingField !== 'bio'}
                                placeholder="Tell us about yourself..."
                                rows={3}
                            />
                            {editingField !== 'bio' ? (
                                <button
                                    onClick={() => handleFieldEdit('bio')}
                                    className="absolute right-2 top-2 text-blue-500 hover:text-blue-600"
                                >
                                    <PencilIcon className="h-3 w-3" />
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleFieldSave('bio')}
                                    className="absolute right-2 top-2 text-green-500 hover:text-green-600"
                                    disabled={isLoading}
                                >
                                    <CheckIcon className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Socials</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="linkedinUrl">LinkedIn</Label>
                                <div className="relative">
                                    <Input
                                        id="linkedinUrl"
                                        value={formData.linkedinUrl}
                                        onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                                        className={cn("rounded-sm pr-8", editingField !== 'linkedinUrl' && "bg-muted")}
                                        readOnly={editingField !== 'linkedinUrl'}
                                        placeholder="https://linkedin.com/in/yourprofile"
                                    />
                                    {editingField !== 'linkedinUrl' ? (
                                        <button
                                            onClick={() => handleFieldEdit('linkedinUrl')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                                        >
                                            <PencilIcon className="h-3 w-3" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleFieldSave('linkedinUrl')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-600"
                                            disabled={isLoading}
                                        >
                                            <CheckIcon className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="twitterUrl">Twitter</Label>
                                <div className="relative">
                                    <Input
                                        id="twitterUrl"
                                        value={formData.twitterUrl}
                                        onChange={(e) => handleInputChange('twitterUrl', e.target.value)}
                                        className={cn("rounded-sm pr-8", editingField !== 'twitterUrl' && "bg-muted")}
                                        readOnly={editingField !== 'twitterUrl'}
                                        placeholder="https://twitter.com/yourusername"
                                    />
                                    {editingField !== 'twitterUrl' ? (
                                        <button
                                            onClick={() => handleFieldEdit('twitterUrl')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                                        >
                                            <PencilIcon className="h-3 w-3" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleFieldSave('twitterUrl')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-600"
                                            disabled={isLoading}
                                        >
                                            <CheckIcon className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 