"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Zap, Bot, Gamepad2, MessageSquare, Play, ArrowRight, Github, Star, Users, LogOut, User } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { AuthModal } from "@/components/AuthModal"
import { AuthRedirect } from "@/components/AuthRedirect"
// import { AuthDebug } from "@/components/AuthDebug"

export default function BroqLanding() {
  const [currentDemo, setCurrentDemo] = useState(0)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [isClient, setIsClient] = useState(false)
  
  const { user, signOut, signInWithGoogle, signInWithGitHub, loading } = useAuth()

  // Client-side only rendering for auth-dependent content
  useEffect(() => {
    setIsClient(true)
  }, [])

  const demoBlocks = [
    {
      type: "input",
      content: "Why is the sky blue?",
      color: "bg-blue-100 border-blue-300",
    },
    {
      type: "llm",
      content: "OpenAI GPT-4",
      color: "bg-green-100 border-green-300",
    },
    {
      type: "output",
      content: "Scientific explanation...",
      color: "bg-orange-100 border-orange-300",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDemo((prev) => (prev + 1) % 3)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // Check for auth redirect from protected route
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('auth') === 'required') {
      openAuthModal('login')
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

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
      // Close any open auth modal since OAuth will handle the redirect
      setAuthModalOpen(false)
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="w-full px-0">
          <div className="flex h-16 items-center justify-between">
            {/* Logo - Moved to extreme left edge */}
            <div className="flex items-center gap-3 ml-4 sm:ml-6 lg:ml-8">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                B
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900">Broq</span>
                <span className="text-xs text-gray-500 -mt-1">Visual Flow Builder</span>
              </div>
            </div>

            {/* Auth Buttons - Moved to extreme right edge */}
            <div className="flex items-center gap-3 mr-4 sm:mr-6 lg:mr-8" suppressHydrationWarning>
              {loading ? (
                <div className="w-8 h-8 animate-pulse bg-gray-200 rounded-full"></div>
              ) : isClient && user ? (
                <>
                  <div className="hidden sm:flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="text-sm truncate max-w-32">{user.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full px-4"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                  <Button 
                    asChild
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full px-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                  >
                    <a href="/app">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Go to App 🚀
                    </a>
                  </Button>
                </>
              ) : isClient ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => openAuthModal('login')}
                    className="hidden sm:inline-flex text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full px-4"
                  >
                    Log In
                  </Button>
                  <Button 
                    onClick={() => openAuthModal('signup')}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full px-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Try Broq Now! 🚀
                  </Button>
                </>
              ) : (
                // SSR fallback
                <Button 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full px-6 shadow-lg opacity-75"
                  disabled
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Try Broq Now! 🚀
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-8 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <div className="mb-8 flex justify-center">
            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 px-4 py-2 text-sm font-medium">
              🎉 Free & Open Source
            </Badge>
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
            <span className="block">Build AI Solutions with</span>
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
              Colorful Blocks! 🧱✨
            </span>
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600 sm:text-2xl">
            Broq is like <strong>Scratch for LLMs</strong> — drag, drop, and build AI programs without writing a
            single line of code! 🚀
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row" suppressHydrationWarning>
            {isClient && user ? (
              <Button
                size="lg"
                asChild
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <a href="/app">
                  <Play className="mr-2 h-5 w-5" />
                  Go to App 🎮
                </a>
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => isClient ? openAuthModal('signup') : undefined}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <Play className="mr-2 h-5 w-5" />
                Try Broq Now - It's Free! 🎮
              </Button>
            )}
            <Button
              variant="outline"
              size="lg"
              asChild
              className="px-8 py-4 text-lg font-semibold rounded-full border-2 hover:bg-gray-50 bg-transparent"
            >
              <a href="https://github.com/bloomberg-sudo-dev/broq" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-5 w-5" />
                View on GitHub
                <Star className="ml-2 h-4 w-4 fill-yellow-400 text-yellow-400" />
              </a>
            </Button>
          </div>

          {/* Quick Social Login - Only show if not authenticated */}
          {isClient && !user && (
            <div className="mt-8 flex flex-col items-center">
              <p className="text-gray-500 text-sm mb-4">Or sign up instantly with:</p>
              <div className="flex gap-4">
                <Button
                  onClick={() => handleSocialLogin('google')}
                  variant="outline"
                  size="sm"
                  className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-full px-6 py-2 font-medium transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>
                <Button
                  onClick={() => handleSocialLogin('github')}
                  variant="outline"
                  size="sm"
                  className="bg-gray-900 hover:bg-gray-800 text-white border border-gray-900 rounded-full px-6 py-2 font-medium transition-all flex items-center gap-2"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </Button>
              </div>
            </div>
          )}
          {/*
          <div className="mt-12 flex justify-center items-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>100+ Builders</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>500+ GitHub Stars</span>
            </div>
          </div> 
          */}
        </div>
      </section>

      {/* Live Preview Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">🧱 Build with Blocks - Live Preview!</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Watch how simple it is to create AI program. No coding required!
            </p>
          </div>

          <Card className="mx-auto max-w-4xl bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl border-0">
            <CardContent className="p-8">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 min-h-[300px] relative overflow-hidden">
                {/* Mock Block Interface */}
                <div className="flex flex-col items-center space-y-6">
                  <div className="text-sm font-medium text-gray-500 mb-4">🎯 Demo Flow: Ask AI Anything</div>

                  {/* Animated Blocks */}
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {demoBlocks.map((block, index) => (
                      <div key={index} className="flex items-center">
                        <div
                          className={`
                            ${block.color} 
                            border-2 rounded-2xl p-4 min-w-[200px] text-center
                            transform transition-all duration-500 hover:scale-105
                            ${currentDemo >= index ? "opacity-100 translate-y-0" : "opacity-50 translate-y-2"}
                          `}
                        >
                          <div className="font-semibold text-gray-800 mb-1">{block.type.toUpperCase()}</div>
                          <div className="text-sm text-gray-600">{block.content}</div>
                        </div>

                        {index < demoBlocks.length - 1 && (
                          <ArrowRight className="h-6 w-6 text-gray-400 mx-2 hidden sm:block" />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 text-center">
                    {user ? (
                      <Button asChild className="bg-green-500 hover:bg-green-600 text-white rounded-full px-6 py-2">
                        <a href="/app">
                          <Play className="mr-2 h-4 w-4" />
                          Run Flow ▶️
                        </a>
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => openAuthModal('signup')}
                        className="bg-green-500 hover:bg-green-600 text-white rounded-full px-6 py-2"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Run Flow ▶️
                      </Button>
                    )}
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute top-4 right-4 text-2xl animate-bounce">🚀</div>
                <div className="absolute bottom-4 left-4 text-2xl animate-pulse">✨</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* What You Can Build Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-white/50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">🎨 What You Can Build</h2>
            <p className="text-xl text-gray-600">
              From simple chatbots to complex AI workflows - the possibilities are endless!
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* AI Lab */}
            <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-blue-100 border-0 rounded-3xl">
              <CardContent className="p-8 text-center">
                <div className="mb-6 flex justify-center">
                  <div className="rounded-full bg-blue-500 p-4 text-white group-hover:scale-110 transition-transform">
                    <Zap className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="mb-4 text-2xl font-bold text-gray-900">🧠 AI Learning Lab</h3>
                <p className="text-gray-600 mb-6">
                  Build experiments to explore how LLMs reason. Create interactive programs that test prompts, logic, and sentiment. Solve challenges with AI and understand it from inside out.
                </p>
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 hover:text-blue-800">
                  Project Based Learning
                </Badge>
              </CardContent>
            </Card>

            {/* Logic Games */}
            <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-purple-50 to-purple-100 border-0 rounded-3xl">
              <CardContent className="p-8 text-center">
                <div className="mb-6 flex justify-center">
                  <div className="rounded-full bg-purple-500 p-4 text-white group-hover:scale-110 transition-transform">
                    <Gamepad2 className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="mb-4 text-2xl font-bold text-gray-900">🧩 Logic Puzzle/Game Designer</h3>
                <p className="text-gray-600 mb-6">
                  Create choose-your-own adventure games, quizzes, and interactive stories with branching AI conversations.
                </p>
                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 hover:text-purple-800">
                  Creative & Design Thinking
                </Badge>
              </CardContent>
            </Card>

            {/* Tweet Bots */}
            <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-green-50 to-green-100 border-0 rounded-3xl">
              <CardContent className="p-8 text-center">
                <div className="mb-6 flex justify-center">
                  <div className="rounded-full bg-green-500 p-4 text-white group-hover:scale-110 transition-transform">
                    <MessageSquare className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="mb-4 text-2xl font-bold text-gray-900">🎓 Classroom AI Challenges</h3>
                <p className="text-gray-600 mb-6">
                  Let students build their own AI flows to solve problems. Create activities like "summarize and fact-check," "detect tone," or "build a tutor" — all with no code.
                </p>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800">
                  Hands-on AI Literacy
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="relative">
            {/* Sticky Note Style Testimonial */}
            <div className="bg-yellow-200 rounded-lg p-8 shadow-lg transform rotate-1 hover:rotate-0 transition-transform duration-300 border-l-4 border-yellow-400">
              <div className="absolute -top-2 -left-2 w-6 h-6 bg-red-400 rounded-full shadow-md"></div>
              <div className="font-handwriting text-lg text-gray-800 mb-4">
                "Broq completely changed how I teach AI to my students! 🎓 Instead of getting lost in code, they're
                building amazing chatbots and logic games in minutes. It's like Scratch but for the AI era!"
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  S
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Sarah Chen</div>
                  <div className="text-sm text-gray-600">CS Professor, Stanford University</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 via-blue-600 to-green-600">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-4xl font-bold text-white sm:text-5xl">Ready to Build Something Amazing? 🚀</h2>
          <p className="mb-8 text-xl text-purple-100">
            Join thousands of creators, educators, and AI enthusiasts who are building the future with visual
            programming blocks!
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row" suppressHydrationWarning>
            {isClient && user ? (
              <Button
                size="lg"
                asChild
                className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <a href="/app">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Go to App 🎉
                </a>
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => isClient ? openAuthModal('signup') : undefined}
                className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Try Broq Now - It's Free! 🎉
              </Button>
            )}
            <a href="https://calendar.app.google/hQWGAkn1S4LhGayD7">
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 text-lg font-semibold rounded-full bg-transparent"
            >
              
                <Bot className="mr-2 h-5 w-5" />
                Try Broq in Your Classroom!
              
            </Button>
            </a>
          </div>

          <div className="mt-8 text-purple-100">
            <p className="text-sm">✨ Build something cool • 🧱 Open source forever • 🚀 Deploy anywhere</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                B
              </div>
              <span className="text-xl font-bold text-white">Broq</span>
              <span className="text-gray-400">- Visual Flow Builder</span>
            </div>

            <div className="flex items-center gap-6 text-gray-400">
              <a href="https://agreeable-idea-6f3.notion.site/Broq-Documentation-2142e0439528805da5cfdd912d41433d" className="hover:text-white transition-colors">
                Documentation
              </a>
              <a href="https://github.com/bloomberg-sudo-dev/broq" className="hover:text-white transition-colors">
                GitHub
              </a>
              <a href="https://discord.gg/py6tw3f28N" className="hover:text-white transition-colors">
                Discord
              </a>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>Built with ❤️ by the open source community. MIT Licensed.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        defaultMode={authMode}
      />

      {/* Auth Redirect Handler */}
      <AuthRedirect />

      {/* Debug Component - Commented out for production */}
      {/* <AuthDebug /> */}
    </div>
  )
}
