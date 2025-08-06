'use client'

import { useEffect, useState } from 'react'

interface AlgorithmMetrics {
  version: string
  totalSessions: number
  avgCompletionTime: number
  avgResponseTime: number
  avgConfidence: number
  quickDecisionRate: number
  slowDecisionRate: number
}

interface MetricsData {
  aggregated: Record<string, AlgorithmMetrics>
  recentSessions: any[]
  summary: {
    totalSessions: number
    algorithmsInUse: string[]
    bestPerforming: string
  }
}

export default function MetricsDashboard() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/metrics')
      const data = await response.json()
      setMetrics(data)
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 h-64"></div>
              <div className="bg-white rounded-lg p-6 h-64"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-red-500">Failed to load metrics</p>
        </div>
      </div>
    )
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`
  }

  const formatPercentage = (rate: number) => `${(rate * 100).toFixed(1)}%`

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Algorithm Performance Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Sessions</h3>
            <p className="text-3xl font-bold text-gray-900">{metrics.summary.totalSessions}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Algorithms in Use</h3>
            <p className="text-3xl font-bold text-gray-900">{metrics.summary.algorithmsInUse.length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Best Performing</h3>
            <p className="text-2xl font-bold text-green-600">
              {metrics.summary.bestPerforming || 'N/A'}
            </p>
          </div>
        </div>

        {/* Algorithm Comparison */}
        <div className="bg-white rounded-lg p-6 shadow mb-8">
          <h2 className="text-xl font-bold mb-4">Algorithm Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Algorithm</th>
                  <th className="text-center py-2">Sessions</th>
                  <th className="text-center py-2">Avg Completion</th>
                  <th className="text-center py-2">Avg Response</th>
                  <th className="text-center py-2">Confidence</th>
                  <th className="text-center py-2">Quick Decisions</th>
                  <th className="text-center py-2">Slow Decisions</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(metrics.aggregated).map((algo) => (
                  <tr key={algo.version} className="border-b hover:bg-gray-50">
                    <td className="py-3 font-medium">
                      <span className={`px-2 py-1 rounded text-sm ${
                        algo.version === 'advanced' 
                          ? 'bg-blue-100 text-blue-800'
                          : algo.version === 'experimental'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {algo.version}
                      </span>
                    </td>
                    <td className="text-center py-3">{algo.totalSessions}</td>
                    <td className="text-center py-3">{formatTime(algo.avgCompletionTime)}</td>
                    <td className="text-center py-3">{algo.avgResponseTime.toFixed(0)}ms</td>
                    <td className="text-center py-3">
                      <span className={`font-medium ${
                        algo.avgConfidence > 0.7 ? 'text-green-600' :
                        algo.avgConfidence > 0.4 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {(algo.avgConfidence * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-center py-3">{formatPercentage(algo.quickDecisionRate)}</td>
                    <td className="text-center py-3">{formatPercentage(algo.slowDecisionRate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-bold mb-4">Recent Sessions</h2>
          <div className="space-y-2">
            {metrics.recentSessions.slice(0, 10).map((session) => (
              <div key={session.id} className="flex justify-between items-center py-2 border-b">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">{session.id.slice(0, 8)}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    session.algorithmVersion === 'advanced' 
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {session.algorithmVersion}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span>Confidence: {session.confidence ? 
                    `${(session.confidence * 100).toFixed(0)}%` : 'N/A'}</span>
                  <span>Choices: {session.totalChoices || 20}</span>
                  <span className="text-gray-500">
                    {new Date(session.completedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2 text-blue-900">Key Insights</h3>
          <ul className="space-y-2 text-blue-800">
            <li>• The advanced algorithm shows {
              metrics.aggregated['advanced']?.avgConfidence > metrics.aggregated['basic']?.avgConfidence
                ? 'higher' : 'similar'
            } confidence scores compared to basic</li>
            <li>• Users make quick decisions (<2s) about {
              formatPercentage(metrics.aggregated['advanced']?.quickDecisionRate || 0)
            } of the time with the advanced algorithm</li>
            <li>• Average session completion time: {
              formatTime(metrics.aggregated['advanced']?.avgCompletionTime || 0)
            }</li>
          </ul>
        </div>
      </div>
    </div>
  )
}