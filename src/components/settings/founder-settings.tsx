'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useUser } from '@/lib/contexts/user-context'
import { useToast } from '@/lib/hooks/use-toast'
import {
  PencilIcon,
  CheckIcon,
  CopyIcon,
  ChevronDown,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/actions/utils'
import Spinner from '@/components/ui/spinner'
import PhoneNumberInput from '@/components/design/phone-number-input-settings'

// Import founder role constants from onboarding types
import {
  FOUNDER_ROLES,
  FounderRole,
} from '@/components/onboarding/onboarding-types'

// Sound utility functions
const playSound = (soundFile: string) => {
  try {
    const audio = new Audio(soundFile)
    audio.volume = 0.4
    audio.play().catch((error) => {
      console.log('Could not play sound:', error)
    })
  } catch (error) {
    console.log('Error loading sound:', error)
  }
}

const playClickSound = () => {
  playSound('/sounds/light.mp3')
}

const playCompletionSound = () => {
  playSound('/sounds/completion.mp3')
}

// Define founder interface
interface Founder {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  bio: string
  role: FounderRole
  linkedin: string
  githubUrl: string
  personalWebsiteUrl: string
  twitterUrl: string
  startupId: string
  createdAt: string
}

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
    githubUrl: 'Github',
    personalWebsiteUrl: 'Personal website',
    twitterUrl: 'X',
  }
  return fieldLabels[fieldName] || fieldName
}

