# System Architecture: Video Analytics Solution Proposal for AVA Project - Nas Ltd

**Client:** AVA Project - Nas Ltd
**Deployment Method:** CLOUD
**Cameras:** 6
**AI Modules:** 5

---

## Architecture Diagram

```mermaid
graph TB
    subgraph "On-Site Infrastructure"
        Cameras["Up to 6 Cameras<br/>IP-based Camera"]
        
        Internet["Internet Connection<br/>(Provided by Client)"]
    end
    
    subgraph "Cloud Infrastructure"
        Cloud_Training["AI Training<br/>(Cloud)"]
        Cloud_Inference["On-cloud in AWS<br/>(viAct's CMP)<br/>Helmet Detection<br/>Hi-vis vest detection<br/>Fire & Smoke Detection<br/>Anti-Collision<br/>Restricted Zone detection"]
    end
    
    subgraph "Output Services"
        Dashboard["Centralized Dashboard"]
        Alert["Alert/Notification<br/>(Email & Telegram & Dashboard)"]
        HSE_Manager["HSE Manager"]
    end
    
    Cameras -->|RTSP Links| Internet
    Internet -->|RTSP Links| Cloud_Inference
    Cloud_Training -->|Trained Models| Cloud_Inference
    Cloud_Inference -->|Detection Results| Dashboard
    Cloud_Inference -->|Alerts| Alert
    Dashboard -->|Information & Alerts| HSE_Manager
    Alert -->|Notifications| HSE_Manager
    style Cloud_Training fill:#e1f5ff,stroke:#01579b,stroke-width:2px,color:#000000
    style Cloud_Inference fill:#81d4fa,stroke:#0277bd,stroke-width:3px,color:#000000
    style Dashboard fill:#fff4e1,stroke:#e65100,stroke-width:2px,color:#000000
    style Alert fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#000000
    style HSE_Manager fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#000000
    style Internet fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#000000
    style Cameras fill:#ffffff,stroke:#424242,stroke-width:2px,color:#000000
    classDef aiModuleStyle fill:#f5f5f5,stroke:#616161,stroke-width:2px,color:#000000


```
