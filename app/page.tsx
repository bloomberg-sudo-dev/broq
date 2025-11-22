"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Zap, Bot, Gamepad2, MessageSquare, Play, ArrowRight, Github, Star, Users, LogOut, User } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { AuthModal } from "@/components/AuthModal"
import { AuthRedirect } from "@/components/AuthRedirect"
import { toast } from "sonner"

export default function BroqLanding() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [isClient, setIsClient] = useState(false)
  
  const { user, signOut, signInWithGoogle, signInWithGitHub, loading } = useAuth()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Check for auth redirect from protected route
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const authParam = urlParams.get('auth')
    
    if (authParam === 'required') {
      openAuthModal('login')
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (authParam === 'error') {
      const errorMessage = urlParams.get('error_message') || 'Authentication failed'
      openAuthModal('login')
      toast.error(errorMessage)
      window.history.replaceState({}, document.title, window.location.pathname)
    }
    
    if (urlParams.get('redirect') === 'app' && user) {
      window.location.href = '/app'
    }
  }, [user])

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode)
    setAuthModalOpen(true)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      if (provider === 'google') {
        await signInWithGoogle()
      } else {
        await signInWithGitHub()
      }
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error)
    }
  }

  return (
    <div className="min-h-screen bg-orange-50 overflow-x-hidden font-sans selection:bg-orange-200">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b-2 border-orange-100">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3 group cursor-pointer">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-[4px_4px_0px_0px_rgba(234,88,12,0.3)] group-hover:shadow-[2px_2px_0px_0px_rgba(234,88,12,0.3)] group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all duration-200"
                style={{ background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)' }}
              >
                B
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-gray-900">Broq</span>
                <span className="text-xs font-bold text-orange-500 tracking-wide uppercase">Visual Builder</span>
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4" suppressHydrationWarning>
              {isClient && user ? (
                <>
                  <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-orange-100/50 rounded-full border border-orange-200">
                    <User className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-semibold text-orange-800 truncate max-w-[150px]">{user.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl font-bold"
                  >
                    Sign Out
                  </Button>
                  <Button 
                    asChild
                    className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl px-6 py-6 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all border-2 border-black"
                  >
                    <a href="/app">
                      Launch App 🚀
                    </a>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => openAuthModal('login')}
                    className="hidden sm:inline-flex text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl font-bold text-base"
                  >
                    Log In
                  </Button>
                  <Button 
                    onClick={() => openAuthModal('signup')}
                    className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl px-8 py-6 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all border-2 border-black text-base"
                  >
                    Start Building Free ⚡
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Decorative Floating Elements */}
        <div className="absolute top-20 left-10 w-24 h-24 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-24 h-24 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-24 h-24 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

        <div className="mx-auto max-w-7xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-8 transform -rotate-2 hover:rotate-0 transition-transform duration-300 cursor-default">
            <Sparkles className="w-5 h-5 text-orange-500 fill-orange-500" />
            <span className="font-bold text-sm tracking-wide">NOW OPEN SOURCE</span>
          </div>

          <h1 className="mb-8 text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-gray-900 leading-[0.9]">
            Build AI Logic <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-yellow-500 drop-shadow-sm">
              Without Code
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-xl md:text-2xl text-gray-600 font-medium leading-relaxed">
            Drag, drop, and connect colorful blocks to create powerful AI agents. 
            It's like <span className="inline-block px-2 py-1 bg-yellow-200 -rotate-1 rounded-lg border border-black font-bold text-black transform hover:scale-110 transition-transform">Scratch</span> but for LLMs!
          </p>

          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
            {isClient && user ? (
              <Button
                size="lg"
                asChild
                className="bg-black hover:bg-gray-800 text-white px-10 py-8 text-xl font-bold rounded-2xl shadow-[6px_6px_0px_0px_#f97316] hover:shadow-[3px_3px_0px_0px_#f97316] hover:translate-x-[3px] hover:translate-y-[3px] transition-all border-2 border-black"
              >
                <a href="/app">
                  <Play className="mr-3 h-6 w-6 fill-white" />
                  Open Studio
                </a>
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => openAuthModal('signup')}
                className="bg-black hover:bg-gray-800 text-white px-10 py-8 text-xl font-bold rounded-2xl shadow-[6px_6px_0px_0px_#f97316] hover:shadow-[3px_3px_0px_0px_#f97316] hover:translate-x-[3px] hover:translate-y-[3px] transition-all border-2 border-black"
              >
                <Play className="mr-3 h-6 w-6 fill-white" />
                Try Broq Free
              </Button>
            )}
            <Button
              variant="outline"
              size="lg"
              asChild
              className="bg-white hover:bg-gray-50 text-black px-10 py-8 text-xl font-bold rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all border-2 border-black"
            >
              <a href="https://github.com/bloomberg-sudo-dev/broq" target="_blank" rel="noopener noreferrer">
                <Github className="mr-3 h-6 w-6" />
                Star on GitHub
              </a>
            </Button>
          </div>

          {/* Quick Login Bubbles */}
          {!user && (
            <div className="mt-12 animate-fade-in-up">
              <p className="text-gray-500 font-bold text-sm uppercase tracking-widest mb-4">Quick Start With</p>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => handleSocialLogin('google')}
                  className="p-4 bg-white rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => handleSocialLogin('github')}
                  className="p-4 bg-gray-900 rounded-2xl border-2 border-gray-900 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                >
                  <Github className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-20 px-4 bg-white border-y-2 border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">What Can You Build?</h2>
            <p className="text-xl text-gray-500 font-medium">Everything from silly bots to serious tools.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Card 1 */}
            <div className="group relative bg-yellow-50 rounded-3xl border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200 cursor-default">
              <div className="w-16 h-16 bg-yellow-400 rounded-2xl border-2 border-black flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
                <Zap className="w-8 h-8 text-black fill-black" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">AI Logic Lab</h3>
              <p className="text-gray-700 font-medium leading-relaxed mb-6">
                Experiment with prompt engineering visually. Chain thoughts together to create smarter agents.
              </p>
              <div className="inline-block px-3 py-1 bg-white border-2 border-black rounded-lg text-xs font-bold uppercase tracking-wide">
                For Learning
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative bg-orange-50 rounded-3xl border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200 cursor-default">
              <div className="w-16 h-16 bg-orange-400 rounded-2xl border-2 border-black flex items-center justify-center mb-6 group-hover:-rotate-6 transition-transform">
                <Gamepad2 className="w-8 h-8 text-black fill-black" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">Game Designer</h3>
              <p className="text-gray-700 font-medium leading-relaxed mb-6">
                Build choose-your-own adventure games where the story evolves based on player choices.
              </p>
              <div className="inline-block px-3 py-1 bg-white border-2 border-black rounded-lg text-xs font-bold uppercase tracking-wide">
                For Fun
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative bg-green-50 rounded-3xl border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200 cursor-default">
              <div className="w-16 h-16 bg-green-400 rounded-2xl border-2 border-black flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform">
                <MessageSquare className="w-8 h-8 text-black fill-black" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">Classroom Tools</h3>
              <p className="text-gray-700 font-medium leading-relaxed mb-6">
                Create "detect the tone" or "fact check this" challenges for students without code.
              </p>
              <div className="inline-block px-3 py-1 bg-white border-2 border-black rounded-lg text-xs font-bold uppercase tracking-wide">
                For Education
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="max-w-5xl mx-auto bg-black rounded-[3rem] p-12 md:p-24 text-center relative shadow-[12px_12px_0px_0px_#ea580c]">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight">
              Ready to build something <br/>
              <span className="text-orange-500">awesome?</span>
            </h2>
            
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              {isClient && user ? (
                <Button
                  size="lg"
                  asChild
                  className="bg-white text-black hover:bg-gray-100 px-12 py-8 text-xl font-bold rounded-2xl border-2 border-transparent hover:scale-105 transition-transform"
                >
                  <a href="/app">Launch Broq 🎉</a>
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={() => openAuthModal('signup')}
                  className="bg-white text-black hover:bg-gray-100 px-12 py-8 text-xl font-bold rounded-2xl border-2 border-transparent hover:scale-105 transition-transform"
                >
                  Get Started Free 🎉
                </Button>
              )}
              
              <a href="https://calendar.app.google/hQWGAkn1S4LhGayD7">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-black px-12 py-8 text-xl font-bold rounded-2xl transition-colors"
                >
                  Book Demo 🤖
                </Button>
              </a>
            </div>
          </div>
          
          {/* Background patterns */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute top-10 left-10 w-32 h-32 rounded-full border-4 border-white"></div>
             <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-orange-500"></div>
             <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-yellow-500 rotate-45"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-gray-100 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white font-bold text-xl">
              B
            </div>
            <span className="font-black text-xl text-gray-900">Broq</span>
          </div>
          
          <div className="flex gap-8 font-bold text-gray-600">
            <a href="https://agreeable-idea-6f3.notion.site/Broq-Documentation-2142e0439528805da5cfdd912d41433d" className="hover:text-orange-600 transition-colors">Docs</a>
            <a href="https://github.com/bloomberg-sudo-dev/broq" className="hover:text-orange-600 transition-colors">GitHub</a>
            <a href="https://discord.gg/py6tw3f28N" className="hover:text-orange-600 transition-colors">Discord</a>
          </div>
          
          <p className="text-gray-400 font-medium text-sm">
            © {new Date().getFullYear()} Broq. MIT Licensed.
          </p>
        </div>
      </footer>

      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        defaultMode={authMode}
      />
      <AuthRedirect />
    </div>
  )
}