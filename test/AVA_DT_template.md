# Video Analytics Solution Proposal for AVA Project - Nas Ltd

## 1. COVER PAGE

**Proposal Title:** Video Analytics Solution Proposal for AVA Project - Nas Ltd

**Client Name:** AVA Project - Nas Ltd

**Date:** 2026-01-06

---

## 2. PROJECT REQUIREMENT STATEMENT

**Project:** AI-Powered Video Analytics for Safety Compliance and Workforce Monitoring

**Project Owner:** AVA Project - Nas Ltd

**Work Scope:** Cloud-based AI system to monitor workplace safety compliance, detect fire and smoke incidents, prevent worker-vehicle collisions, and monitor restricted danger zones in real time.

**Components:**
1. Deployment method: Cloud-based AI system
2. AI system: Video Analytics Platform
3. General project description: Real-time safety monitoring and compliance enforcement through AI-powered video analytics

**Project Duration:** 6 months

**Camera Number:** 6 cameras

**Number of AI Module per Camera:** 3-4 modules per camera 

**AI Modules:**
1. Helmet Detection
2. Hi-vis vest detection
3. Fire & Smoke Detection
4. Anti-Collision
5. Restricted Zone detection

---

## 3. SCOPE OF WORK

### viAct Responsibilities
- Software: License, maintenance, and support
- Camera integration

### Client Responsibilities
- Hardware: Camera maintenance and operation (6 IP cameras already installed)

---

## 4. SYSTEM ARCHITECTURE

**Deployment Method:** Cloud

**Architecture Overview:**
The system will be deployed on cloud infrastructure, enabling remote access and centralized management. The architecture consists of:

**Data Flow:**
- IP cameras (6 units) → Network Switch → Internet → Cloud AI Processing → Dashboard/Alert System
- Video streams are transmitted from on-site cameras to cloud-based AI inference servers
- Processed alerts and analytics data flow to the dashboard and notification systems

**Hardware Components Placement:**
- IP Cameras: On-site locations (6 cameras already installed)
- Network Switch: On-site (existing infrastructure)
- Cloud Infrastructure: Remote data center (viAct managed)

**Network Topology:**
- Local Area Network (LAN): For cameras and local network connectivity
- Wide Area Network (WAN): Internet connection for cloud services
- Cloud Layer: AI processing and data storage

**System Layers:**
- Edge Layer: On-site cameras capturing video feeds
- Cloud Layer: AI inference, data storage, and backend services
- Application Layer: Web dashboard and mobile access

---

## 5. SYSTEM REQUIREMENTS

### Network
- Per-camera bandwidth: 12 Mbps
- Total system bandwidth: 72 Mbps (12 Mbps × 6 cameras)

### Camera
- Resolution: 1080p@25fps (minimum)
- Frame rate: 25fps
- Connectivity Type: IP-based cameras with RTSP support
- Quantity: 6 IP cameras (already installed)

### Additional Equipment
None required (no IoT integration specified)

### Power Requirements
- Power Source: Stable power source (confirmed by client)

---

## 6. IMPLEMENTATION PLAN (TIMELINE)

### 6.1 Key Milestones
- **Proposal submission date:** 2026-01-06
- **Project award date (T0):** [To be confirmed]
- **Hardware deployment (T1):** T0 + 1-2 weeks 
- **Software deployment (T2):** T1 + 4-6 weeks
- **Integration period (T3):** T2 + 2-4 weeks

### 6.2 Phasing Structure

| Phase | Description | Duration |
|-------|-------------|----------|
| **Phase T0** | Project Award / Contract Signed | — |
| **Phase T1** | Hardware Deployment | T0 + 1-2 weeks |
| **Phase T2** | Software Deployment | T1 + 4-6 weeks |
| **Phase T3** | System Integration & Handover / UAT | T2 + 2-4 weeks |

**Phase T1 Details:**
- Camera verification and network connectivity testing
- Network setup verification for cloud connectivity
- Hardware assessment and configuration
- RTSP link verification for all 6 cameras

**Phase T2 Details:**
- AI module deployment and configuration
- Cloud infrastructure setup
- System integration testing
- Initial calibration and tuning

**Phase T3 Details:**
- Integration testing with all modules
- User Acceptance Testing (UAT)
- User training and documentation
- System handover

**Total Project Duration:** Approximately 8-13 weeks from T0 (excluding proposal and contract signing period)

---

## 7. PROPOSED MODULES & FUNCTIONAL DESCRIPTION

### 7.1 Module Classification

**Standard AI Modules:**
- Helmet Detection
- Hi-vis vest detection
- Fire & Smoke Detection
- Anti-Collision
- Restricted Zone detection

**Custom Modules:**
None

### 7.2 Module Descriptions

#### Module: Helmet Detection
**Module Type:** Standard

• **Purpose Description:** Ensures compliance with safety regulations by identifying workers wearing safety helmets. Detects workers without a safety helmet on the construction site.

• **Alert Trigger Logic:** AI will capture people not wearing a helmet or wearing the helmet, and trigger the real-time alerts.

