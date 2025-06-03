#!/usr/bin/env python3
"""
IDS API Server
Provides REST API endpoints for the frontend to communicate with the Python backend
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import threading
import time
from datetime import datetime
import ipaddress
import socket
import whois
from network_monitor import NetworkMonitor
from anomaly_detector import AnomalyDetector

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Global instances
network_monitor = NetworkMonitor()
anomaly_detector = AnomalyDetector()
monitoring_thread = None
is_monitoring = False

# Configuration storage
ids_config = {
    'enablePortScanDetection': True,
    'enableDDoSDetection': True,
    'enableAnomalyDetection': True,
    'sensitivityLevel': 'medium',
    'monitoredInterfaces': 'eth0,wlan0',
    'excludedIPs': '127.0.0.1,192.168.1.1',
    'monitoredPorts': '22,80,443,3389',
    'enableEmailAlerts': False,
    'emailAddress': '',
    'enableSlackAlerts': False,
    'slackWebhook': '',
    'alertThreshold': 'medium',
    'logLevel': 'info',
    'maxLogSize': '100',
    'retentionDays': '30',
    'autoBlockEnabled': False,
    'blockDuration': '60'
}

def monitoring_worker():
    """Background worker for network monitoring"""
    global is_monitoring
    
    print("Starting network monitoring worker...")
    
    # Simulate network monitoring (in real implementation, this would use raw sockets)
    while is_monitoring:
        try:
            # Generate mock traffic data for demonstration
            mock_traffic = generate_mock_traffic()
            
            # Analyze with network monitor
            for packet in mock_traffic:
                if is_monitoring:
                    network_monitor.analyze_packet(packet)
            
            # Analyze with anomaly detector
            if ids_config['enableAnomalyDetection']:
                anomaly_detector.analyze_traffic(mock_traffic)
            
            time.sleep(1)  # Monitor every second
            
        except Exception as e:
            print(f"Error in monitoring worker: {e}")
            time.sleep(5)
    
    print("Network monitoring worker stopped")

def generate_mock_traffic():
    """Generate mock network traffic for demonstration"""
    import random
    
    mock_packets = []
    current_time = time.time()
    
    # Generate normal traffic
    for _ in range(random.randint(10, 50)):
        source_ip = f"192.168.1.{random.randint(10, 100)}"
        dest_port = random.choice([80, 443, 22, 25, 53])
        
        packet_data = {
            'timestamp': current_time,
            'source_ip': source_ip,
            'dest_ip': '10.0.0.1',
            'dest_port': dest_port,
            'protocol': 'TCP'
        }
        mock_packets.append(packet_data)
    
    # Occasionally generate suspicious traffic
    if random.random() < 0.1:  # 10% chance
        suspicious_ip = "203.0.113.45"
        for _ in range(random.randint(20, 100)):
            packet_data = {
                'timestamp': current_time,
                'source_ip': suspicious_ip,
                'dest_ip': '10.0.0.1',
                'dest_port': random.randint(1, 65535),
                'protocol': 'TCP'
            }
            mock_packets.append(packet_data)
    
    return mock_packets

@app.route('/api/system-status', methods=['GET'])
def get_system_status():
    """Get current system status and alerts"""
    try:
        # Get stats from network monitor
        monitor_status = network_monitor.get_status_json()
        
        # Get anomaly detector status
        anomaly_status = anomaly_detector.get_status()
        
        # Combine alerts from both systems
        all_alerts = monitor_status['alerts'] + anomaly_detector.alerts[-5:]
        
        # Sort alerts by timestamp (most recent first)
        all_alerts.sort(key=lambda x: x['timestamp'], reverse=True)
        
        response = {
            'stats': {
                'total_packets': monitor_status['stats']['total_packets'],
                'suspicious_packets': monitor_status['stats']['suspicious_packets'] + anomaly_status['recent_anomalies'],
                'blocked_ips': monitor_status['stats']['blocked_ips'],
                'active_connections': monitor_status['stats']['active_connections'],
                'system_uptime': monitor_status['stats']['system_uptime'],
                'last_scan': monitor_status['stats']['last_scan']
            },
            'alerts': all_alerts[:10],  # Return top 10 most recent alerts
            'monitoring_status': is_monitoring,
            'anomaly_detection': anomaly_status,
            'blocked_ips': monitor_status['blocked_ips'],
            'whitelisted_ips': monitor_status['whitelisted_ips']
        }
        
        return jsonify(response)
        
    except Exception as e:
        print(f"Error getting system status: {e}")
        return jsonify({'error': 'Failed to get system status'}), 500

@app.route('/api/monitoring/start', methods=['POST'])
def start_monitoring():
    """Start network monitoring"""
    global monitoring_thread, is_monitoring
    
    try:
        if not is_monitoring:
            is_monitoring = True
            monitoring_thread = threading.Thread(target=monitoring_worker, daemon=True)
            monitoring_thread.start()
            
            return jsonify({
                'success': True,
                'message': 'Network monitoring started',
                'status': 'active'
            })
        else:
            return jsonify({
                'success': True,
                'message': 'Network monitoring already active',
                'status': 'active'
            })
            
    except Exception as e:
        print(f"Error starting monitoring: {e}")
        return jsonify({'error': 'Failed to start monitoring'}), 500

@app.route('/api/monitoring/stop', methods=['POST'])
def stop_monitoring():
    """Stop network monitoring"""
    global is_monitoring
    
    try:
        is_monitoring = False
        
        return jsonify({
            'success': True,
            'message': 'Network monitoring stopped',
            'status': 'inactive'
        })
        
    except Exception as e:
        print(f"Error stopping monitoring: {e}")
        return jsonify({'error': 'Failed to stop monitoring'}), 500

@app.route('/api/config', methods=['GET', 'POST'])
def handle_config():
    """Get or update IDS configuration"""
    global ids_config
    
    if request.method == 'GET':
        return jsonify(ids_config)
    
    elif request.method == 'POST':
        try:
            new_config = request.get_json()
            
            # Update configuration
            ids_config.update(new_config)
            
            # Apply configuration to monitoring systems
            apply_configuration(ids_config)
            
            return jsonify({
                'success': True,
                'message': 'Configuration updated successfully'
            })
            
        except Exception as e:
            print(f"Error updating configuration: {e}")
            return jsonify({'error': 'Failed to update configuration'}), 500

def apply_configuration(config):
    """Apply configuration to monitoring systems"""
    try:
        # Update network monitor configuration
        network_monitor.config.update({
            'port_scan_threshold': 5 if config['sensitivityLevel'] == 'high' else 10 if config['sensitivityLevel'] == 'medium' else 20,
            'ddos_threshold': 50 if config['sensitivityLevel'] == 'high' else 100 if config['sensitivityLevel'] == 'medium' else 200,
            'auto_block': config['autoBlockEnabled']
        })
        
        # Update anomaly detector thresholds
        sensitivity_multipliers = {
            'high': {'packet_rate': 2, 'connection': 2, 'ip_frequency': 1.5},
            'medium': {'packet_rate': 3, 'connection': 2.5, 'ip_frequency': 2},
            'low': {'packet_rate': 4, 'connection': 3, 'ip_frequency': 2.5}
        }
        
        multipliers = sensitivity_multipliers.get(config['sensitivityLevel'], sensitivity_multipliers['medium'])
        anomaly_detector.thresholds.update({
            'packet_rate_std_multiplier': multipliers['packet_rate'],
            'connection_count_std_multiplier': multipliers['connection'],
            'ip_frequency_std_multiplier': multipliers['ip_frequency']
        })
        
        print(f"Configuration applied: sensitivity={config['sensitivityLevel']}")
        
    except Exception as e:
        print(f"Error applying configuration: {e}")

@app.route('/api/alerts/<alert_id>/status', methods=['PUT'])
def update_alert_status(alert_id):
    """Update alert status"""
    try:
        data = request.get_json()
        new_status = data.get('status')
        
        # Update alert in network monitor
        for alert in network_monitor.alerts:
            if alert['id'] == alert_id:
                alert['status'] = new_status
                break
        
        # Update alert in anomaly detector
        for alert in anomaly_detector.alerts:
            if alert['id'] == alert_id:
                alert['status'] = new_status
                break
        
        return jsonify({
            'success': True,
            'message': f'Alert {alert_id} status updated to {new_status}'
        })
        
    except Exception as e:
        print(f"Error
