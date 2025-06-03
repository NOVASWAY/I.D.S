import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const config = await request.json()

    // In a real implementation, this would save the configuration to your Python backend
    // and update the IDS settings
    console.log("Received configuration:", config)

    // Simulate saving to backend
    return NextResponse.json({
      success: true,
      message: "Configuration saved successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to save configuration" }, { status: 500 })
  }
}

export async function GET() {
  // Return current configuration
  const defaultConfig = {
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
  }

  return NextResponse.json(defaultConfig)
}
