"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Shield, Activity, Network, Eye, Settings } from "lucide-react"
import { AlertsPanel } from "@/components/alerts-panel"
import { NetworkMonitor } from "@/components/network-monitor"
import { SystemStatus } from "@/components/system-status"
import { ConfigPanel } from "@/components/config-panel"

interface SecurityAlert {
  id: string
  type: "high" | "medium" | "low"
  title: string
  description: string
  timestamp: string
  source_ip: string
  destination_ip: string
  status: "active" | "resolved" | "investigating"
}

interface SystemStats {
  total_packets: number
  suspicious_packets: number
  blocked_ips: number
  active_connections: number
  system_uptime: string
  last_scan: string
}

export default function IDSDashboard() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([])
  const [systemStats, setSystemStats] = useState<SystemStats>({
    total_packets: 0,
    suspicious_packets: 0,
    blocked_ips: 0,
    active_connections: 0,
    system_uptime: "0h 0m",
    last_scan: "Never",
  })
  const [isMonitoring, setIsMonitoring] = useState(false)

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate fetching data from backend
      fetchSystemData()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const fetchSystemData = async () => {
    try {
      // In a real implementation, this would call your Python backend API
      const response = await fetch("/api/system-status")
      if (response.ok) {
        const data = await response.json()
        setSystemStats(data.stats)
        setAlerts(data.alerts)
      }
    } catch (error) {
      console.error("Failed to fetch system data:", error)
      // Simulate data for demo
      simulateData()
    }
  }

  const simulateData = () => {
    const mockAlerts: SecurityAlert[] = [
      {
        id: "1",
        type: "high",
        title: "Suspicious Port Scan Detected",
        description: "Multiple port scan attempts from external IP",
        timestamp: new Date().toISOString(),
        source_ip: "192.168.1.100",
        destination_ip: "10.0.0.1",
        status: "active",
      },
      {
        id: "2",
        type: "medium",
        title: "Unusual Traffic Pattern",
        description: "High volume of traffic detected from single source",
        timestamp: new Date(Date.now() - 300000).toISOString(),
        source_ip: "203.0.113.45",
        destination_ip: "10.0.0.5",
        status: "investigating",
      },
    ]

    const mockStats: SystemStats = {
      total_packets: Math.floor(Math.random() * 10000) + 50000,
      suspicious_packets: Math.floor(Math.random() * 100) + 10,
      blocked_ips: Math.floor(Math.random() * 20) + 5,
      active_connections: Math.floor(Math.random() * 500) + 100,
      system_uptime: "2h 34m",
      last_scan: new Date().toLocaleTimeString(),
    }

    setAlerts(mockAlerts)
    setSystemStats(mockStats)
  }

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring)
    // In real implementation, this would start/stop the Python monitoring service
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "default"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Intrusion Detection System</h1>
              <p className="text-gray-600">Real-time network security monitoring</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant={isMonitoring ? "default" : "secondary"} className="px-3 py-1">
              {isMonitoring ? "Monitoring Active" : "Monitoring Inactive"}
            </Badge>
            <Button onClick={toggleMonitoring} variant={isMonitoring ? "destructive" : "default"}>
              {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
            </Button>
          </div>
        </div>

        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Packets</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.total_packets.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Last hour</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suspicious Activity</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{systemStats.suspicious_packets}</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
              <Shield className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{systemStats.blocked_ips}</div>
              <p className="text-xs text-muted-foreground">Auto-blocked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
              <Network className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{systemStats.active_connections}</div>
              <p className="text-xs text-muted-foreground">Currently monitored</p>
            </CardContent>
          </Card>
        </div>

        {/* Active Alerts */}
        {alerts.filter((alert) => alert.status === "active").length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Active Security Alerts</AlertTitle>
            <AlertDescription className="text-red-700">
              {alerts.filter((alert) => alert.status === "active").length} active security threats detected. Review the
              alerts tab for details.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="network" className="flex items-center space-x-2">
              <Network className="h-4 w-4" />
              <span>Network</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <SystemStatus stats={systemStats} isMonitoring={isMonitoring} />
          </TabsContent>

          <TabsContent value="alerts">
            <AlertsPanel alerts={alerts} onUpdateAlert={setAlerts} />
          </TabsContent>

          <TabsContent value="network">
            <NetworkMonitor isMonitoring={isMonitoring} />
          </TabsContent>

          <TabsContent value="settings">
            <ConfigPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
