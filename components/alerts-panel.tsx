"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Clock, CheckCircle, Search, Filter, Eye, Lock, Shield } from "lucide-react"
import { IPInvestigation } from "./ip-investigation"
import { useToast } from "@/hooks/use-toast"

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

interface AlertsPanelProps {
  alerts: SecurityAlert[]
  onUpdateAlert: (alerts: SecurityAlert[]) => void
}

export function AlertsPanel({ alerts, onUpdateAlert }: AlertsPanelProps) {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [investigatingIP, setInvestigatingIP] = useState<string | null>(null)
  const [whitelistedIPs, setWhitelistedIPs] = useState<string[]>([])
  const [blockedIPs, setBlockedIPs] = useState<string[]>([])

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.source_ip.includes(searchTerm)

    const matchesType = filterType === "all" || alert.type === filterType
    const matchesStatus = filterStatus === "all" || alert.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  const updateAlertStatus = (alertId: string, newStatus: "active" | "resolved" | "investigating") => {
    const updatedAlerts = alerts.map((alert) => (alert.id === alertId ? { ...alert, status: newStatus } : alert))
    onUpdateAlert(updatedAlerts)
  }

  const handleInvestigateIP = (ip: string) => {
    setInvestigatingIP(ip)

    // Update all alerts from this IP to investigating status
    const updatedAlerts = alerts.map((alert) =>
      alert.source_ip === ip && alert.status === "active" ? { ...alert, status: "investigating" } : alert,
    )
    onUpdateAlert(updatedAlerts)
  }

  const handleBlockIP = (ip: string) => {
    if (!blockedIPs.includes(ip)) {
      setBlockedIPs([...blockedIPs, ip])
    }

    // Update all alerts from this IP to resolved status
    const updatedAlerts = alerts.map((alert) => (alert.source_ip === ip ? { ...alert, status: "resolved" } : alert))
    onUpdateAlert(updatedAlerts)

    // Close investigation panel
    setInvestigatingIP(null)

    toast({
      title: "IP Blocked",
      description: `${ip} has been added to the block list.`,
    })
  }

  const handleWhitelistIP = (ip: string) => {
    if (!whitelistedIPs.includes(ip)) {
      setWhitelistedIPs([...whitelistedIPs, ip])
    }

    // Update all alerts from this IP to resolved status
    const updatedAlerts = alerts.map((alert) => (alert.source_ip === ip ? { ...alert, status: "resolved" } : alert))
    onUpdateAlert(updatedAlerts)

    // Close investigation panel
    setInvestigatingIP(null)

    toast({
      title: "IP Whitelisted",
      description: `${ip} has been added to the whitelist.`,
    })
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "medium":
        return <Clock className="h-4 w-4 text-orange-500" />
      case "low":
        return <CheckCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "destructive"
      case "investigating":
        return "default"
      case "resolved":
        return "secondary"
      default:
        return "default"
    }
  }

  const getPriorityColor = (type: string) => {
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

  const isIPWhitelisted = (ip: string) => whitelistedIPs.includes(ip)
  const isIPBlocked = (ip: string) => blockedIPs.includes(ip)

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search alerts, IPs, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* IP Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Blocked IPs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Lock className="h-4 w-4 mr-2 text-red-500" />
              Blocked IPs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {blockedIPs.length === 0 ? (
              <p className="text-sm text-gray-500">No IPs have been blocked yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {blockedIPs.map((ip) => (
                  <Badge key={ip} variant="destructive">
                    {ip}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Whitelisted IPs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Shield className="h-4 w-4 mr-2 text-green-500" />
              Whitelisted IPs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {whitelistedIPs.length === 0 ? (
              <p className="text-sm text-gray-500">No IPs have been whitelisted yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {whitelistedIPs.map((ip) => (
                  <Badge key={ip} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {ip}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Alerts Found</h3>
                <p className="text-gray-600">
                  {searchTerm || filterType !== "all" || filterStatus !== "all"
                    ? "No alerts match your current filters."
                    : "Your system is secure. No security alerts detected."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card key={alert.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <CardTitle className="text-lg">{alert.title}</CardTitle>
                      <CardDescription className="mt-1">{alert.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getPriorityColor(alert.type)}>{alert.type.toUpperCase()}</Badge>
                    <Badge variant={getStatusColor(alert.status)}>{alert.status.toUpperCase()}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Source IP</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-mono">{alert.source_ip}</p>
                      {isIPWhitelisted(alert.source_ip) && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                          Whitelisted
                        </Badge>
                      )}
                      {isIPBlocked(alert.source_ip) && (
                        <Badge variant="destructive" className="text-xs">
                          Blocked
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Destination IP</p>
                    <p className="text-sm font-mono">{alert.destination_ip}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Detected</p>
                    <p className="text-sm">{new Date(alert.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {alert.status === "active" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleInvestigateIP(alert.source_ip)}
                        className="flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Investigate IP
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => updateAlertStatus(alert.id, "investigating")}>
                        Investigate Alert
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => updateAlertStatus(alert.id, "resolved")}>
                        Mark Resolved
                      </Button>
                    </>
                  )}
                  {alert.status === "investigating" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleInvestigateIP(alert.source_ip)}
                        className="flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Investigation
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => updateAlertStatus(alert.id, "resolved")}>
                        Mark Resolved
                      </Button>
                    </>
                  )}
                  {alert.status === "resolved" && (
                    <Button size="sm" variant="outline" onClick={() => updateAlertStatus(alert.id, "active")}>
                      Reopen
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Investigation Modal */}
      {investigatingIP && (
        <IPInvestigation
          ipAddress={investigatingIP}
          onClose={() => setInvestigatingIP(null)}
          onBlock={handleBlockIP}
          onWhitelist={handleWhitelistIP}
        />
      )}
    </div>
  )
}