// Skeleton loading component that mimics the form layout
function ProfileSettingsSkeleton() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 pb-4">
        <h2 className="text-2xl font-semibold -mt-2 mb-2">Founder</h2>
        <p className="text-muted-foreground">
          Manage your details and contact information.
        </p>
      </div>

      <Separator className="flex-shrink-0" />

      <div className="flex-1 overflow-auto pt-6 max-h-[60.5vh] hide-scrollbar">
        <div className="space-y-6 pr-2">
          {/* Profile Picture Skeleton */}
          <div className="flex items-center space-x-4">
            <Skeleton className="h-20 w-20 rounded-sm" />
            <div className="space-x-2">
              <Skeleton className="h-8 w-16 inline-block" />
              <Skeleton className="h-8 w-16 inline-block" />
            </div>
          </div>

          {/* Personal Information Skeleton */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-20 w-full" />
          </div>

          {/* Social Links Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-16" />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProfileSettings() {
  const { user, supabase, currentStartupId, refreshUser } = useUser()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [founders, setFounders] = useState<Founder[]>([])
  const [showAddFounder, setShowAddFounder] = useState(false)
  const [founderToDelete, setFounderToDelete] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const [newFounderData, setNewFounderData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    role: 'Co-founder' as FounderRole,
    linkedin: '',
    githubUrl: '',
    personalWebsiteUrl: '',
    twitterUrl: '',
  })

  // Fetch all founders when component mounts or startup changes
  // Optimized to only depend on essential values that actually change
  useEffect(() => {
    const fetchFoundersData = async () => {
      if (!user?.id || !currentStartupId) return

      setDataLoading(true)
      try {
        const { data, error } = await supabase.rpc('get_startup_founders', {
          p_user_id: user.id,
          p_startup_id: currentStartupId,
        })

        if (error) throw error

        if (data && Array.isArray(data)) {
          setFounders(data)
        } else {
          // Fallback: create initial founder from user metadata
          const fallbackFounder: Founder = {
            id: 'temp-id',
            firstName: user.user_metadata?.firstName || '',
            lastName: user.user_metadata?.lastName || '',
            email: user.email || '',
            phone: user.user_metadata?.phone || '',
            bio: user.user_metadata?.bio || '',
            role: 'Founder',
            linkedin: user.user_metadata?.linkedin || '',
            githubUrl: user.user_metadata?.githubUrl || '',
            personalWebsiteUrl: user.user_metadata?.personalWebsiteUrl || '',
            twitterUrl: user.user_metadata?.twitterUrl || '',
            startupId: currentStartupId,
            createdAt: new Date().toISOString(),
          }
          setFounders([fallbackFounder])
        }
      } catch (error) {
        console.error('Error fetching founders data:', error)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load founders data.',
        })
      } finally {
        setDataLoading(false)
      }
    }

    fetchFoundersData()
    // Only depend on values that actually matter for the fetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, currentStartupId]) // Intentionally omitting supabase, toast, and user.user_metadata properties - they are stable references or fallback values only

  if (!user) {
    return <div></div>
  }

  if (dataLoading) {
    return <ProfileSettingsSkeleton />
  }

  const handleInputChange = (
    founderId: string,
    field: string,
    value: string | FounderRole,
  ) => {
    setFounders((prev) =>
      prev.map((founder) =>
        founder.id === founderId ? { ...founder, [field]: value } : founder,
      ),
    )
  }

  const handleNewFounderInputChange = (
    field: string,
    value: string | FounderRole,
  ) => {
    setNewFounderData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFieldEdit = (field: string, founderId?: string) => {
    playClickSound()
    setEditingField(founderId ? `${founderId}-${field}` : field)
    setTimeout(() => {
      document
        .getElementById(founderId ? `${founderId}-${field}` : field)
        ?.focus()
    }, 0)
  }

  const validateUrl = (url: string, field: string): boolean => {
    if (!url.trim()) return true // Empty URLs are allowed

    // Check if URL starts with https://
    if (!url.startsWith('https://')) {
      toast({
        variant: 'destructive',
        title: 'Invalid URL',
        description: `${formatFieldName(field)} must start with https://`,
      })
      return false
    }

    // Basic URL validation
    try {
      new URL(url)
      return true
    } catch {
      toast({
        variant: 'destructive',
        title: 'Invalid URL',
        description: `Please enter a valid ${formatFieldName(field)} URL`,
      })
      return false
    }
  }

  const handleFieldSave = async (founderId: string, field: string) => {
    if (!currentStartupId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No startup selected.',
      })
      return
    }

    const founder = founders.find((f) => f.id === founderId)
    if (!founder) return

    // Validate URLs for specific fields
    if (
      ['linkedin', 'githubUrl', 'personalWebsiteUrl', 'twitterUrl'].includes(
        field,
      )
    ) {
      const fieldValue = founder[field as keyof Founder] as string
      if (!validateUrl(fieldValue, field)) {
        return // Don't save if validation fails
      }
    }

    setIsLoading(true)
    try {
      const updateData = { [field]: founder[field as keyof Founder] }

      const { data, error } = await supabase.rpc('update_founder_profile', {
        p_user_id: user.id,
        p_founder_id: founderId,
        p_data: updateData,
      })

      if (error) throw error

      if (data?.error) {
        throw new Error(data.error)
      }

      // If this is the main founder (first in list) and we're updating name fields,
      // also update the user metadata so nav-user and startup-switcher reflect the changes
      const isMainFounder = founders.findIndex((f) => f.id === founderId) === 0
      if (isMainFounder && (field === 'firstName' || field === 'lastName')) {
        try {
          const updatedFounder = founders.find((f) => f.id === founderId)
          if (updatedFounder) {
            const fullName =
              `${updatedFounder.firstName} ${updatedFounder.lastName}`.trim()

            // Update user metadata with the new name
            await supabase.auth.updateUser({
              data: {
                ...user.user_metadata,
                name: fullName,
                firstName: updatedFounder.firstName,
                lastName: updatedFounder.lastName,
              },
            })

            // Refresh user context to get updated data
            await refreshUser()
          }
        } catch (metadataError) {
          console.error('Error updating user metadata:', metadataError)
          // Don't show error to user since the main update succeeded
        }
      }

      setEditingField(null)
      playCompletionSound()
      toast({
        title: 'Profile updated',
        variant: 'success',
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

  const handleAvatarUpload = async (file: File) => {
    if (!user) return

    // File size validation (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'Avatar image must be less than 5MB.',
      })
      return
    }

    // File type validation
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: 'Avatar must be a PNG, JPG, or WebP file.',
      })
      return
    }

    setAvatarUploading(true)
    try {
      // The new avatar path in the storage bucket
      const filePath = `${user.id}/avatar-${Date.now()}`

      // Upload the file to the 'avatars' bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true, // Overwrite if a file with the same name exists
        })

      if (uploadError) throw uploadError

      // Get the public URL of the uploaded file
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath)

      // Update the user's metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl, avatar_removed: false },
      })

      if (updateError) throw updateError

      // Refresh user context to immediately reflect the avatar change
      await refreshUser()

      playCompletionSound()
      toast({
        title: 'Avatar updated',
        variant: 'success',
        description: 'Your profile picture has been updated.',
      })
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'Failed to upload new avatar. Please try again.',
      })
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleAvatarRemove = async () => {
    if (!user) return

    setAvatarUploading(true)
    try {
      // Update the user's metadata to remove the avatar
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: null, avatar_removed: true },
      })

      if (updateError) throw updateError

      // Refresh user context to immediately reflect the avatar removal
      await refreshUser()

      playCompletionSound()
      toast({
        title: 'Avatar removed',
        variant: 'success',
        description: 'Your profile picture has been removed.',
      })

      // Optional: Clean up the user's avatar folder in storage
      const { data: files, error: listError } = await supabase.storage
        .from('avatars')
        .list(user.id)

      if (listError) {
        console.error('Could not list files to clean up avatar:', listError)
      } else if (files && files.length > 0) {
        const filePaths = files.map((file) => `${user.id}/${file.name}`)
        await supabase.storage.from('avatars').remove(filePaths)
      }
    } catch (error) {
      console.error('Error removing avatar:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to remove avatar. Please try again.',
      })
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleAddFounder = async () => {
    if (!currentStartupId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No startup selected.',
      })
      return
    }

    // Validate required fields
    if (
      !newFounderData.firstName.trim() ||
      !newFounderData.lastName.trim() ||
      !newFounderData.email.trim()
    ) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          'Please fill in all required fields (First name, Last name, and Email).',
      })
      return
    }

    // Validate URLs
    if (
      newFounderData.linkedin &&
      !validateUrl(newFounderData.linkedin, 'linkedin')
    )
      return
    if (
      newFounderData.githubUrl &&
      !validateUrl(newFounderData.githubUrl, 'githubUrl')
    )
      return
    if (
      newFounderData.personalWebsiteUrl &&
      !validateUrl(newFounderData.personalWebsiteUrl, 'personalWebsiteUrl')
    )
      return
    if (
      newFounderData.twitterUrl &&
      !validateUrl(newFounderData.twitterUrl, 'twitterUrl')
    )
      return

    setIsLoading(true)
    try {
      const { data, error } = await supabase.rpc('add_startup_founder', {
        p_user_id: user.id,
        p_startup_id: currentStartupId,
        p_data: newFounderData,
      })

      if (error) throw error

      if (data?.error) {
        throw new Error(data.error)
      }

      // Refresh founders list
      const { data: foundersData, error: fetchError } = await supabase.rpc(
        'get_startup_founders',
        {
          p_user_id: user.id,
          p_startup_id: currentStartupId,
        },
      )

      if (!fetchError && foundersData) {
        setFounders(foundersData)
      }

      // Reset form and hide add section
      setNewFounderData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        bio: '',
        role: 'Co-founder',
        linkedin: '',
        githubUrl: '',
        personalWebsiteUrl: '',
        twitterUrl: '',
      })
      setShowAddFounder(false)

      playCompletionSound()
      toast({
        title: 'Founder added',
        variant: 'success',
        description: 'The new founder has been added successfully.',
      })
    } catch (error) {
      console.error('Error adding founder:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add founder. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveFounder = async (founderId: string) => {
    if (founders.length <= 1) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Cannot remove the last founder.',
      })
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase.rpc('remove_startup_founder', {
        p_user_id: user.id,
        p_founder_id: founderId,
      })

      if (error) throw error

      if (data?.error) {
        throw new Error(data.error)
      }

      // Remove from local state
      setFounders((prev) => prev.filter((founder) => founder.id !== founderId))

      playCompletionSound()
      toast({
        title: 'Founder removed',
        variant: 'success',
        description: 'The founder has been removed successfully.',
      })
    } catch (error) {
      console.error('Error removing founder:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to remove founder. Please try again.',
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

  const getFounderInitials = (founder: Founder) => {
    return (
      `${founder.firstName.charAt(0)}${founder.lastName.charAt(0)}`.toUpperCase() ||
      founder.email?.charAt(0).toUpperCase() ||
      'U'
    )
  }

  // Determine which avatar to display for the main user (founderIndex 0)
  const getUserAvatarUrl = () => {
    if (!user) return ''

    const { avatar_url, avatar_removed } = user.user_metadata

    if (avatar_removed) {
      return `https://avatar.vercel.sh/${encodeURIComponent(
        user.email?.toLowerCase() || '',
      )}.png?size=80`
    }

    return (
      avatar_url ||
      `https://avatar.vercel.sh/${encodeURIComponent(
        user.email?.toLowerCase() || '',
      )}.png?size=80`
    )
  }

  const mainUserAvatarUrl = getUserAvatarUrl()

  return (
    <div className="h-full flex flex-col overflow-hidden select-none">
      <div className="flex-shrink-0 pb-4">
        <h2 className="text-2xl font-semibold -mt-2 mb-2">
          {founders.length > 1 ? 'Founders' : 'Founder'}
        </h2>
        <p className="text-muted-foreground">
          {founders.length > 1
            ? 'Manage founder details and contact information.'
            : 'Manage your details and contact information.'}
        </p>
      </div>

      <Separator className="flex-shrink-0 max-w-[98.7%]" />

      <div
        className="flex-1 overflow-auto pt-6 max-h-[60.5vh] hide-scrollbar"
        data-scroll-preserve="profile-settings-scroll"
      >
        <div className="space-y-6 pr-2">
          {/* Render each founder */}
          {founders.map((founder, founderIndex) => (
            <div key={founder.id}>
              {/* Founder header */}
              <div
                className={cn(
                  'flex items-center justify-between',
                  founderIndex > 0 && 'mb-6',
                )}
              >
                {founderIndex === 0 ? (
                  // Don't show any title for the first founder
                  <div />
                ) : (
                  <h3 className="text-lg font-medium">
                    {`${founder.firstName} ${founder.lastName}`.trim() ||
                      'Co-founder'}
                  </h3>
                )}
                {founderIndex > 0 && founders.length > 1 && (
                  <Dialog
                    open={founderToDelete === founder.id}
                    onOpenChange={(open) => !open && setFounderToDelete(null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFounderToDelete(founder.id)}
                        className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-800 dark:hover:text-red-200 border border-red-200 dark:border-red-800 rounded-sm"
                      >
                        Remove
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Remove co-founder?</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to remove{' '}
                          <span className="font-semibold">
                            {`${founder.firstName} ${founder.lastName}`.trim() ||
                              'this co-founder'}
                          </span>{' '}
                          from your startup? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            playClickSound()
                            setFounderToDelete(null)
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            playClickSound()
                            handleRemoveFounder(founder.id)
                            setFounderToDelete(null)
                          }}
                          disabled={isLoading}
                        >
                          Remove
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {/* Profile Picture - only for first founder */}
              {founderIndex === 0 && (
                <div className="flex items-center space-x-4 mb-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={mainUserAvatarUrl} />
                    <AvatarFallback className="text-lg">
                      {getFounderInitials(founder)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-x-2">
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleAvatarUpload(file)
                      }}
                      disabled={avatarUploading}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={avatarUploading}
                      className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-800 dark:hover:text-green-200 border border-green-200 dark:border-green-800 rounded-sm"
                    >
                      {avatarUploading ? (
                        <>
                          <Spinner className="h-3 w-3 mr-2" />
                        </>
                      ) : (
                        'Update'
                      )}
                    </Button>
                    {user.user_metadata.avatar_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={avatarUploading}
                        onClick={handleAvatarRemove}
                        className="bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900/40 hover:text-pink-800 dark:hover:text-pink-200 border border-pink-200 dark:border-pink-800 rounded-sm"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Personal Information */}
              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <div className="space-y-2">
                  <Label htmlFor={`${founder.id}-firstName`}>First name</Label>
                  <div className="relative">
                    <Input
                      id={`${founder.id}-firstName`}
                      value={founder.firstName}
                      onChange={(e) =>
                        handleInputChange(
                          founder.id,
                          'firstName',
                          e.target.value,
                        )
                      }
                      className={cn(
                        'rounded-sm pr-8',
                        editingField !== `${founder.id}-firstName` &&
                          'dark:bg-muted',
                      )}
                      readOnly={editingField !== `${founder.id}-firstName`}
                      placeholder="Enter first name"
                    />
                    {editingField !== `${founder.id}-firstName` ? (
                      <button
                        onClick={() => handleFieldEdit('firstName', founder.id)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                      >
                        <PencilIcon className="h-3 w-3" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFieldSave(founder.id, 'firstName')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-600"
                        disabled={isLoading}
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${founder.id}-lastName`}>Last name</Label>
                  <div className="relative">
                    <Input
                      id={`${founder.id}-lastName`}
                      value={founder.lastName}
                      onChange={(e) =>
                        handleInputChange(
                          founder.id,
                          'lastName',
                          e.target.value,
                        )
                      }
                      className={cn(
                        'rounded-sm pr-8',
                        editingField !== `${founder.id}-lastName` &&
                          'dark:bg-muted',
                      )}
                      readOnly={editingField !== `${founder.id}-lastName`}
                      placeholder="Enter last name"
                    />
                    {editingField !== `${founder.id}-lastName` ? (
                      <button
                        onClick={() => handleFieldEdit('lastName', founder.id)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                      >
                        <PencilIcon className="h-3 w-3" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFieldSave(founder.id, 'lastName')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-600"
                        disabled={isLoading}
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <div className="space-y-2">
                  <Label htmlFor={`${founder.id}-email`}>Email</Label>
                  <div className="relative">
                    <Input
                      id={`${founder.id}-email`}
                      type="email"
                      value={founder.email}
                      onChange={(e) =>
                        handleInputChange(founder.id, 'email', e.target.value)
                      }
                      className={cn(
                        'rounded-sm pr-8',
                        editingField !== `${founder.id}-email` &&
                          'dark:bg-muted',
                      )}
                      readOnly={editingField !== `${founder.id}-email`}
                      placeholder="Enter email"
                    />
                    {editingField !== `${founder.id}-email` ? (
                      <button
                        onClick={() => handleFieldEdit('email', founder.id)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                      >
                        <PencilIcon className="h-3 w-3" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFieldSave(founder.id, 'email')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-600"
                        disabled={isLoading}
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <PhoneNumberInput
                    value={founder.phone}
                    onChange={(value) =>
                      handleInputChange(founder.id, 'phone', value || '')
                    }
                    onSave={() => handleFieldSave(founder.id, 'phone')}
                    label="Phone"
                    isLoading={isLoading}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <div className="space-y-2">
                  <Label htmlFor={`${founder.id}-role`}>Role</Label>
                  <div className="relative">
                    <select
                      id={`${founder.id}-role`}
                      className="w-full pl-3 pr-8 py-2 border border-input rounded-sm appearance-none bg-transparent text-sm"
                      value={founder.role}
                      onChange={async (e) => {
                        const newValue = e.target.value as FounderRole
                        handleInputChange(founder.id, 'role', newValue)
                        await handleFieldSave(founder.id, 'role')
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

                {/* User ID only for first founder */}
                {founderIndex === 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="user-id">User ID</Label>
                    <div className="flex">
                      <Input
                        id="user-id"
                        value={user.id}
                        readOnly
                        className="rounded-l-sm rounded-r-none dark:bg-muted"
                      />
                      <Button
                        variant="outline"
                        className={cn(
                          'rounded-r-sm rounded-l-none h-9 w-24',
                          isCopied
                            ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-800 dark:hover:text-green-200 border border-green-200 dark:border-green-800'
                            : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
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
                )}

                {/* Founder ID only for co-founders */}
                {founderIndex > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor={`${founder.id}-founder-id`}>ID</Label>
                    <Input
                      id={`${founder.id}-founder-id`}
                      value={founder.id}
                      readOnly
                      className="rounded-sm dark:bg-muted"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2 mb-6">
                <Label htmlFor={`${founder.id}-bio`}>Bio</Label>
                <div className="relative">
                  <Textarea
                    id={`${founder.id}-bio`}
                    value={founder.bio}
                    onChange={(e) =>
                      handleInputChange(founder.id, 'bio', e.target.value)
                    }
                    className={cn(
                      'rounded-sm pr-8 min-h-[80px]',
                      editingField !== `${founder.id}-bio` && 'dark:bg-muted',
                    )}
                    readOnly={editingField !== `${founder.id}-bio`}
                    placeholder="Tell us about this founder..."
                    rows={3}
                    enableAI={editingField === `${founder.id}-bio`}
                    aiFieldType="bio"
                    aiContext={{
                      founderName:
                        `${founder.firstName} ${founder.lastName}`.trim(),
                      role: founder.role,
                    }}
                    onAIEnhance={(enhancedText) =>
                      handleInputChange(founder.id, 'bio', enhancedText)
                    }
                  />
                  {editingField !== `${founder.id}-bio` ? (
                    <button
                      onClick={() => handleFieldEdit('bio', founder.id)}
                      className="absolute right-2 top-2 text-blue-500 hover:text-blue-600"
                    >
                      <PencilIcon className="h-3 w-3" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleFieldSave(founder.id, 'bio')}
                      className="absolute right-2 top-2 text-green-500 hover:text-green-600"
                      disabled={isLoading}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-4 mb-6">
                <h4 className="text-md font-medium">Socials</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`${founder.id}-linkedin`}>LinkedIn</Label>
                    <div className="relative">
                      <Input
                        id={`${founder.id}-linkedin`}
                        value={founder.linkedin}
                        onChange={(e) =>
                          handleInputChange(
                            founder.id,
                            'linkedin',
                            e.target.value,
                          )
                        }
                        className={cn(
                          'rounded-sm pr-8',
                          editingField !== `${founder.id}-linkedin` &&
                            'dark:bg-muted',
                        )}
                        readOnly={editingField !== `${founder.id}-linkedin`}
                        placeholder="https://linkedin.com/in/profile"
                      />
                      {editingField !== `${founder.id}-linkedin` ? (
                        <button
                          onClick={() =>
                            handleFieldEdit('linkedin', founder.id)
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                        >
                          <PencilIcon className="h-3 w-3" />
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleFieldSave(founder.id, 'linkedin')
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-600"
                          disabled={isLoading}
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`${founder.id}-githubUrl`}>Github</Label>
                    <div className="relative">
                      <Input
                        id={`${founder.id}-githubUrl`}
                        value={founder.githubUrl}
                        onChange={(e) =>
                          handleInputChange(
                            founder.id,
                            'githubUrl',
                            e.target.value,
                          )
                        }
                        className={cn(
                          'rounded-sm pr-8',
                          editingField !== `${founder.id}-githubUrl` &&
                            'dark:bg-muted',
                        )}
                        readOnly={editingField !== `${founder.id}-githubUrl`}
                        placeholder="https://github.com/username"
                      />
                      {editingField !== `${founder.id}-githubUrl` ? (
                        <button
                          onClick={() =>
                            handleFieldEdit('githubUrl', founder.id)
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                        >
                          <PencilIcon className="h-3 w-3" />
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleFieldSave(founder.id, 'githubUrl')
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-600"
                          disabled={isLoading}
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`${founder.id}-personalWebsiteUrl`}>
                      Personal website
                    </Label>
                    <div className="relative">
                      <Input
                        id={`${founder.id}-personalWebsiteUrl`}
                        value={founder.personalWebsiteUrl}
                        onChange={(e) =>
                          handleInputChange(
                            founder.id,
                            'personalWebsiteUrl',
                            e.target.value,
                          )
                        }
                        className={cn(
                          'rounded-sm pr-8',
                          editingField !== `${founder.id}-personalWebsiteUrl` &&
                            'dark:bg-muted',
                        )}
                        readOnly={
                          editingField !== `${founder.id}-personalWebsiteUrl`
                        }
                        placeholder="https://website.com"
                      />
                      {editingField !== `${founder.id}-personalWebsiteUrl` ? (
                        <button
                          onClick={() =>
                            handleFieldEdit('personalWebsiteUrl', founder.id)
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                        >
                          <PencilIcon className="h-3 w-3" />
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleFieldSave(founder.id, 'personalWebsiteUrl')
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-600"
                          disabled={isLoading}
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`${founder.id}-twitterUrl`}>X</Label>
                    <div className="relative">
                      <Input
                        id={`${founder.id}-twitterUrl`}
                        value={founder.twitterUrl}
                        onChange={(e) =>
                          handleInputChange(
                            founder.id,
                            'twitterUrl',
                            e.target.value,
                          )
                        }
                        className={cn(
                          'rounded-sm pr-8',
                          editingField !== `${founder.id}-twitterUrl` &&
                            'dark:bg-muted',
                        )}
                        readOnly={editingField !== `${founder.id}-twitterUrl`}
                        placeholder="https://x.com/username"
                      />
                      {editingField !== `${founder.id}-twitterUrl` ? (
                        <button
                          onClick={() =>
                            handleFieldEdit('twitterUrl', founder.id)
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600"
                        >
                          <PencilIcon className="h-3 w-3" />
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleFieldSave(founder.id, 'twitterUrl')
                          }
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

              {/* Separator after each founder except the last */}
              {founderIndex < founders.length - 1 && (
                <Separator className="my-8" />
              )}
            </div>
          ))}

          {/* Add new founder section */}
          {showAddFounder && (
            <div className="mt-8">
              <Separator className="mb-6" />
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Co-founder</h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-firstName">First name *</Label>
                    <Input
                      id="new-firstName"
                      value={newFounderData.firstName}
                      onChange={(e) =>
                        handleNewFounderInputChange('firstName', e.target.value)
                      }
                      placeholder="Enter first name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-lastName">Last name *</Label>
                    <Input
                      id="new-lastName"
                      value={newFounderData.lastName}
                      onChange={(e) =>
                        handleNewFounderInputChange('lastName', e.target.value)
                      }
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-email">Email *</Label>
                    <Input
                      id="new-email"
                      type="email"
                      value={newFounderData.email}
                      onChange={(e) =>
                        handleNewFounderInputChange('email', e.target.value)
                      }
                      placeholder="Enter email"
                    />
                  </div>

                  <div className="space-y-2">
                    <PhoneNumberInput
                      value={newFounderData.phone}
                      onChange={(value) =>
                        handleNewFounderInputChange('phone', value || '')
                      }
                      label="Phone"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-role">Role</Label>
                  <div className="relative">
                    <select
                      id="new-role"
                      className="w-full pl-3 pr-8 py-2 border border-input rounded-sm appearance-none bg-transparent text-sm"
                      value={newFounderData.role}
                      onChange={(e) =>
                        handleNewFounderInputChange(
                          'role',
                          e.target.value as FounderRole,
                        )
                      }
                    >
                      {FOUNDER_ROLES.filter((role) => role !== 'Founder').map(
                        (role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ),
                      )}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-bio">Bio</Label>
                  <Textarea
                    id="new-bio"
                    value={newFounderData.bio}
                    onChange={(e) =>
                      handleNewFounderInputChange('bio', e.target.value)
                    }
                    placeholder="Tell us about this co-founder..."
                    rows={3}
                    enableAI={true}
                    aiFieldType="bio"
                    aiContext={{
                      founderName:
                        `${newFounderData.firstName} ${newFounderData.lastName}`.trim(),
                      role: newFounderData.role,
                    }}
                    onAIEnhance={(enhancedText) =>
                      handleNewFounderInputChange('bio', enhancedText)
                    }
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-linkedin">LinkedIn</Label>
                    <Input
                      id="new-linkedin"
                      value={newFounderData.linkedin}
                      onChange={(e) =>
                        handleNewFounderInputChange('linkedin', e.target.value)
                      }
                      placeholder="https://linkedin.com/in/profile"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-githubUrl">Github</Label>
                    <Input
                      id="new-githubUrl"
                      value={newFounderData.githubUrl}
                      onChange={(e) =>
                        handleNewFounderInputChange('githubUrl', e.target.value)
                      }
                      placeholder="https://github.com/username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-personalWebsiteUrl">
                      Personal website
                    </Label>
                    <Input
                      id="new-personalWebsiteUrl"
                      value={newFounderData.personalWebsiteUrl}
                      onChange={(e) =>
                        handleNewFounderInputChange(
                          'personalWebsiteUrl',
                          e.target.value,
                        )
                      }
                      placeholder="https://website.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-twitterUrl">X</Label>
                    <Input
                      id="new-twitterUrl"
                      value={newFounderData.twitterUrl}
                      onChange={(e) =>
                        handleNewFounderInputChange(
                          'twitterUrl',
                          e.target.value,
                        )
                      }
                      placeholder="https://x.com/username"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    className="bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900/40 hover:text-pink-800 dark:hover:text-pink-200 border border-pink-200 dark:border-pink-800"
                    onClick={() => setShowAddFounder(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddFounder}
                    disabled={isLoading}
                    className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-800 dark:hover:text-green-200 border border-green-200 dark:border-green-800"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Add co-founder button */}
          {!showAddFounder && (
            <div className="mt-8">
              <Separator className="mb-6" />
              <Button
                onClick={() => setShowAddFounder(true)}
                variant="outline"
                className="w-full hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Plus className="h-4 w-4 mr-2 " />
                Add co-founder
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
