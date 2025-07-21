import React, { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingScreenProps {
  isVisible: boolean
  duration?: number
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  isVisible, 
  duration = 2500 
}) => {
  const [progress, setProgress] = useState(0)
  const [loadingText, setLoadingText] = useState('Initializing workspace...')

  useEffect(() => {
    if (!isVisible) {
      setProgress(0)
      return
    }

    const steps = [
      { text: 'Initializing workspace...', progress: 0 },
      { text: 'Loading Blockly engine...', progress: 25 },
      { text: 'Setting up blocks...', progress: 50 },
      { text: 'Preparing canvas...', progress: 75 },
      { text: 'Almost ready...', progress: 90 },
      { text: 'Complete!', progress: 100 }
    ]

    let currentStep = 0
    const stepDuration = duration / steps.length

    const progressInterval = setInterval(() => {
      if (currentStep < steps.length) {
        setLoadingText(steps[currentStep].text)
        setProgress(steps[currentStep].progress)
        currentStep++
      } else {
        clearInterval(progressInterval)
      }
    }, stepDuration)

    return () => clearInterval(progressInterval)
  }, [isVisible, duration])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-slate-950 transition-opacity duration-500">
      <div className="flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="flex items-center gap-4 animate-fade-in">
                  <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #9333ea 0%, #2563eb 100%)',
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'scroll'
          }}
        >
          <span className="text-white font-bold text-2xl">B</span>
        </div>
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">broq.</h1>
            <p className="text-lg text-slate-500 dark:text-slate-400">Visual Flow Builder</p>
          </div>
        </div>
        
        {/* Loading animation */}
        <div className="flex items-center gap-3 mt-4 animate-fade-in-delay-1">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-slate-600 dark:text-slate-400 font-medium transition-all duration-300">
            {loadingText}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-64 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden animate-fade-in-delay-2">
          <div 
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{ 
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #9333ea 0%, #2563eb 100%)',
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
              backgroundAttachment: 'scroll'
            }}
          ></div>
        </div>
        
        {/* Progress percentage */}
        <div className="animate-fade-in-delay-2">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {progress}%
          </span>
        </div>
        
        {/* Version info */}
        <div className="mt-6 text-center animate-fade-in-delay-3">
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Powered by Blockly • Built for AI workflows
          </p>
        </div>
      </div>
    </div>
  )
} 