#!/usr/bin/env python3
"""
Network Traffic Monitor for Intrusion Detection System
Monitors network packets and detects suspicious activities
"""

import socket
import struct
import time
import json
import threading
from datetime import datetime
from collections import defaultdict, deque
import ipaddress

class NetworkMonitor:
    def __init__(self):
        self.packet_count = 0
        self.suspicious_packets = 0
        self.connection_tracker = defaultdict(list)
        self.port_scan_tracker = defaultdict(set)
        self.traffic_history = deque(maxlen=1000)
        self.blocked_ips = set()
        self.whitelisted_ips = set()  # New: Track whitelisted IPs
        self.alerts = []
        self.ip_investigation_data = {}  # New: Store investigation data for IPs
        
        # Configuration
        self.config = {
            'port_scan_threshold': 10,  # Number of different ports to trigger alert
            'ddos_threshold': 100,      # Packets per second to trigger DDoS alert
            'monitoring_enabled': True,
            'auto_block': False
        }
        
    def parse_ip_header(self, packet):
        """Parse IP header from raw packet"""
        try:
            # Unpack the first 20 bytes of IP header
            ip_header = packet[0:20]
            iph = struct.unpack('!BBHHHBBH4s4s', ip_header)
            
            version_ihl = iph[0]
            version = version_ihl >> 4
            ihl = version_ihl & 0xF
            
            iph_length = ihl * 4
            ttl = iph[5]
            protocol = iph[6]
            s_addr = socket.inet_ntoa(iph[8])
            d_addr = socket.inet_ntoa(iph[9])
            
            return {
                'version': version,
                'header_length': iph_length,
                'ttl': ttl,
                'protocol': protocol,
                'source_ip': s_addr,
                'destination_ip': d_addr
            }
        except Exception as e:
            print(f"Error parsing IP header: {e}")
            return None
    
    def parse_tcp_header(self, packet, ip_header_length):
        """Parse TCP header from packet"""
        try:
            tcp_header = packet[ip_header_length:ip_header_length+20]
            tcph = struct.unpack('!HHLLBBHHH', tcp_header)
            
            source_port = tcph[0]
            dest_port = tcph[1]
            sequence = tcph[2]
            acknowledgement = tcph[3]
            doff_reserved = tcph[4]
            tcph_length = (doff_reserved >> 4) * 4
            flags = tcph[5]
            
            return {
                'source_port': source_port,
                'destination_port': dest_port,
                'sequence': sequence,
                'acknowledgement': acknowledgement,
                'header_length': tcph_length,
                'flags': flags
            }
        except Exception as e:
            print(f"Error parsing TCP header: {e}")
            return None
    
    def detect_port_scan(self, source_ip, dest_port):
        """Detect potential port scanning activity"""
        # Skip detection for whitelisted IPs
        if source_ip in self.whitelisted_ips:
            return False
            
        current_time = time.time()
        
        # Track ports accessed by this IP
        self.port_scan_tracker[source_ip].add(dest_port)
        
        # Check if this IP has accessed too many different ports
        if len(self.port_scan_tracker[source_ip]) > self.config['port_scan_threshold']:
            alert = {
                'id': f"ps_{int(current_time)}",
                'type': 'high',
                'title': 'Port Scan Detected',
                'description': f'IP {source_ip} has accessed {len(self.port_scan_tracker[source_ip])} different ports',
                'timestamp': datetime.now().isoformat(),
                'source_ip': source_ip,
                'destination_ip': 'multiple',
                'status': 'active'
            }
            self.alerts.append(alert)
            self.suspicious_packets += 1
            
            # Track investigation data
            if source_ip not in self.ip_investigation_data:
                self.ip_investigation_data[source_ip] = {
                    'first_seen': datetime.now().isoformat(),
                    'activities': [],
                    'ports_accessed': list(self.port_scan_tracker[source_ip]),
                    'classification': 'unknown',
                    'notes': ''
                }
            
            self.ip_investigation_data[source_ip]['activities'].append({
                'timestamp': datetime.now().isoformat(),
                'action': 'Port Scan Detected',
                'details': f'Accessed {len(self.port_scan_tracker[source_ip])} different ports',
                'severity': 'high'
            })
            
            if self.config['auto_block'] and source_ip not in self.whitelisted_ips:
                self.blocked_ips.add(source_ip)
                print(f"Auto-blocked IP: {source_ip}")
            
            return True
        return False
    
    def detect_ddos(self, source_ip):
        """Detect potential DDoS attacks"""
        # Skip detection for whitelisted IPs
        if source_ip in self.whitelisted_ips:
            return False
            
        current_time = time.time()
        
        # Count packets from this IP in the last second
        recent_packets = [t for t in self.connection_tracker[source_ip] 
                         if current_time - t < 1.0]
        
        if len(recent_packets) > self.config['ddos_threshold']:
            alert = {
                'id': f"ddos_{int(current_time)}",
                'type': 'high',
                'title': 'DDoS Attack Detected',
                'description': f'IP {source_ip} sent {len(recent_packets)} packets in 1 second',
                'timestamp': datetime.now().isoformat(),
                'source_ip': source_ip,
                'destination_ip': 'multiple',
                'status': 'active'
            }
            self.alerts.append(alert)
            self.suspicious_packets += 1
            
            # Track investigation data
            if source_ip not in self.ip_investigation_data:
                self.ip_investigation_data[source_ip] = {
                    'first_seen': datetime.now().isoformat(),
                    'activities': [],
                    'ports_accessed': [],
                    'classification': 'unknown',
                    'notes': ''
                }
            
            self.ip_investigation_data[source_ip]['activities'].append({
                'timestamp': datetime.now().isoformat(),
                'action': 'DDoS Attack Detected',
                'details': f'Sent {len(recent_packets)} packets in 1 second',
                'severity': 'high'
            })
            
            if self.config['auto_block'] and source_ip not in self.whitelisted_ips:
                self.blocked_ips.add(source_ip)
                print(f"Auto-blocked IP for DDoS: {source_ip}")
            
            return True
        return False
    
    def analyze_packet(self, packet):
        """Analyze individual packet for threats"""
        self.packet_count += 1
        current_time = time.time()
        
        # Parse IP header
        ip_info = self.parse_ip_header(packet)
        if not ip_info:
            return
        
        source_ip = ip_info['source_ip']
        dest_ip = ip_info['destination_ip']
        
        # Skip if IP is blocked
        if source_ip in self.blocked_ips:
            return
            
        # Skip threat detection for whitelisted IPs
        if source_ip in self.whitelisted_ips:
            # Still track connections for whitelisted IPs
            self.connection_tracker[source_ip].append(current_time)
            return
        
        # Track connection timing
        self.connection_tracker[source_ip].append(current_time)
        
        # Clean old entries (keep only last 60 seconds)
        self.connection_tracker[source_ip] = [
            t for t in self.connection_tracker[source_ip] 
            if current_time - t < 60
        ]
        
        # Analyze TCP packets
        if ip_info['protocol'] == 6:  # TCP
            tcp_info = self.parse_tcp_header(packet, ip_info['header_length'])
            if tcp_info:
                dest_port = tcp_info['destination_port']
                
                # Check for port scanning
                self.detect_port_scan(source_ip, dest_port)
                
                # Check for DDoS
                self.detect_ddos(source_ip)
                
                # Log traffic
                traffic_entry = {
                    'timestamp': current_time,
                    'source_ip': source_ip,
                    'dest_ip': dest_ip,
                    'dest_port': dest_port,
                    'protocol': 'TCP',
                    'flags': tcp_info['flags']
                }
                self.traffic_history.append(traffic_entry)
                
                # Update investigation data
                if source_ip in self.ip_investigation_data:
                    if dest_port not in self.ip_investigation_data[source_ip].get('ports_accessed', []):
                        self.ip_investigation_data[source_ip]['ports_accessed'].append(dest_port)
    
    def block_ip(self, ip):
        """Block an IP address"""
        if ip in self.whitelisted_ips:
            print(f"Cannot block whitelisted IP: {ip}")
            return False
            
        if ip not in self.blocked_ips:
            self.blocked_ips.add(ip)
            print(f"Blocked IP: {ip}")
            
            # Update investigation data
            if ip in self.ip_investigation_data:
                self.ip_investigation_data[ip]['classification'] = 'malicious'
                self.ip_investigation_data[ip]['activities'].append({
                    'timestamp': datetime.now().isoformat(),
                    'action': 'IP Blocked',
                    'details': 'Manually blocked by administrator',
                    'severity': 'info'
                })
            
            return True
        return False
    
    def whitelist_ip(self, ip):
        """Whitelist an IP address"""
        # Remove from blocked list if present
        if ip in self.blocked_ips:
            self.blocked_ips.remove(ip)
            
        if ip not in self.whitelisted_ips:
            self.whitelisted_ips.add(ip)
            print(f"Whitelisted IP: {ip}")
            
            # Update investigation data
            if ip in self.ip_investigation_data:
                self.ip_investigation_data[ip]['classification'] = 'benign'
                self.ip_investigation_data[ip]['activities'].append({
                    'timestamp': datetime.now().isoformat(),
                    'action': 'IP Whitelisted',
                    'details': 'Manually whitelisted by administrator',
                    'severity': 'info'
                })
            
            return True
        return False
    
    def get_ip_investigation_data(self, ip):
        """Get investigation data for an IP"""
        if ip in self.ip_investigation_data:
            data = self.ip_investigation_data[ip]
            
            # Add current status
            if ip in self.blocked_ips:
                status = 'blocked'
            elif ip in self.whitelisted_ips:
                status = 'whitelisted'
            else:
                status = 'monitoring'
                
            data['status'] = status
            data['last_seen'] = datetime.now().isoformat()
            
            return data
        
        return None
    
    def update_ip_notes(self, ip, notes):
        """Update investigation notes for an IP"""
        if ip not in self.ip_investigation_data:
            self.ip_investigation_data[ip] = {
                'first_seen': datetime.now().isoformat(),
                'activities': [],
                'ports_accessed': [],
                'classification': 'unknown',
                'notes': ''
            }
            
        self.ip_investigation_data[ip]['notes'] = notes
        print(f"Updated notes for IP: {ip}")
        return True
    
    def start_monitoring(self, interface='eth0'):
        """Start network monitoring"""
        print(f"Starting network monitoring on interface: {interface}")
        
        try:
            # Create raw socket (requires root privileges)
            sock = socket.socket(socket.AF_PACKET, socket.SOCK_RAW, socket.ntohs(0x0003))
            sock.bind((interface, 0))
            
            print("Network monitoring started. Press Ctrl+C to stop.")
            
            while self.config['monitoring_enabled']:
                packet = sock.recvfrom(65565)
                packet_data = packet[0]
                
                # Skip Ethernet header (14 bytes) to get to IP header
                ip_packet = packet_data[14:]
                self.analyze_packet(ip_packet)
                
                # Print stats every 100 packets
                if self.packet_count % 100 == 0:
                    self.print_stats()
                    
        except PermissionError:
            print("Error: Root privileges required for raw socket access")
            print("Run with: sudo python3 network_monitor.py")
        except KeyboardInterrupt:
            print("\nMonitoring stopped by user")
        except Exception as e:
            print(f"Error during monitoring: {e}")
        finally:
            self.print_final_stats()
    
    def print_stats(self):
        """Print current monitoring statistics"""
        print(f"\n--- Network Monitor Stats ---")
        print(f"Total packets analyzed: {self.packet_count}")
        print(f"Suspicious packets: {self.suspicious_packets}")
        print(f"Active alerts: {len([a for a in self.alerts if a['status'] == 'active'])}")
        print(f"Blocked IPs: {len(self.blocked_ips)}")
        print(f"Whitelisted IPs: {len(self.whitelisted_ips)}")
        print(f"Unique source IPs: {len(self.connection_tracker)}")
        print("-" * 30)
    
    def print_final_stats(self):
        """Print final statistics and alerts"""
        print(f"\n=== Final Network Monitor Report ===")
        self.print_stats()
        
        if self.alerts:
            print(f"\n--- Security Alerts ---")
            for alert in self.alerts[-5:]:  # Show last 5 alerts
                print(f"[{alert['type'].upper()}] {alert['title']}")
                print(f"  Source: {alert['source_ip']}")
                print(f"  Time: {alert['timestamp']}")
                print(f"  Description: {alert['description']}")
                print()
        
        if self.blocked_ips:
            print(f"--- Blocked IPs ---")
            for ip in self.blocked_ips:
                print(f"  {ip}")
                
        if self.whitelisted_ips:
            print(f"--- Whitelisted IPs ---")
            for ip in self.whitelisted_ips:
                print(f"  {ip}")
    
    def get_status_json(self):
        """Return current status as JSON for API"""
        return {
            'stats': {
                'total_packets': self.packet_count,
                'suspicious_packets': self.suspicious_packets,
                'blocked_ips': len(self.blocked_ips),
                'active_connections': len(self.connection_tracker),
                'system_uptime': '2h 34m',  # Would be calculated in real implementation
                'last_scan': datetime.now().strftime('%H:%M:%S')
            },
            'alerts': self.alerts[-10:],  # Return last 10 alerts
            'blocked_ips': list(self.blocked_ips),
            'whitelisted_ips': list(self.whitelisted_ips)
        }

def main():
    """Main function to start network monitoring"""
    monitor = NetworkMonitor()
    
    # Configuration options
    monitor.config.update({
        'port_scan_threshold': 5,
        'ddos_threshold': 50,
        'auto_block': True
    })
    
    print("Intrusion Detection System - Network Monitor")
    print("=" * 50)
    
    # Start monitoring (replace 'eth0' with your network interface)
    monitor.start_monitoring('eth0')

if __name__ == "__main__":
    main()
