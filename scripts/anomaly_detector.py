#!/usr/bin/env python3
"""
Anomaly Detection Module for IDS
Uses statistical analysis and machine learning to detect unusual network behavior
"""

import numpy as np
import json
import time
from datetime import datetime, timedelta
from collections import defaultdict, deque
import statistics

class AnomalyDetector:
    def __init__(self):
        self.traffic_patterns = defaultdict(list)
        self.baseline_established = False
        self.baseline_period = 3600  # 1 hour to establish baseline
        self.start_time = time.time()
        self.alerts = []
        
        # Traffic metrics
        self.packet_rates = deque(maxlen=100)
        self.connection_counts = deque(maxlen=100)
        self.port_distributions = deque(maxlen=100)
        self.ip_frequencies = defaultdict(deque)
        
        # Thresholds (will be calculated from baseline)
        self.thresholds = {
            'packet_rate_std_multiplier': 3,
            'connection_count_std_multiplier': 2.5,
            'unusual_port_threshold': 0.05,
            'ip_frequency_std_multiplier': 2
        }
        
        # Current metrics
        self.current_metrics = {
            'packet_rate': 0,
            'connection_count': 0,
            'unique_ports': set(),
            'ip_counts': defaultdict(int)
        }
    
    def update_metrics(self, traffic_data):
        """Update current traffic metrics"""
        current_time = time.time()
        
        # Reset current metrics
        self.current_metrics = {
            'packet_rate': 0,
            'connection_count': 0,
            'unique_ports': set(),
            'ip_counts': defaultdict(int)
        }
        
        # Analyze recent traffic (last 60 seconds)
        recent_traffic = [
            entry for entry in traffic_data 
            if current_time - entry.get('timestamp', 0) < 60
        ]
        
        for entry in recent_traffic:
            self.current_metrics['packet_rate'] += 1
            self.current_metrics['connection_count'] += 1
            self.current_metrics['unique_ports'].add(entry.get('dest_port', 0))
            self.current_metrics['ip_counts'][entry.get('source_ip', '')] += 1
        
        # Store metrics for baseline calculation
        self.packet_rates.append(self.current_metrics['packet_rate'])
        self.connection_counts.append(self.current_metrics['connection_count'])
        self.port_distributions.append(len(self.current_metrics['unique_ports']))
        
        # Update IP frequency tracking
        for ip, count in self.current_metrics['ip_counts'].items():
            self.ip_frequencies[ip].append(count)
            if len(self.ip_frequencies[ip]) > 100:
                self.ip_frequencies[ip].popleft()
    
    def establish_baseline(self):
        """Establish baseline behavior patterns"""
        if time.time() - self.start_time < self.baseline_period:
            return False
        
        if len(self.packet_rates) < 50:  # Need minimum data points
            return False
        
        # Calculate baseline statistics
        self.baseline = {
            'packet_rate_mean': statistics.mean(self.packet_rates),
            'packet_rate_std': statistics.stdev(self.packet_rates) if len(self.packet_rates) > 1 else 0,
            'connection_count_mean': statistics.mean(self.connection_counts),
            'connection_count_std': statistics.stdev(self.connection_counts) if len(self.connection_counts) > 1 else 0,
            'port_count_mean': statistics.mean(self.port_distributions),
            'port_count_std': statistics.stdev(self.port_distributions) if len(self.port_distributions) > 1 else 0
        }
        
        self.baseline_established = True
        print("Baseline established:")
        for key, value in self.baseline.items():
            print(f"  {key}: {value:.2f}")
        
        return True
    
    def detect_packet_rate_anomaly(self):
        """Detect unusual packet rates"""
        if not self.baseline_established:
            return None
        
        current_rate = self.current_metrics['packet_rate']
        mean = self.baseline['packet_rate_mean']
        std = self.baseline['packet_rate_std']
        
        if std == 0:
            return None
        
        z_score = abs(current_rate - mean) / std
        threshold = self.thresholds['packet_rate_std_multiplier']
        
        if z_score > threshold:
            severity = 'high' if z_score > threshold * 1.5 else 'medium'
            return {
                'type': 'packet_rate_anomaly',
                'severity': severity,
                'current_value': current_rate,
                'expected_range': f"{mean - std:.1f} - {mean + std:.1f}",
                'z_score': z_score
            }
        
        return None
    
    def detect_connection_anomaly(self):
        """Detect unusual connection patterns"""
        if not self.baseline_established:
            return None
        
        current_count = self.current_metrics['connection_count']
        mean = self.baseline['connection_count_mean']
        std = self.baseline['connection_count_std']
        
        if std == 0:
            return None
        
        z_score = abs(current_count - mean) / std
        threshold = self.thresholds['connection_count_std_multiplier']
        
        if z_score > threshold:
            severity = 'high' if z_score > threshold * 1.5 else 'medium'
            return {
                'type': 'connection_anomaly',
                'severity': severity,
                'current_value': current_count,
                'expected_range': f"{mean - std:.1f} - {mean + std:.1f}",
                'z_score': z_score
            }
        
        return None
    
    def detect_port_anomaly(self):
        """Detect unusual port usage patterns"""
        if not self.baseline_established:
            return None
        
        current_ports = len(self.current_metrics['unique_ports'])
        mean = self.baseline['port_count_mean']
        std = self.baseline['port_count_std']
        
        if std == 0:
            return None
        
        z_score = abs(current_ports - mean) / std
        threshold = self.thresholds['connection_count_std_multiplier']
        
        if z_score > threshold:
            severity = 'medium' if z_score > threshold * 1.2 else 'low'
            return {
                'type': 'port_usage_anomaly',
                'severity': severity,
                'current_value': current_ports,
                'expected_range': f"{mean - std:.1f} - {mean + std:.1f}",
                'z_score': z_score,
                'unusual_ports': list(self.current_metrics['unique_ports'])
            }
        
        return None
    
    def detect_ip_frequency_anomaly(self):
        """Detect IPs with unusual traffic frequency"""
        anomalies = []
        
        for ip, counts in self.ip_frequencies.items():
            if len(counts) < 10:  # Need minimum data points
                continue
            
            current_count = self.current_metrics['ip_counts'].get(ip, 0)
            mean = statistics.mean(counts)
            std = statistics.stdev(counts) if len(counts) > 1 else 0
            
            if std == 0:
                continue
            
            z_score = abs(current_count - mean) / std
            threshold = self.thresholds['ip_frequency_std_multiplier']
            
            if z_score > threshold:
                severity = 'high' if z_score > threshold * 1.5 else 'medium'
                anomalies.append({
                    'type': 'ip_frequency_anomaly',
                    'severity': severity,
                    'ip_address': ip,
                    'current_count': current_count,
                    'expected_range': f"{mean - std:.1f} - {mean + std:.1f}",
                    'z_score': z_score
                })
        
        return anomalies if anomalies else None
    
    def analyze_traffic(self, traffic_data):
        """Main analysis function"""
        self.update_metrics(traffic_data)
        
        # Try to establish baseline if not done yet
        if not self.baseline_established:
            self.establish_baseline()
            return []
        
        # Detect anomalies
        anomalies = []
        
        # Check different types of anomalies
        packet_anomaly = self.detect_packet_rate_anomaly()
        if packet_anomaly:
            anomalies.append(packet_anomaly)
        
        connection_anomaly = self.detect_connection_anomaly()
        if connection_anomaly:
            anomalies.append(connection_anomaly)
        
        port_anomaly = self.detect_port_anomaly()
        if port_anomaly:
            anomalies.append(port_anomaly)
        
        ip_anomalies = self.detect_ip_frequency_anomaly()
        if ip_anomalies:
            anomalies.extend(ip_anomalies)
        
        # Convert anomalies to alerts
        for anomaly in anomalies:
            alert = self.create_alert(anomaly)
            self.alerts.append(alert)
        
        return anomalies
    
    def create_alert(self, anomaly):
        """Create alert from anomaly detection"""
        alert_id = f"anomaly_{int(time.time())}_{anomaly['type']}"
        
        title_map = {
            'packet_rate_anomaly': 'Unusual Packet Rate Detected',
            'connection_anomaly': 'Abnormal Connection Pattern',
            'port_usage_anomaly': 'Unusual Port Usage Pattern',
            'ip_frequency_anomaly': 'Abnormal IP Traffic Frequency'
        }
        
        description_map = {
            'packet_rate_anomaly': f"Packet rate ({anomaly['current_value']}) significantly differs from baseline ({anomaly['expected_range']})",
            'connection_anomaly': f"Connection count ({anomaly['current_value']}) outside normal range ({anomaly['expected_range']})",
            'port_usage_anomaly': f"Port usage pattern ({anomaly['current_value']} unique ports) deviates from baseline",
            'ip_frequency_anomaly': f"IP {anomaly.get('ip_address', 'unknown')} showing unusual traffic frequency"
        }
        
        return {
            'id': alert_id,
            'type': anomaly['severity'],
            'title': title_map.get(anomaly['type'], 'Network Anomaly Detected'),
            'description': description_map.get(anomaly['type'], 'Unusual network behavior detected'),
            'timestamp': datetime.now().isoformat(),
            'source_ip': anomaly.get('ip_address', 'multiple'),
            'destination_ip': 'multiple',
            'status': 'active',
            'details': anomaly
        }
    
    def get_status(self):
        """Get current anomaly detection status"""
        return {
            'baseline_established': self.baseline_established,
            'baseline_progress': min(100, ((time.time() - self.start_time) / self.baseline_period) * 100),
            'data_points_collected': len(self.packet_rates),
            'recent_anomalies': len([a for a in self.alerts if 
                                   datetime.fromisoformat(a['timestamp']) > datetime.now() - timedelta(hours=1)]),
            'current_metrics': {
                'packet_rate': self.current_metrics['packet_rate'],
                'connection_count': self.current_metrics['connection_count'],
                'unique_ports': len(self.current_metrics['unique_ports']),
                'unique_ips': len(self.current_metrics['ip_counts'])
            }
        }

