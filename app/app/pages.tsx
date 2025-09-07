import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Sun, Moon, Zap, Info } from "lucide-react"

export default function HubermanApp() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="max-w-md mx-auto mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Huberman Protocols</h1>
        <p className="text-gray-600 text-sm">Science-backed daily optimization</p>
      </div>

      {/* Main Protocol Card */}
      <div className="max-w-md mx-auto mb-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                <Sun className="w-3 h-3 mr-1" />
                Morning
              </Badge>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400">
                <Info className="w-4 h-4" />
              </Button>
            </div>
            <CardTitle className="text-xl text-gray-900">Morning Light Exposure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold text-gray-900 mb-1">Get 10-30 minutes of bright light</p>
              <p className="text-sm text-gray-600 italic mb-3">
                Optimizes circadian rhythm and cortisol awakening response
              </p>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-800">
                  <strong>How to:</strong> Face east within 30-60 minutes of waking. No sunglasses. Cloudy days require
                  2x longer exposure.
                </p>
              </div>
            </div>

            <Button className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl h-12 text-base font-medium">
              <CheckCircle className="w-5 h-5 mr-2" />
              Mark Complete
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Today's Protocols */}
      <div className="max-w-md mx-auto space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Today's Protocols</h2>

        <Card className="border border-gray-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Cold Exposure</p>
                <p className="text-xs text-gray-500">2-3 minutes</p>
              </div>
            </div>
            <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <Moon className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Evening Wind-Down</p>
                <p className="text-xs text-gray-500">Dim lights 2 hours before bed</p>
              </div>
            </div>
            <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation Placeholder */}
      <div className="max-w-md mx-auto mt-8 pt-4 border-t border-gray-200">
        <div className="flex justify-center space-x-8 text-gray-400">
          <div className="text-center">
            <div className="w-6 h-6 mx-auto mb-1">📊</div>
            <span className="text-xs">Streaks</span>
          </div>
          <div className="text-center">
            <div className="w-6 h-6 mx-auto mb-1">📚</div>
            <span className="text-xs">Library</span>
          </div>
          <div className="text-center">
            <div className="w-6 h-6 mx-auto mb-1">💡</div>
            <span className="text-xs">Insights</span>
          </div>
        </div>
      </div>
    </div>
  )
}
