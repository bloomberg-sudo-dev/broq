"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Play,
  Save,
  FolderOpen,
  Sun,
  Moon,
  Loader2,
} from "lucide-react"
import BlocklyCanvas from "@/components/BlocklyCanvas"
import { BlocklyToolbar } from "@/components/BlocklyToolbar"
import { LoadingScreen } from "@/components/LoadingScreen"
import * as Blockly from "blockly"
import { toast } from "sonner"
import { useTheme } from "next-themes"
// Status types
type FlowStatus = "ready" | "executing" | "complete" | "error"

export default function BroqLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [flowStatus, setFlowStatus] = useState<FlowStatus>("ready")
  const [workspace, setWorkspace] = useState<Blockly.WorkspaceSvg | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showApp, setShowApp] = useState(false)
  const runFlowCallbackRef = useRef<(() => Promise<void>) | null>(null)
  const { theme, setTheme } = useTheme()

  const loadingDuration = 2500

  // Hide loading screen and show app with fade-in
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      // Small delay to let loading screen start fading out
      setTimeout(() => {
        setShowApp(true)
      }, 200)
    }, loadingDuration)

    return () => clearTimeout(timer)
  }, [])



  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Save flow as JSON
  const saveFlow = () => {
    if (!workspace) {
      toast.error("No workspace available to save")
      return
    }

    try {
      // Get the workspace state as XML
      const xml = Blockly.Xml.workspaceToDom(workspace)
      const xmlText = Blockly.Xml.domToText(xml)
      
      // Create flow data object
      const flowData = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        workspace: xmlText,
        metadata: {
          blockCount: workspace.getAllBlocks().length,
          name: `Flow_${new Date().toLocaleDateString().replace(/\//g, '-')}`
        }
      }

      // Create and download JSON file
      const jsonString = JSON.stringify(flowData, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `${flowData.metadata.name}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success("Flow saved successfully!")
    } catch (error) {
      console.error("Error saving flow:", error)
      toast.error("Failed to save flow")
    }
  }

  // Load flow from JSON
  const loadFlow = () => {
    if (!workspace) {
      toast.error("No workspace available to load into")
      return
    }

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const jsonContent = e.target?.result as string
          const flowData = JSON.parse(jsonContent)
          
          // Validate the flow data structure
          if (!flowData.workspace || !flowData.version) {
            toast.error("Invalid flow file format")
            return
          }

          // Clear current workspace and ensure it's ready
          workspace.clear()
          
          // Small delay to ensure workspace is cleared
          setTimeout(() => {
            try {
              // Load the workspace from XML
              const xml = Blockly.utils.xml.textToDom(flowData.workspace)
              Blockly.Xml.domToWorkspace(xml, workspace)
              
              // Force re-render of all blocks
              const allBlocks = workspace.getAllBlocks()
              allBlocks.forEach(block => {
                if (block.rendered) {
                  block.render()
                }
              })
              
              // Refresh the workspace display
              workspace.refreshToolboxSelection()
              workspace.resizeContents()
              
              // Center and zoom to fit all blocks
              workspace.scrollCenter()
              
              // Zoom to fit content if there are blocks
              if (allBlocks.length > 0) {
                workspace.zoomToFit()
              }
              
              toast.success(`Flow "${flowData.metadata?.name || 'Unnamed'}" loaded successfully!`)
            } catch (renderError) {
              console.error("Error rendering loaded flow:", renderError)
              toast.error("Flow loaded but may not display correctly")
            }
          }, 100)
        } catch (error) {
          console.error("Error loading flow:", error)
          toast.error("Failed to load flow - invalid JSON format")
        }
      }
      
      reader.readAsText(file)
    }
    
    input.click()
  }

  const handleRunFlow = async () => {
    if (runFlowCallbackRef.current && typeof runFlowCallbackRef.current === 'function') {
      try {
        await runFlowCallbackRef.current()
      } catch (error) {
        console.error('Flow execution error:', error)
      }
    } else {
      toast.error("Flow execution not ready")
    }
  }

  return (
    <>
      <LoadingScreen isVisible={isLoading} duration={loadingDuration} />
      {showApp && (
        <div className="flex h-screen bg-slate-100 dark:bg-slate-950 app-fade-in">
      {/* Top Bar - Continuous across entire width */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-4 bg-white border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800 app-fade-in-delay-1">
        <div className="flex items-center gap-4">
          <a 
            href="https://broq-home.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">broq.</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Visual Flow Builder</p>
            </div>
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            asChild
            className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 font-medium"
          >
            <a
              href="https://agreeable-idea-6f3.notion.site/Broq-Documentation-2142e0439528805da5cfdd912d41433d"
              target="_blank"
              rel="noopener noreferrer"
            >
              Documentation
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="dark:text-slate-400 dark:hover:text-slate-300"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-3 font-semibold transition-all duration-200 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            onClick={handleRunFlow}
            disabled={isExecuting}
          >
            {isExecuting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Flow
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Left Sidebar */}
      <div
        className={`w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transform transition-transform duration-200 pt-20 flex flex-col app-fade-in-delay-1 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col p-4">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Add Blocks</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Click to add blocks to your flow</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <BlocklyToolbar workspace={workspace} />
        </div>
        
        {/* Flow Management Section */}
        <div className="px-4 pb-4">
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Flow Management</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Save, share, and import flows</p>
          </div>
          <div className="flex flex-col gap-2">
            <button 
              onClick={saveFlow}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-white hover:bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 transition-colors duration-200"
            >
              <Save className="w-5 h-5" />
              <span>Quick Save</span>
            </button>
            <button 
              onClick={loadFlow}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-white hover:bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 transition-colors duration-200"
            >
              <FolderOpen className="w-5 h-5" />
              <span>Quick Load</span>
            </button>
          </div>
        </div>
        
        {/* Quick Tip Callout - At bottom */}
        <div className="mx-4 mb-4 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 dark:text-blue-400 text-sm">💡</span>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-sm mb-1">Quick tip</h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">
                Drag blocks onto the canvas to start building your AI flow. Each block can send data to the next — just snap them together!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden pt-20 app-fade-in-delay-2">
        {/* Canvas Area */}
        <div className="flex-1 overflow-hidden">
          <BlocklyCanvas 
            onWorkspaceChange={setWorkspace} 
            onRunFlowReady={(callback) => { runFlowCallbackRef.current = callback }}
            onExecutionStateChange={setIsExecuting}
          />
        </div>
      </div>
    </div>
      )}
    </>
  )
}
