'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useUser } from '@/lib/contexts/user-context'
import { useToast } from '@/lib/hooks/use-toast'
import { PencilIcon, CheckIcon, CopyIcon, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/actions/utils'

// Import founder role constants from onboarding types
import {
  FOUNDER_ROLES,
  FounderRole,
} from '@/components/onboarding/onboarding-types'

// Helper function to format field names for display
const formatFieldName = (fieldName: string): string => {
  const fieldLabels: Record<string, string> = {
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email',
    phone: 'Phone',
    bio: 'Bio',
    role: 'Role',
    linkedin: 'LinkedIn',
    githubUrl: 'GitHub',
    personalWebsiteUrl: 'Personal website',
  }
  return fieldLabels[fieldName] || fieldName
}

export default function ProfileSettings() {
  const { user, supabase, currentStartupId } = useUser()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    role: 'Founder' as FounderRole,
    linkedin: '',
    githubUrl: '',
    personalWebsiteUrl: '',
  })

  // Fetch founder data when component mounts or startup changes
  useEffect(() => {
    const fetchFounderData = async () => {
      if (!user || !currentStartupId) return

      setDataLoading(true)
      try {
        const { data, error } = await supabase.rpc('get_user_founder_profile', {
          p_user_id: user.id,
          p_startup_id: currentStartupId,
        })

        if (error) throw error

        if (data && Object.keys(data).length > 0 && !data.error) {
          setFormData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || '',
            bio: data.bio || '',
            role: data.role || 'Founder',
            linkedin: data.linkedin || '',
            githubUrl: data.githubUrl || '',
            personalWebsiteUrl: data.personalWebsiteUrl || '',
          })
        } else {
          // Fallback to user metadata if no founder data found
          setFormData({
            firstName: user.user_metadata?.firstName || '',
            lastName: user.user_metadata?.lastName || '',
            email: user.email || '',
            phone: user.user_metadata?.phone || '',
            bio: user.user_metadata?.bio || '',
            role: user.user_metadata?.role || 'Founder',
            linkedin: user.user_metadata?.linkedin || '',
            githubUrl: user.user_metadata?.githubUrl || '',
            personalWebsiteUrl: user.user_metadata?.personalWebsiteUrl || '',
          })
        }
      } catch (error) {
        console.error('Error fetching founder data:', error)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load profile data.',
        })
      } finally {
        setDataLoading(false)
      }
    }

    fetchFounderData()
  }, [user, currentStartupId, supabase, toast])

  if (!user) {
    return <div>Loading...</div>
  }

  if (dataLoading) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex-shrink-0 pb-4">
          <h2 className="text-2xl font-semibold -mt-2 mb-2">Profile</h2>
          <p className="text-muted-foreground">
            Manage your founder profile and account preferences.
          </p>
        </div>
        <Separator className="flex-shrink-0" />
      </div>
    )
  }

  const handleInputChange = (field: string, value: string | FounderRole) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFieldEdit = (field: string) => {
    setEditingField(field)
    setTimeout(() => {
      document.getElementById(field)?.focus()
    }, 0)
  }

  const handleFieldSave = async (field: string) => {
    if (!currentStartupId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No startup selected.',
      })
      return
    }

    setIsLoading(true)
    try {
      const updateData = { [field]: formData[field as keyof typeof formData] }

      const { data, error } = await supabase.rpc(
        'update_user_founder_profile',
        {
          p_user_id: user.id,
          p_startup_id: currentStartupId,
          p_data: updateData,
        },
      )

      if (error) throw error

      if (data?.error) {
        throw new Error(data.error)
      }

      setEditingField(null)
      toast({
        title: 'Profile updated',
        description: `${formatFieldName(field)} has been updated successfully.`,
      })
    } catch (error) {
      console.error(`Error saving ${field}:`, error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to update ${formatFieldName(field)}. Please try again.`,
      })
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

  const userInitials =
    `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase() ||
    user.email?.charAt(0).toUpperCase() ||
    'U'

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 pb-4">
        <h2 className="text-2xl font-semibold -mt-2 mb-2">Profile</h2>
        <p className="text-muted-foreground">
          Manage your founder profile and account preferences.
        </p>
      </div>

      <Separator className="flex-shrink-0" />

      <div className="flex-1 overflow-auto pt-6 max-h-[60.5vh] hide-scrollbar">
        <div className="space-y-6 pr-2">
          {/* Profile Picture */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="text-lg">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-800 dark:hover:text-green-200 border border-green-200 dark:border-green-800 rounded-sm"
              >
                Update
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900/40 hover:text-pink-800 dark:hover:text-pink-200 border border-pink-200 dark:border-pink-800 rounded-sm"
              >
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
                  onChange={(e) =>
                    handleInputChange('firstName', e.target.value)
                  }
                  className={cn(
                    'rounded-sm pr-8',
                    editingField !== 'firstName' && 'bg-muted',
                  )}
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
                  onChange={(e) =>
                    handleInputChange('lastName', e.target.value)
                  }
                  className={cn(
                    'rounded-sm pr-8',
                    editingField !== 'lastName' && 'bg-muted',
                  )}
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
                  className={cn(
                    'rounded-sm pr-8',
                    editingField !== 'email' && 'bg-muted',
                  )}
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
                  className={cn(
                    'rounded-sm pr-8',
                    editingField !== 'phone' && 'bg-muted',
                  )}
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
              <Label htmlFor="role">Role</Label>
              <div className="relative">
                <select
                  id="role"
                  className="w-full pl-3 pr-8 py-2 border border-input rounded-sm appearance-none bg-transparent text-sm"
                  value={formData.role}
                  onChange={async (e) => {
                    const newValue = e.target.value as FounderRole
                    handleInputChange('role', newValue)
                    await handleFieldSave('role')
                  }}
                  disabled={isLoading}
                >
                  {FOUNDER_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
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
                  variant={isCopied ? 'default' : 'outline'}
                  className={cn(
                    'rounded-r-sm rounded-l-none h-9 w-24',
                    isCopied && 'bg-blue-500 hover:bg-blue-600',
                  )}
                  onClick={copyUserId}
                >
                  {isCopied ? (
                    'Copied'
                  ) : (
                    <>
                      <CopyIcon className="h-3 w-3 mr-2" />
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
                className={cn(
                  'rounded-sm pr-8 min-h-[80px]',
                  editingField !== 'bio' && 'bg-muted',
                )}
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
                <Label htmlFor="linkedin">LinkedIn</Label>
                <div className="relative">
                  <Input
                    id="linkedin"
                    value={formData.linkedin}
                    onChange={(e) =>
                      handleInputChange('linkedin', e.target.value)
                    }
                    className={cn(
                      'rounded-sm pr-8',
                      editingField !== 'linkedin' && 'bg-muted',
                    )}
                    readOnly={editingField !== 'linkedin'}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                  {editingField !== 'linkedin' ? (
                    <button
                      onClick={() => handleFieldEdit('linkedin')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                    >
                      <PencilIcon className="h-3 w-3" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleFieldSave('linkedin')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-600"
                      disabled={isLoading}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="githubUrl">GitHub</Label>
                <div className="relative">
                  <Input
                    id="githubUrl"
                    value={formData.githubUrl}
                    onChange={(e) =>
                      handleInputChange('githubUrl', e.target.value)
                    }
                    className={cn(
                      'rounded-sm pr-8',
                      editingField !== 'githubUrl' && 'bg-muted',
                    )}
                    readOnly={editingField !== 'githubUrl'}
                    placeholder="https://github.com/yourusername"
                  />
                  {editingField !== 'githubUrl' ? (
                    <button
                      onClick={() => handleFieldEdit('githubUrl')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                    >
                      <PencilIcon className="h-3 w-3" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleFieldSave('githubUrl')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-600"
                      disabled={isLoading}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="personalWebsiteUrl">Personal website</Label>
                <div className="relative">
                  <Input
                    id="personalWebsiteUrl"
                    value={formData.personalWebsiteUrl}
                    onChange={(e) =>
                      handleInputChange('personalWebsiteUrl', e.target.value)
                    }
                    className={cn(
                      'rounded-sm pr-8',
                      editingField !== 'personalWebsiteUrl' && 'bg-muted',
                    )}
                    readOnly={editingField !== 'personalWebsiteUrl'}
                    placeholder="https://yourwebsite.com"
                  />
                  {editingField !== 'personalWebsiteUrl' ? (
                    <button
                      onClick={() => handleFieldEdit('personalWebsiteUrl')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                    >
                      <PencilIcon className="h-3 w-3" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleFieldSave('personalWebsiteUrl')}
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