• **Detection Criteria:** Standard detection logic for safety helmet presence/absence

• **Preconditions:** Camera must maintain a suitable distance for clear observation of workers, typically between 5 to 10 meters.

• **Image URL:** [Not available]

• **Video URL:** https://drive.google.com/file/d/1adkUPBJaBPbUVdirflpQwFOVai84p4k2/view?usp=sharing

• **Client Data Requirements:** None (standard module)

---

#### Module: Hi-vis vest detection
**Module Type:** Standard

• **Purpose Description:** Detects workers wearing high-visibility vests. These vests enhance visibility, especially in low-light conditions.

• **Alert Trigger Logic:** Alert will be sent out immediately to remind workers missing a reflective vest. AI identifies missing vests and notifies in real time.

• **Detection Criteria:** Standard detection logic for high-visibility vest presence/absence

• **Preconditions:** Camera must maintain a suitable distance for clear observation of workers, typically between 5 to 10 meters.

• **Image URL:** [Not available]

• **Video URL:** https://drive.google.com/file/d/1adkUPBJaBPbUVdirflpQwFOVai84p4k2/view?usp=sharing

• **Client Data Requirements:** None (standard module)

---

#### Module: Fire & Smoke Detection
**Module Type:** Standard

• **Purpose Description:** Detects situations where fire or smoke is present in the monitored area, ensuring early intervention and safety compliance.

• **Alert Trigger Logic:** Automatically triggers an alert when fire or smoke is detected in the area, enabling quick response and mitigation actions.

• **Detection Criteria:** Standard detection logic for fire and smoke presence

• **Preconditions:** Camera must directly face the work area, allowing a clear view of the work area – the area prone to fire hazards.

• **Image URL:** [Not available]

• **Video URL:** https://drive.google.com/file/d/1hR2FZrlMhmPXq2qvbWm0D7uKZ6KDhtkc/view?usp=sharing

• **Client Data Requirements:** None (standard module)

---

#### Module: Anti-Collision
**Module Type:** Standard

• **Purpose Description:** Detects and identifies potential or actual workers dangerously close to moving machinery within 100 cm (3 feet) and between workers.

• **Alert Trigger Logic:** Automatically triggers an alert when a near-miss from 100cm or a collision occurs.

• **Detection Criteria:** Detection of workers within 100 cm (3 feet) of moving vehicles/machinery

• **Preconditions:** Requires providing images of different vehicle types for model training.

• **Image URL:** [Not available]

• **Video URL:** https://drive.google.com/file/d/1h50cgHZ0qhxEdUoFLtnSUbxvAgGzX_YR/view?usp=sharing

• **Client Data Requirements:** Request: Provide images of different vehicle types for model training.

---

#### Module: Restricted Zone detection
**Module Type:** Standard

• **Purpose Description:** Alerts whenever workers enter/approach the switchgear panel (crossing the restricted red line).

• **Alert Trigger Logic:** Alarms trigger if someone enters without authorization.

• **Detection Criteria:** Detection of workers entering or approaching restricted danger zones

• **Preconditions:** Cameras cover perimeter areas, continuously monitoring for intruders.

• **Image URL:** [Not available]

• **Video URL:** https://drive.google.com/file/d/1mCcEq2Wps4siMLDFm0_cQ4SiPTQKA6U_/view?usp=sharing

• **Client Data Requirements:** None (standard module)

---

## 8. USER INTERFACE & REPORTING

### 8.1 Alerts & Notifications

**Channels:**
- Dashboard: Real-time alerts displayed on web-based dashboard
- Email: Automated email notifications to designated operators
- Telegram: Telegram bot notifications for on-site alerts

**Alert Configuration:**
- Real-time alert triggers for all detection events
- Configurable alert thresholds and sensitivity
- Alert escalation rules based on severity

### 8.2 Dashboard Visualizations

**Event Analysis:**
- Charts and graphs of detection frequencies
- Module-wise performance metrics
- Time-based trend analysis

**Alert Timelines:**
- Chronological view of all incidents
- Filterable by module, time range, and severity
- Detailed event logs with timestamps

**Evidence Snapshots:**
- Image snapshots of detected events
- Video clips capturing incidents
- Downloadable evidence for reporting

**Custom KPIs:**
- PPE compliance rate
- Fire/smoke incident count
- Near-miss/collision events
- Restricted zone violations
- Overall safety score

**Multi-Dashboard:**
- Single centralized dashboard for all 6 cameras
- Real-time monitoring view
- Historical data analysis view

### 8.3 Daily / Weekly Summary Reports

**Automated Reporting Features:**
- Daily summary reports sent to stakeholders
- Weekly aggregated reports with trends
- Export capabilities: Excel, PDF, CSV formats
- Timestamp filtering and date range selection
- Module-wise breakdown of incidents

**Report Content:**
- Total number of alerts per module
- Compliance rates and trends
- Top violation types
- Time-based incident distribution
- Evidence attachments

---

