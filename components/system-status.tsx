"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Activity, Shield, Clock, Server, HardDrive, Cpu, MemoryStick } from "lucide-react"

interface SystemStats {
  total_packets: number
  suspicious_packets: number
  blocked_ips: number
  active_connections: number
  system_uptime: string
  last_scan: string
}

interface SystemStatusProps {
  stats: SystemStats
  isMonitoring: boolean
}

export function SystemStatus({ stats, isMonitoring }: SystemStatusProps) {
  const threatLevel = stats.suspicious_packets > 50 ? "high" : stats.suspicious_packets > 20 ? "medium" : "low"

  const getThreatColor = (level: string) => {
    switch (level) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const systemHealth = 95 - stats.suspicious_packets * 0.5
  const networkLoad = Math.min((stats.active_connections / 1000) * 100, 100)

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Security Status</span>
            </CardTitle>
            <CardDescription>Overall system security health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Threat Level</span>
              <Badge variant={getThreatColor(threatLevel)}>{threatLevel.toUpperCase()}</Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>System Health</span>
                <span>{systemHealth.toFixed(1)}%</span>
              </div>
              <Progress value={systemHealth} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Monitoring Status</p>
                <p className="font-medium">{isMonitoring ? "Active" : "Inactive"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Scan</p>
                <p className="font-medium">{stats.last_scan}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Network Activity</span>
            </CardTitle>
            <CardDescription>Current network traffic and load</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Network Load</span>
                <span>{networkLoad.toFixed(1)}%</span>
              </div>
              <Progress value={networkLoad} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Active Connections</p>
                <p className="font-medium">{stats.active_connections}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Packets/Hour</p>
                <p className="font-medium">{stats.total_packets.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.system_uptime}</div>
            <p className="text-xs text-muted-foreground">Continuous monitoring</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23%</div>
            <Progress value={23} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67%</div>
            <Progress value={67} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45%</div>
            <Progress value={45} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5" />
            <span>Recent System Activity</span>
          </CardTitle>
          <CardDescription>Latest security events and system actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-muted-foreground">2 minutes ago</span>
              <span>Network scan completed - 0 threats detected</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-muted-foreground">5 minutes ago</span>
              <span>Suspicious activity detected from IP 203.0.113.45</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-muted-foreground">8 minutes ago</span>
              <span>Port scan attempt blocked from IP 192.168.1.100</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-muted-foreground">12 minutes ago</span>
              <span>IDS monitoring service started</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
