"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Network, Activity, Globe, Server, Wifi, AlertTriangle } from "lucide-react"

interface NetworkConnection {
  id: string
  source_ip: string
  destination_ip: string
  port: number
  protocol: string
  status: "active" | "suspicious" | "blocked"
  bytes_transferred: number
  duration: number
}

interface NetworkMonitorProps {
  isMonitoring: boolean
}

export function NetworkMonitor({ isMonitoring }: NetworkMonitorProps) {
  const [connections, setConnections] = useState<NetworkConnection[]>([])
  const [networkStats, setNetworkStats] = useState({
    bandwidth_usage: 65,
    packet_loss: 0.2,
    latency: 12,
    active_connections: 0,
  })

  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(() => {
        generateMockNetworkData()
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [isMonitoring])

  const generateMockNetworkData = () => {
    const mockConnections: NetworkConnection[] = [
      {
        id: "1",
        source_ip: "192.168.1.100",
        destination_ip: "8.8.8.8",
        port: 53,
        protocol: "UDP",
        status: "active",
        bytes_transferred: Math.floor(Math.random() * 10000),
        duration: Math.floor(Math.random() * 300),
      },
      {
        id: "2",
        source_ip: "192.168.1.105",
        destination_ip: "203.0.113.45",
        port: 80,
        protocol: "TCP",
        status: "suspicious",
        bytes_transferred: Math.floor(Math.random() * 50000),
        duration: Math.floor(Math.random() * 600),
      },
      {
        id: "3",
        source_ip: "10.0.0.1",
        destination_ip: "192.168.1.200",
        port: 22,
        protocol: "TCP",
        status: "active",
        bytes_transferred: Math.floor(Math.random() * 5000),
        duration: Math.floor(Math.random() * 120),
      },
      {
        id: "4",
        source_ip: "172.16.0.50",
        destination_ip: "185.199.108.153",
        port: 443,
        protocol: "TCP",
        status: "blocked",
        bytes_transferred: 0,
        duration: 0,
      },
    ]

    setConnections(mockConnections)
    setNetworkStats({
      bandwidth_usage: Math.floor(Math.random() * 40) + 40,
      packet_loss: Math.random() * 2,
      latency: Math.floor(Math.random() * 20) + 5,
      active_connections: mockConnections.filter((c) => c.status === "active").length,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "suspicious":
        return "destructive"
      case "blocked":
        return "secondary"
      default:
        return "default"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Activity className="h-4 w-4 text-green-500" />
      case "suspicious":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "blocked":
        return <Network className="h-4 w-4 text-gray-500" />
      default:
        return <Network className="h-4 w-4" />
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <div className="space-y-6">
      {/* Network Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bandwidth Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkStats.bandwidth_usage}%</div>
            <Progress value={networkStats.bandwidth_usage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Packet Loss</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkStats.packet_loss.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">Acceptable range</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latency</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkStats.latency}ms</div>
            <p className="text-xs text-muted-foreground">Average response time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkStats.active_connections}</div>
            <p className="text-xs text-muted-foreground">Currently monitored</p>
          </CardContent>
        </Card>
      </div>

      {/* Network Connections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Network className="h-5 w-5" />
            <span>Active Network Connections</span>
          </CardTitle>
          <CardDescription>Real-time monitoring of network traffic and connections</CardDescription>
        </CardHeader>
        <CardContent>
          {!isMonitoring ? (
            <div className="text-center py-12">
              <Network className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Monitoring Inactive</h3>
              <p className="text-gray-600 mb-4">Start monitoring to view network connections</p>
              <Button onClick={() => window.location.reload()}>Start Network Monitoring</Button>
            </div>
          ) : connections.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Scanning Network...</h3>
              <p className="text-gray-600">Detecting active connections and traffic patterns</p>
            </div>
          ) : (
            <div className="space-y-4">
              {connections.map((connection) => (
                <div
                  key={connection.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(connection.status)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm">{connection.source_ip}</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-mono text-sm">
                          {connection.destination_ip}:{connection.port}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {connection.protocol}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {formatBytes(connection.bytes_transferred)} transferred • {formatDuration(connection.duration)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusColor(connection.status)}>{connection.status.toUpperCase()}</Badge>
                    {connection.status === "suspicious" && (
                      <Button size="sm" variant="outline">
                        Block IP
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
