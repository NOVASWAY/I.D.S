import { NextResponse } from "next/server"

export async function GET() {
  // In a real implementation, this would fetch data from your Python backend
  // For now, we'll return mock data

  const mockData = {
    stats: {
      total_packets: Math.floor(Math.random() * 10000) + 50000,
      suspicious_packets: Math.floor(Math.random() * 100) + 10,
      blocked_ips: Math.floor(Math.random() * 20) + 5,
      active_connections: Math.floor(Math.random() * 500) + 100,
      system_uptime: "2h 34m",
      last_scan: new Date().toLocaleTimeString(),
    },
    alerts: [
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
    ],
  }

  return NextResponse.json(mockData)
}
