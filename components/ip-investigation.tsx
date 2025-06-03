"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Shield, Clock, CheckCircle, X, Search, Globe, Activity, Lock, Unlock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface IPActivity {
  timestamp: string
  action: string
  details: string
  severity: "high" | "medium" | "low" | "info"
}

interface IPInvestigationProps {
  ipAddress: string
  onClose: () => void
  onBlock: (ip: string) => void
  onWhitelist: (ip: string) => void
}

export function IPInvestigation({ ipAddress, onClose, onBlock, onWhitelist }: IPInvestigationProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [ipInfo, setIpInfo] = useState<any>(null)
  const [activityHistory, setActivityHistory] = useState<IPActivity[]>([])
  const [investigationNotes, setInvestigationNotes] = useState("")
  const [investigationStatus, setInvestigationStatus] = useState<"pending" | "in-progress" | "completed">("pending")
  const [ipClassification, setIpClassification] = useState<"unknown" | "malicious" | "benign">("unknown")
  const [whoisData, setWhoisData] = useState<string>("")

  useEffect(() => {
    // In a real implementation, this would fetch data from your backend
    fetchIPInformation()
  }, [ipAddress])

  const fetchIPInformation = async () => {
    setLoading(true)
    try {
      // Simulate API call to get IP information
      // In a real implementation, this would call your Python backend
      setTimeout(() => {
        // Mock data for demonstration
        const mockIpInfo = {
          ip: ipAddress,
          location: "United States",
          asn: "AS15169 Google LLC",
          isp: "Google LLC",
          first_seen: "2023-05-15T14:23:45Z",
          last_seen: new Date().toISOString(),
          total_connections: 156,
          suspicious_activity_count: 12,
          ports_accessed: [80, 443, 22, 25, 8080],
          current_status: "under investigation",
        }

        const mockActivityHistory: IPActivity[] = [
          {
            timestamp: new Date().toISOString(),
            action: "Port Scan Detected",
            details: "Attempted to scan ports 20-30",
            severity: "high",
          },
          {
            timestamp: new Date(Date.now() - 300000).toISOString(),
            action: "Connection Established",
            details: "Connected to internal server 10.0.0.5:443",
            severity: "info",
          },
          {
            timestamp: new Date(Date.now() - 600000).toISOString(),
            action: "Failed Login Attempt",
            details: "Multiple failed SSH login attempts",
            severity: "medium",
          },
          {
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            action: "DNS Query",
            details: "Unusual DNS query pattern detected",
            severity: "low",
          },
        ]

        const mockWhoisData = `Domain Name: EXAMPLE.COM
Registry Domain ID: 2336799_DOMAIN_COM-VRSN
Registrar WHOIS Server: whois.example.com
Registrar URL: http://www.example.com
Updated Date: 2022-08-02T07:57:55Z
Creation Date: 1995-08-14T04:00:00Z
Registrar Registration Expiration Date: 2023-08-13T04:00:00Z
Registrar: Example Registrar, LLC
Registrar IANA ID: 1234
Registrar Abuse Contact Email: abuse@example.com
Registrar Abuse Contact Phone: +1.2345678900
Domain Status: clientDeleteProhibited
Domain Status: clientTransferProhibited
Domain Status: clientUpdateProhibited
Registry Registrant ID: 
Registrant Name: REDACTED FOR PRIVACY
Registrant Organization: REDACTED FOR PRIVACY
Registrant Street: REDACTED FOR PRIVACY
Registrant City: REDACTED FOR PRIVACY
Registrant State/Province: REDACTED FOR PRIVACY
Registrant Postal Code: REDACTED FOR PRIVACY
Registrant Country: REDACTED FOR PRIVACY
Registrant Phone: REDACTED FOR PRIVACY
Registrant Email: Please query the RDDS service of the Registrar of Record identified in this output for information on how to contact the Registrant, Admin, or Tech contact of the queried domain name.`

        setIpInfo(mockIpInfo)
        setActivityHistory(mockActivityHistory)
        setWhoisData(mockWhoisData)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Error fetching IP information:", error)
      toast({
        title: "Error",
        description: "Failed to fetch IP information. Please try again.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const handleSaveNotes = () => {
    // In a real implementation, this would save notes to your backend
    toast({
      title: "Notes Saved",
      description: "Investigation notes have been saved successfully.",
    })
  }

  const handleUpdateStatus = (status: "pending" | "in-progress" | "completed") => {
    setInvestigationStatus(status)
    // In a real implementation, this would update status in your backend
    toast({
      title: "Status Updated",
      description: `Investigation status changed to ${status}.`,
    })
  }

  const handleClassifyIP = (classification: "malicious" | "benign") => {
    setIpClassification(classification)
    // In a real implementation, this would update classification in your backend
    toast({
      title: "IP Classified",
      description: `IP has been classified as ${classification}.`,
    })
  }

  const handleBlock = () => {
    onBlock(ipAddress)
    toast({
      title: "IP Blocked",
      description: `${ipAddress} has been added to the block list.`,
    })
  }

  const handleWhitelist = () => {
    onWhitelist(ipAddress)
    toast({
      title: "IP Whitelisted",
      description: `${ipAddress} has been added to the whitelist.`,
    })
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "medium":
        return <Clock className="h-4 w-4 text-orange-500" />
      case "low":
        return <Shield className="h-4 w-4 text-yellow-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-blue-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold flex items-center">
            <Search className="h-5 w-5 mr-2" />
            IP Investigation: {ipAddress}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading IP information...</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Globe className="h-5 w-5 mr-2" />
                      IP Information
                    </CardTitle>
                    <CardDescription>Details about the IP address and its activity</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Location</p>
                        <p>{ipInfo.location}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">ISP/ASN</p>
                        <p>{ipInfo.asn}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">First Seen</p>
                        <p>{new Date(ipInfo.first_seen).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Last Seen</p>
                        <p>{new Date(ipInfo.last_seen).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Connections</p>
                        <p>{ipInfo.total_connections}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Suspicious Activities</p>
                        <p className="text-red-600 font-medium">{ipInfo.suspicious_activity_count}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Ports Accessed</p>
                      <div className="flex flex-wrap gap-2">
                        {ipInfo.ports_accessed.map((port: number) => (
                          <Badge key={port} variant="outline">
                            {port}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Investigation Status</p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant={investigationStatus === "pending" ? "default" : "outline"}
                          onClick={() => handleUpdateStatus("pending")}
                        >
                          Pending
                        </Button>
                        <Button
                          size="sm"
                          variant={investigationStatus === "in-progress" ? "default" : "outline"}
                          onClick={() => handleUpdateStatus("in-progress")}
                        >
                          In Progress
                        </Button>
                        <Button
                          size="sm"
                          variant={investigationStatus === "completed" ? "default" : "outline"}
                          onClick={() => handleUpdateStatus("completed")}
                        >
                          Completed
                        </Button>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">IP Classification</p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant={ipClassification === "malicious" ? "destructive" : "outline"}
                          onClick={() => handleClassifyIP("malicious")}
                        >
                          <Lock className="h-4 w-4 mr-1" />
                          Malicious
                        </Button>
                        <Button
                          size="sm"
                          variant={ipClassification === "benign" ? "default" : "outline"}
                          onClick={() => handleClassifyIP("benign")}
                        >
                          <Unlock className="h-4 w-4 mr-1" />
                          Benign
                        </Button>
                      </div>
                    </div>

                    <div className="pt-4">
                      <p className="text-sm font-medium text-gray-500 mb-2">Actions</p>
                      <div className="flex flex-col gap-2">
                        <Button variant="destructive" onClick={handleBlock}>
                          <Lock className="h-4 w-4 mr-2" />
                          Block IP
                        </Button>
                        <Button variant="outline" onClick={handleWhitelist}>
                          <Shield className="h-4 w-4 mr-2" />
                          Whitelist IP
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="p-4">
              <Tabs defaultValue="activity">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="activity">Activity History</TabsTrigger>
                  <TabsTrigger value="whois">WHOIS Data</TabsTrigger>
                  <TabsTrigger value="notes">Investigation Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="activity" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Activity Timeline</CardTitle>
                      <CardDescription>Recent activities from this IP address</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {activityHistory.map((activity, index) => (
                          <div key={index} className="flex items-start space-x-3 pb-4 border-b last:border-0">
                            <div className="mt-0.5">{getSeverityIcon(activity.severity)}</div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="font-medium">{activity.action}</div>
                                <Badge variant={getSeverityColor(activity.severity)}>
                                  {activity.severity.toUpperCase()}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(activity.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="whois" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>WHOIS Information</CardTitle>
                      <CardDescription>Domain registration information</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-sm font-mono whitespace-pre-wrap">
                        {whoisData}
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="notes" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Investigation Notes</CardTitle>
                      <CardDescription>Document your findings about this IP</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="notes">Notes</Label>
                          <Textarea
                            id="notes"
                            placeholder="Enter your investigation notes here..."
                            value={investigationNotes}
                            onChange={(e) => setInvestigationNotes(e.target.value)}
                            rows={8}
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button onClick={handleSaveNotes}>Save Notes</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
