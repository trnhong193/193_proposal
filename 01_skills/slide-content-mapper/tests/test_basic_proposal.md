# Test Proposal - Basic

## 1. COVER PAGE

| Content | Source/Guidance |
|---------|------------------|
| Proposal Title | Video Analytics Solution Proposal for Test Client |
| Client Name | Test Client |
| Date | 2025-01-15 |

## 2. PROJECT REQUIREMENT STATEMENT

| Content | Source/Guidance |
|---------|------------------|
| **Project** | AI-Powered Video Analytics for Safety Monitoring |
| **Project Owner** | Test Client |
| **Work Scope** | Implement AI-based video analytics system to monitor safety compliance |
| **Project Duration** | 3 months |
| **Camera Number** | 5 cameras |
| **Number of AI Module per Camera** | 3-4 modules |
| **AI Modules** | Safety Helmet Detection, Safety Vest Detection, Safety Boots Detection |

## 3. SCOPE OF WORK

**viAct Responsibilities:**
- Software: license, maintenance, support
- Camera integration
- AI model training and deployment

**Client Responsibilities:**
- Hardware: Procurement, configuration, installation
- Network infrastructure
- Camera installation and configuration

## 4. SYSTEM ARCHITECTURE

Cloud deployment method.

The proposed system architecture supports fast deployment with cameras transmitting real-time video streams via RTSP to AI cloud server.

## 5. SYSTEM REQUIREMENTS

### Network
- External bandwidth: 20 Mbps (for remote access)
- Per-camera bandwidth: 12 Mbps
- Total system bandwidth: 60 Mbps (12 Mbps × 5 cameras)

### Camera
- Resolution: 1080p@25fps (minimum)
- Connectivity Type: IP-based cameras with RTSP support

### AI Inference Workstation
- CPU: Intel Core i7-14700K
- GPU: RTX 4080
- RAM: 64GB
- Storage: 2TB SSD
- Operating System: Ubuntu 24.04
- Quantity: 1 workstation

## 6. IMPLEMENTATION PLAN (TIMELINE)

**Phase T0**: Project awarded

**Phase T1**: Hardware deployment finish (T0 + 2-4 weeks)

**Phase T2**: Software deployment finish (T1 + Dev_time)
- 4-6 weeks for pre-built AI module
- 2-3 months for customized AI modules

**Phase T3**: Project hand-off (T2 + 1-2 weeks)

## 7. PROPOSED MODULES & FUNCTIONAL DESCRIPTION

### Module: Safety Helmet Detection
**Module Type**: Standard

**Purpose**: Detects workers without safety helmet on the construction site.

**Alert Logic**: AI will capture people not wearing helmet and trigger real-time alerts.

**Preconditions**: Camera must maintain a suitable distance for clear observation, typically between 3 to 5 meters.

### Module: Safety Vest Detection
**Module Type**: Standard

**Purpose**: Identifies workers wearing high-visibility vests.

**Alert Logic**: Detect workers without safety reflective vest before entering the site and trigger alerts.

**Preconditions**: Camera angle must be configured to capture worker's upper body.

### Module: Safety Boots Detection
**Module Type**: Standard

**Purpose**: Detect workers without safety boots before entering the site.

**Alert Logic**: Alert will be sent out immediately to site supervisors.

**Preconditions**: Camera angle must be configured to capture worker's shoes.

## 8. USER INTERFACE & REPORTING

### Alerts & Notifications
- Email alerts
- Dashboard notifications
- Mobile app alerts

### Dashboard Visualizations
- Event Analysis
- Alert Timelines
- Evidence Snapshots

### Daily / Weekly Summary Reports
- Automated reporting features
- Excel export
- PDF export

