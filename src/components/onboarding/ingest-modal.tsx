'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import Spinner from '@/components/ui/spinner'
import { AlertCircle } from 'lucide-react'
import {
  StartupData,
  IndustryType,
  LegalStructure,
  InvestmentStage,
  InvestmentInstrument,
  RevenueModelType,
} from './onboarding-types'
import { LottieIcon } from '@/components/design/lottie-icon'
import { animations } from '@/lib/utils/lottie-animations'

interface SmartIngestModalProps {
  isOpen: boolean
  onClose: () => void
  onIngest: (data: Partial<StartupData>) => void
  currentData: StartupData
}

interface IngestData {
  // Company Information
  name?: string
  industry?: string
  location?: string
  foundedYear?: number
  descriptionShort?: string
  descriptionMedium?: string
  descriptionLong?: string

  // Fundraising Information
  fundingRound?: string
  investmentInstrument?: string
  fundingAmountSought?: number
  preMoneyValuation?: number
  revenueModel?: string
  currentRunway?: number

  // Business Metrics
  mrr?: number
  arr?: number
  employeeCount?: number
  tractionSummary?: string
  marketSummary?: string
  keyCustomers?: string
  competitors?: string

  // Additional Information
  operatingCountries?: string[]
  legalStructure?: string
  isIncorporated?: boolean
  incorporationCountry?: string
  incorporationCity?: string
}

export const SmartIngestModal: React.FC<SmartIngestModalProps> = ({
  isOpen,
  onClose,
  onIngest,
  currentData,
}) => {
  const [content, setContent] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleIngest = async () => {
    if (!content.trim()) {
      setError('Please paste some content to autofill')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          context: {
            companyName: currentData.name || undefined,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze content')
      }

      const { data } = (await response.json()) as { data: IngestData }

      // Convert the extracted data to match StartupData structure
      const startupData: Partial<StartupData> = {}

      // Only update fields that are currently empty in the form
      if (!currentData.name && data.name) startupData.name = data.name
      if (!currentData.industry && data.industry) {
        startupData.industry = data.industry as IndustryType
      }
      if (!currentData.location && data.location)
        startupData.location = data.location
      if (!currentData.foundedYear && data.foundedYear)
        startupData.foundedYear = data.foundedYear
      if (!currentData.descriptionShort && data.descriptionShort) {
        startupData.descriptionShort = data.descriptionShort
      }
      if (!currentData.descriptionMedium && data.descriptionMedium) {
        startupData.descriptionMedium = data.descriptionMedium
      }
      if (!currentData.descriptionLong && data.descriptionLong) {
        startupData.descriptionLong = data.descriptionLong
      }
      if (!currentData.fundingRound && data.fundingRound) {
        startupData.fundingRound = data.fundingRound as InvestmentStage
      }
      if (!currentData.investmentInstrument && data.investmentInstrument) {
        startupData.investmentInstrument =
          data.investmentInstrument as InvestmentInstrument
      }
      if (!currentData.fundingAmountSought && data.fundingAmountSought) {
        startupData.fundingAmountSought = data.fundingAmountSought
      }
      if (!currentData.preMoneyValuation && data.preMoneyValuation) {
        startupData.preMoneyValuation = data.preMoneyValuation
      }
      if (!currentData.revenueModel && data.revenueModel) {
        startupData.revenueModel = data.revenueModel as RevenueModelType
      }
      if (!currentData.currentRunway && data.currentRunway) {
        startupData.currentRunway = data.currentRunway
      }
      if (!currentData.mrr && data.mrr) startupData.mrr = data.mrr
      if (!currentData.arr && data.arr) startupData.arr = data.arr
      if (!currentData.employeeCount && data.employeeCount) {
        startupData.employeeCount = data.employeeCount
      }
      if (!currentData.tractionSummary && data.tractionSummary) {
        startupData.tractionSummary = data.tractionSummary
      }
      if (!currentData.marketSummary && data.marketSummary) {
        startupData.marketSummary = data.marketSummary
      }
      if (!currentData.keyCustomers && data.keyCustomers) {
        startupData.keyCustomers = data.keyCustomers
      }
      if (!currentData.competitors && data.competitors) {
        startupData.competitors = data.competitors
        startupData.competitorsList = data.competitors
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean)
      }
      if (!currentData.operatingCountries.length && data.operatingCountries) {
        startupData.operatingCountries = data.operatingCountries
      }
      if (!currentData.legalStructure && data.legalStructure) {
        startupData.legalStructure = data.legalStructure as LegalStructure
      }
      if (data.isIncorporated !== undefined && data.isIncorporated !== null) {
        startupData.isIncorporated = data.isIncorporated
      }
      if (!currentData.incorporationCountry && data.incorporationCountry) {
        startupData.incorporationCountry = data.incorporationCountry
      }
      if (!currentData.incorporationCity && data.incorporationCity) {
        startupData.incorporationCity = data.incorporationCity
      }

      onIngest(startupData)
      onClose()

      // Reset form
      setContent('')
    } catch (error) {
      console.error('Ingest error:', error)
      setError(
        error instanceof Error ? error.message : 'Failed to analyze content',
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleClose = () => {
    setContent('')
    setError(null)
    onClose()
  }

  return (
    <>
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 mb-4">
              <LottieIcon
                animationData={animations.science}
                size={20}
                loop={false}
                autoplay={false}
              />
              Ingest
            </DialogTitle>
            <DialogDescription>
              Paste content from previous applications, pitch decks, or business
              documents to automatically fill your startup profile.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-grow overflow-y-auto space-y-6 scrollbar-hide">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-sm p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-red-800 font-medium">Error</h4>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-sm p-4">
              <div className="flex items-start gap-3">
                <LottieIcon
                  animationData={animations.accessibility}
                  size={20}
                  loop={false}
                  autoplay={false}
                  className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0"
                />
                <div>
                  <h4 className="text-blue-800 dark:text-blue-200 font-medium text-sm">
                    What content works best?
                  </h4>
                  <ul className="text-blue-700 dark:text-blue-300 text-xs mt-2 space-y-1">
                    <li>• Previous VC application responses</li>
                    <li>• Pitch deck content (as text)</li>
                    <li>• Business plan excerpts</li>
                    <li>• Company description</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Textarea
                id="content-input"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your previous application responses, pitch deck content, business plan excerpts, or any other relevant startup information here..."
                rows={12}
                disabled={isAnalyzing}
                className="min-h-[300px]"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Paste content from applications, pitch decks, business plans,
                  etc.
                </span>
                <span>{content.length} characters</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isAnalyzing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleIngest}
              disabled={!content.trim() || isAnalyzing}
              className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:text-purple-800 dark:hover:text-purple-200 border border-purple-200 dark:border-purple-800"
            >
              {isAnalyzing ? (
                <>
                  <Spinner className="h-3 w-3 mr-2" />
                </>
              ) : (
                <>Autofill</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
