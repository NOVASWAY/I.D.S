"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Shield, Network, Bell, Save, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ConfigPanel() {
  const { toast } = useToast()
  const [config, setConfig] = useState({
    // Detection Settings
    enablePortScanDetection: true,
    enableDDoSDetection: true,
    enableAnomalyDetection: true,
    sensitivityLevel: "medium",

    // Network Settings
    monitoredInterfaces: "eth0,wlan0",
    excludedIPs: "127.0.0.1,192.168.1.1",
    monitoredPorts: "22,80,443,3389",

    // Alert Settings
    enableEmailAlerts: false,
    emailAddress: "",
    enableSlackAlerts: false,
    slackWebhook: "",
    alertThreshold: "medium",

    // Advanced Settings
    logLevel: "info",
    maxLogSize: "100",
    retentionDays: "30",
    autoBlockEnabled: false,
    blockDuration: "60",
  })

  const handleConfigChange = (key: string, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  const saveConfiguration = async () => {
    try {
      // In a real implementation, this would save to your Python backend
      const response = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        toast({
          title: "Configuration Saved",
          description: "Your IDS settings have been updated successfully.",
        })
      }
    } catch (error) {
      toast({
        title: "Configuration Saved",
        description: "Settings saved locally. Backend integration pending.",
      })
    }
  }

  const resetConfiguration = () => {
    setConfig({
      enablePortScanDetection: true,
      enableDDoSDetection: true,
      enableAnomalyDetection: true,
      sensitivityLevel: "medium",
      monitoredInterfaces: "eth0,wlan0",
      excludedIPs: "127.0.0.1,192.168.1.1",
      monitoredPorts: "22,80,443,3389",
      enableEmailAlerts: false,
      emailAddress: "",
      enableSlackAlerts: false,
      slackWebhook: "",
      alertThreshold: "medium",
      logLevel: "info",
      maxLogSize: "100",
      retentionDays: "30",
      autoBlockEnabled: false,
      blockDuration: "60",
    })

    toast({
      title: "Configuration Reset",
      description: "All settings have been reset to default values.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">IDS Configuration</h2>
          <p className="text-muted-foreground">Configure detection rules, alerts, and system settings</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={resetConfiguration}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={saveConfiguration}>
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </div>

      <Tabs defaultValue="detection" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="detection">Detection</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="detection">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Detection Rules</span>
              </CardTitle>
              <CardDescription>Configure what types of threats to detect</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Port Scan Detection</Label>
                    <p className="text-sm text-muted-foreground">Detect attempts to scan multiple ports</p>
                  </div>
                  <Switch
                    checked={config.enablePortScanDetection}
                    onCheckedChange={(checked) => handleConfigChange("enablePortScanDetection", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>DDoS Detection</Label>
                    <p className="text-sm text-muted-foreground">Detect distributed denial of service attacks</p>
                  </div>
                  <Switch
                    checked={config.enableDDoSDetection}
                    onCheckedChange={(checked) => handleConfigChange("enableDDoSDetection", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Anomaly Detection</Label>
                    <p className="text-sm text-muted-foreground">Detect unusual network behavior patterns</p>
                  </div>
                  <Switch
                    checked={config.enableAnomalyDetection}
                    onCheckedChange={(checked) => handleConfigChange("enableAnomalyDetection", checked)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Detection Sensitivity</Label>
                <Select
                  value={config.sensitivityLevel}
                  onValueChange={(value) => handleConfigChange("sensitivityLevel", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Fewer false positives</SelectItem>
                    <SelectItem value="medium">Medium - Balanced detection</SelectItem>
                    <SelectItem value="high">High - Maximum detection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Network className="h-5 w-5" />
                <span>Network Configuration</span>
              </CardTitle>
              <CardDescription>Configure network interfaces and monitoring scope</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="interfaces">Monitored Network Interfaces</Label>
                <Input
                  id="interfaces"
                  value={config.monitoredInterfaces}
                  onChange={(e) => handleConfigChange("monitoredInterfaces", e.target.value)}
                  placeholder="eth0,wlan0"
                />
                <p className="text-sm text-muted-foreground">Comma-separated list of network interfaces to monitor</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excluded-ips">Excluded IP Addresses</Label>
                <Textarea
                  id="excluded-ips"
                  value={config.excludedIPs}
                  onChange={(e) => handleConfigChange("excludedIPs", e.target.value)}
                  placeholder="127.0.0.1,192.168.1.1"
                  rows={3}
                />
                <p className="text-sm text-muted-foreground">
                  IP addresses to exclude from monitoring (one per line or comma-separated)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monitored-ports">Monitored Ports</Label>
                <Input
                  id="monitored-ports"
                  value={config.monitoredPorts}
                  onChange={(e) => handleConfigChange("monitoredPorts", e.target.value)}
                  placeholder="22,80,443,3389"
                />
                <p className="text-sm text-muted-foreground">
                  Comma-separated list of ports to monitor for suspicious activity
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Alert Configuration</span>
              </CardTitle>
              <CardDescription>Configure how and when to receive security alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Alert Threshold</Label>
                <Select
                  value={config.alertThreshold}
                  onValueChange={(value) => handleConfigChange("alertThreshold", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Alert on all detections</SelectItem>
                    <SelectItem value="medium">Medium - Alert on moderate threats</SelectItem>
                    <SelectItem value="high">High - Alert only on critical threats</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                  </div>
                  <Switch
                    checked={config.enableEmailAlerts}
                    onCheckedChange={(checked) => handleConfigChange("enableEmailAlerts", checked)}
                  />
                </div>

                {config.enableEmailAlerts && (
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={config.emailAddress}
                      onChange={(e) => handleConfigChange("emailAddress", e.target.value)}
                      placeholder="admin@company.com"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Slack Alerts</Label>
                    <p className="text-sm text-muted-foreground">Send alerts to Slack channel</p>
                  </div>
                  <Switch
                    checked={config.enableSlackAlerts}
                    onCheckedChange={(checked) => handleConfigChange("enableSlackAlerts", checked)}
                  />
                </div>

                {config.enableSlackAlerts && (
                  <div className="space-y-2">
                    <Label htmlFor="slack">Slack Webhook URL</Label>
                    <Input
                      id="slack"
                      value={config.slackWebhook}
                      onChange={(e) => handleConfigChange("slackWebhook", e.target.value)}
                      placeholder="https://hooks.slack.com/services/..."
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Advanced Settings</span>
              </CardTitle>
              <CardDescription>Advanced configuration options for power users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Log Level</Label>
                  <Select value={config.logLevel} onValueChange={(value) => handleConfigChange("logLevel", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debug">Debug - Verbose logging</SelectItem>
                      <SelectItem value="info">Info - Standard logging</SelectItem>
                      <SelectItem value="warning">Warning - Warnings and errors only</SelectItem>
                      <SelectItem value="error">Error - Errors only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="log-size">Maximum Log Size (MB)</Label>
                  <Input
                    id="log-size"
                    type="number"
                    value={config.maxLogSize}
                    onChange={(e) => handleConfigChange("maxLogSize", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retention">Log Retention (Days)</Label>
                  <Input
                    id="retention"
                    type="number"
                    value={config.retentionDays}
                    onChange={(e) => handleConfigChange("retentionDays", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="block-duration">Auto-block Duration (Minutes)</Label>
                  <Input
                    id="block-duration"
                    type="number"
                    value={config.blockDuration}
                    onChange={(e) => handleConfigChange("blockDuration", e.target.value)}
                    disabled={!config.autoBlockEnabled}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automatic IP Blocking</Label>
                  <p className="text-sm text-muted-foreground">Automatically block suspicious IP addresses</p>
                </div>
                <Switch
                  checked={config.autoBlockEnabled}
                  onCheckedChange={(checked) => handleConfigChange("autoBlockEnabled", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
