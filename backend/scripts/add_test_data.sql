-- Add more users
INSERT INTO users (username, email, password_hash, role) VALUES
('test_user', 'test@example.com', 'hashed_pass', 'user'),
('admin_user', 'admin@example.com', 'hashed_pass', 'admin'),
('security_analyst', 'analyst@example.com', 'hashed_pass', 'analyst');

-- Add more networks
INSERT INTO networks (user_id, network_name, network_range) VALUES
(1, 'Office Network', '10.0.0.0/24'),
(1, 'Guest Network', '192.168.2.0/24'),
(2, 'Lab Network', '172.16.0.0/24');

-- Add more devices
INSERT INTO devices (network_id, device_ip, device_name, device_type) VALUES
(1, '10.0.0.1', 'Main Router', 'router'),
(1, '10.0.0.5', 'File Server', 'server'),
(1, '10.0.0.10', 'Laptop-1', 'computer'),
(2, '192.168.2.1', 'Guest Router', 'router'),
(2, '192.168.2.50', 'Printer', 'printer'),
(3, '172.16.0.1', 'Lab Server', 'server');

-- Add more scans
INSERT INTO scans (network_id, scan_status, total_devices_found) VALUES
(1, 'completed', 3),
(2, 'completed', 2),
(3, 'completed', 1);

-- Add more vulnerabilities
INSERT INTO vulnerabilities (scan_id, device_id, port_number, service_name, vulnerability_name, severity, description, remediation_tip, cve_id) VALUES
-- SSH Vulnerabilities
(1, 1, 22, 'SSH', 'Weak SSH Configuration', 'HIGH', 'SSH using default port with weak ciphers', 'Disable weak ciphers, use SSH key-based auth', 'CVE-2021-1234'),
(1, 2, 22, 'SSH', 'SSH Root Login Enabled', 'CRITICAL', 'Root login is enabled on SSH', 'Disable PermitRootLogin in sshd_config', 'CVE-2021-5678'),
(1, 3, 22, 'SSH', 'Outdated SSH Version', 'MEDIUM', 'SSH version 7.2 (outdated)', 'Update SSH to latest version', 'CVE-2021-9999'),

-- HTTP/HTTPS Vulnerabilities
(1, 2, 80, 'HTTP', 'No HTTPS Redirect', 'HIGH', 'HTTP traffic not redirected to HTTPS', 'Configure HTTP to HTTPS redirect', 'CVE-2021-2222'),
(1, 2, 443, 'HTTPS', 'Self-Signed Certificate', 'MEDIUM', 'Using self-signed SSL certificate', 'Install proper SSL certificate', 'CVE-2021-3333'),

-- Database Vulnerabilities
(1, 2, 3306, 'MySQL', 'Default MySQL Credentials', 'CRITICAL', 'MySQL using default user:root, no password', 'Change MySQL root password immediately', 'CVE-2021-4444'),
(1, 2, 5432, 'PostgreSQL', 'Exposed Database Port', 'CRITICAL', 'PostgreSQL exposed without firewall', 'Restrict DB port access via firewall', 'CVE-2021-5555'),

-- FTP Vulnerabilities
(1, 2, 21, 'FTP', 'Unencrypted FTP Protocol', 'HIGH', 'FTP transmits credentials in plaintext', 'Switch to SFTP or disable FTP', 'CVE-2021-6666'),
(1, 2, 21, 'FTP', 'Anonymous FTP Access', 'MEDIUM', 'Anonymous FTP access enabled', 'Disable anonymous FTP access', 'CVE-2021-7777'),

-- SMB Vulnerabilities
(1, 3, 445, 'SMB', 'SMB v1 Enabled', 'HIGH', 'Legacy SMB v1 protocol enabled', 'Disable SMB v1, use SMB v3', 'CVE-2017-0144'),
(1, 3, 139, 'NetBIOS', 'NetBIOS Exposure', 'MEDIUM', 'NetBIOS port exposed', 'Block NetBIOS traffic via firewall', 'CVE-2021-8888'),

-- Printer Vulnerabilities
(2, 5, 515, 'LPD', 'Unencrypted Printer Access', 'LOW', 'Printer queue accessible without auth', 'Enable printer authentication', 'CVE-2021-9999'),
(2, 5, 9100, 'JetDirect', 'Printer Information Disclosure', 'LOW', 'Printer status page accessible', 'Restrict printer status page access', 'CVE-2021-1010');