def main():
    """Test the anomaly detector with sample data"""
    detector = AnomalyDetector()
    
    print("Anomaly Detection System Test")
    print("=" * 40)
    
    # Generate sample traffic data
    sample_traffic = []
    current_time = time.time()
    
    # Normal traffic pattern
    for i in range(100):
        sample_traffic.append({
            'timestamp': current_time - (100 - i),
            'source_ip': f"192.168.1.{10 + (i % 20)}",
            'dest_ip': "10.0.0.1",
            'dest_port': 80 if i % 3 == 0 else 443,
            'protocol': 'TCP'
        })
    
    # Analyze normal traffic
    print("Analyzing normal traffic patterns...")
    for _ in range(10):
        anomalies = detector.analyze_traffic(sample_traffic)
        time.sleep(0.1)
    
    # Add anomalous traffic
    print("Injecting anomalous traffic...")
    anomalous_traffic = sample_traffic.copy()
    
    # Add burst of traffic (DDoS-like)
    for i in range(200):
        anomalous_traffic.append({
            'timestamp': current_time,
            'source_ip': "203.0.113.45",
            'dest_ip': "10.0.0.1",
            'dest_port': 80,
            'protocol': 'TCP'
        })
    
    # Analyze anomalous traffic
    anomalies = detector.analyze_traffic(anomalous_traffic)
    
    print(f"\nDetected {len(anomalies)} anomalies:")
    for anomaly in anomalies:
        print(f"- {anomaly['type']}: {anomaly.get('severity', 'unknown')} severity")
    
    # Print status
    status = detector.get_status()
    print(f"\nDetector Status:")
    print(f"Baseline established: {status['baseline_established']}")
    print(f"Data points collected: {status['data_points_collected']}")
    print(f"Recent anomalies: {status['recent_anomalies']}")

if __name__ == "__main__":
    main()
