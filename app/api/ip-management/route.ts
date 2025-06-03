import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

interface IPManagementRequest {
  ip: string
  action: "block" | "whitelist" | "remove"
  notes?: string
}

// In a real implementation, these would be stored in a database
let blockedIPs: string[] = []
let whitelistedIPs: string[] = []
const ipNotes: Record<string, string> = {}

export async function POST(request: NextRequest) {
  try {
    const data: IPManagementRequest = await request.json()
    const { ip, action, notes } = data

    if (!ip || !action) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Store notes if provided
    if (notes) {
      ipNotes[ip] = notes
    }

    switch (action) {
      case "block":
        // Remove from whitelist if present
        whitelistedIPs = whitelistedIPs.filter((whitelistedIP) => whitelistedIP !== ip)

        // Add to blocklist if not already there
        if (!blockedIPs.includes(ip)) {
          blockedIPs.push(ip)
        }

        return NextResponse.json({
          success: true,
          message: `IP ${ip} has been blocked`,
          blockedIPs,
          whitelistedIPs,
        })

      case "whitelist":
        // Remove from blocklist if present
        blockedIPs = blockedIPs.filter((blockedIP) => blockedIP !== ip)

        // Add to whitelist if not already there
        if (!whitelistedIPs.includes(ip)) {
          whitelistedIPs.push(ip)
        }

        return NextResponse.json({
          success: true,
          message: `IP ${ip} has been whitelisted`,
          blockedIPs,
          whitelistedIPs,
        })

      case "remove":
        // Remove from both lists
        blockedIPs = blockedIPs.filter((blockedIP) => blockedIP !== ip)
        whitelistedIPs = whitelistedIPs.filter((whitelistedIP) => whitelistedIP !== ip)

        return NextResponse.json({
          success: true,
          message: `IP ${ip} has been removed from all lists`,
          blockedIPs,
          whitelistedIPs,
        })

      default:
        return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in IP management:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    blockedIPs,
    whitelistedIPs,
    ipNotes,
  })
}
