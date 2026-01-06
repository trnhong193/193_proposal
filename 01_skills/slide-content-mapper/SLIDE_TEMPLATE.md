# Slide Template Structure - Based on KB Analysis

> **Purpose**: Universal slide template structure dùng cho tất cả technical proposals. Dựa trên phân tích các proposal slides thực tế trong KB.
> 
> **Source**: KB dataset "viAct_Proposal" - Analyzed from 17+ real proposal slides

---

## Overview

Template này định nghĩa cấu trúc slides cho technical proposals, mapping từ `TEMPLATE.md` (proposal content) sang slide structure. Mỗi section trong `TEMPLATE.md` tương ứng với một hoặc nhiều slides.

**Key Principles**:
- ✅ Chỉ xử lý **dynamic content** (thay đổi theo project)
- ❌ Bỏ qua **static slides** (viAct introduction, standard disclaimers)
- ✅ Dựa trên **KB proposals thực tế** (verified structure)
- ✅ **Reusable** cho nhiều projects

---

## Slide Mapping: TEMPLATE.md → Slides

| TEMPLATE.md Section | Slide Number(s) | Slide Type | Layout |
|---------------------|-----------------|------------|--------|
| 1. Cover Page | Slide 1 | Title slide | `title` |
| 2. Project Requirement Statement | Slide 2 | Content slide | `content_table` hoặc `content_bullets` |
| 3. Scope of Work | Slide 3-4 | Two-column | `two_column` |
| 4. System Architecture | Slide 5-6 | Diagram + Description | `diagram` + `content` |
| 5. System Requirements | Slide 7-10 | Multiple content slides | `content_table` hoặc `content_bullets` |
| 6. Implementation Plan | Slide 11-12 | Timeline + Milestones | `timeline` + `content_bullets` |
| 7. Proposed Modules | Slide 13-20+ | Module descriptions | `content_bullets` (1 slide per module group) |
| 8. User Interface & Reporting | Slide 21-23 | Content slides | `content_bullets` |

**Total Slides**: ~20-30 slides (tùy số lượng modules)

---

## Slide Type Definitions

### 1. Title Slide (`title`)
**Usage**: Cover page
**Layout**: Centered title + subtitle + date
**Content Structure**:
```json
{
  "slide_number": 1,
  "type": "title",
  "title": "Video Analytics Solution Proposal for [Client Name]",
  "subtitle": "[Work Scope - one liner]",
  "date": "[Proposal Date]",
  "logo_path": "optional_client_logo.png"
}
```

**Example from KB**:
- Title: "Video Analytics Solution Proposal For STS Oman"
- Subtitle: "Implement AI-based video analytics to detect unsafe working conditions..."
- Date: "05 2025"

---

### 2. Content Slide - Bullet Points (`content_bullets`)
**Usage**: General content with bullet points
**Layout**: Title + Bullet points
**Content Structure**:
```json
{
  "slide_number": 2,
  "type": "content_bullets",
  "title": "Project Requirement Statement",
  "content": [
    {
      "level": 0,
      "text": "Project: AI-based video analytics to monitor unsafe working conditions"
    },
    {
      "level": 0,
      "text": "Project Owner: STS Oman"
    },
    {
      "level": 0,
      "text": "Project duration: 3 months"
    },
    {
      "level": 0,
      "text": "Camera number: 5"
    },
    {
      "level": 1,
      "text": "AI modules:"
    },
    {
      "level": 2,
      "text": "Safety gloves (job-specific) detection"
    },
    {
      "level": 2,
      "text": "Detect when banksman and rigger present on the trailer"
    }
  ]
}
```

---

### 3. Content Slide - Table (`content_table`)
**Usage**: Structured data (Project Requirement Statement, System Requirements)
**Layout**: Title + Table
**Content Structure**:
```json
{
  "slide_number": 2,
  "type": "content_table",
  "title": "Project Requirement Statement",
  "table": {
    "headers": ["Field", "Value"],
    "rows": [
      ["Project", "AI-based video analytics to monitor unsafe working conditions"],
      ["Project Owner", "STS Oman"],
      ["Project Duration", "3 months"],
      ["Camera Number", "5 cameras"],
      ["AI Modules", "Safety gloves detection, Helmet detection, ..."]
    ]
  }
}
```

**Note**: Có thể dùng table hoặc bullet points tùy content. Table phù hợp khi có nhiều key-value pairs.

---

### 4. Two-Column Slide (`two_column`)
**Usage**: Scope of Work (viAct vs Client responsibilities)
**Layout**: Title + Two columns side-by-side
**Content Structure**:
```json
{
  "slide_number": 3,
  "type": "two_column",
  "title": "Scope of Work",
  "left_column": {
    "title": "viAct Responsibilities",
    "content": [
      "Software: license, maintenance, support",
      "Camera integration",
      "AI model training and deployment"
    ]
  },
  "right_column": {
    "title": "Client Responsibilities",
    "content": [
      "Hardware: Procurement, configuration, installation",
      "Network infrastructure",
      "Camera installation and configuration"
    ]
  }
}
```

**Example from KB**:
- Left: "viAct: Software: license, maintenance, support • Camera integration"
- Right: "Client: Camera provides RTSP link • Stable internet & other hardwares..."

---

### 5. Diagram Slide (`diagram`)
**Usage**: System Architecture diagram
**Layout**: Title + Large image area
**Content Structure**:
```json
{
  "slide_number": 5,
  "type": "diagram",
  "title": "Proposed System Architecture",
  "diagram": {
    "type": "mermaid",
    "code": "graph TB\n    subgraph \"On-Site\"...",
    "description": "Optional: Brief architecture description text below diagram"
  }
}
```

**Note**: Diagram được generate từ architecture-diagram-generator skill, convert Mermaid → PNG image.

---

### 6. Timeline Slide (`timeline`)
**Usage**: Implementation Plan timeline
**Layout**: Title + Visual timeline (Gantt-like) hoặc bullet points
**Content Structure**:
```json
{
  "slide_number": 11,
  "type": "timeline",
  "title": "Implementation Plan",
  "timeline": {
    "format": "milestones",  // or "gantt"
    "milestones": [
      {
        "phase": "T0",
        "event": "Project awarded",
        "date": ""
      },
      {
        "phase": "T1",
        "event": "Hardware deployment finish",
        "date": "T0 + 2-4 weeks"
      },
      {
        "phase": "T2",
        "event": "Software deployment finish",
        "date": "T1 + Dev_time",
        "notes": [
          "4-6 weeks for pre-built AI module",
          "2-3 months for customized AI modules"
        ]
      },
      {
        "phase": "T3",
        "event": "Project hand-off",
        "date": "T2 + 1-2 weeks"
      }
    ]
  }
}
```

**Example from KB**:
- Common format: Vertical timeline với milestones
- Alternative: Bullet points format

---

### 7. Module Description Slide (`module_description`)
**Usage**: Individual AI module descriptions
**Layout**: Title + Structured content
**Content Structure**:
```json
{
  "slide_number": 13,
  "type": "module_description",
  "title": "Safety Gloves Detection",
  "module_type": "Custom",
  "content": {
    "purpose": "Detects the presence of dedicated safety gloves to ensure workers meet safety gear regulation when lifting beams.",
    "alert_logic": "AI will capture people not wearing dedicated safety gloves and trigger real-time alerts to network strobe siren.",
    "preconditions": "Camera must maintain a suitable distance for clear observation of workers, typically between 3 to 5 meters.",
    "data_requirements": "Request: Provide gloves images (color, type) for model training",
    "image_url": "https://example.com/image.jpg",
    "video_url": "https://drive.google.com/file/d/..."
  }
}
```

**Note**: Nếu nhiều modules cùng group (e.g., PPE Detection), có thể group trên 1 slide hoặc tách thành multiple slides.

---

## Detailed Slide-by-Slide Structure

### Slide 1: Cover Page
- **Type**: `title`
- **Source**: TEMPLATE.md Section 1
- **Content**:
  - Title: "Video Analytics Solution Proposal for [Client Name]"
  - Subtitle: Work Scope (from Section 2 - Work Scope, one-liner)
  - Date: Proposal submission date
  - Optional: Client logo

---

### Slide 2: Project Requirement Statement
- **Type**: `content_table` hoặc `content_bullets`
- **Source**: TEMPLATE.md Section 2
- **Content Fields**:
  - Project (general pain point)
  - Project Owner
  - Work Scope
  - Project Duration
  - Camera Number
  - Number of AI Module per Camera
  - AI Modules (list)

**Decision**: Table format nếu có nhiều fields, bullet points nếu format đơn giản hơn.

---

### Slide 3-4: Scope of Work
- **Type**: `two_column`
- **Source**: TEMPLATE.md Section 3
- **Content**:
  - **Left Column**: viAct Responsibilities
  - **Right Column**: Client Responsibilities

**Note**: Có thể 1 slide (nếu ngắn) hoặc 2 slides (nếu dài, tách thành multiple bullet points).

---

### Slide 5-6: System Architecture
- **Slide 5**: `diagram` - Architecture diagram (Mermaid → Image)
- **Slide 6**: `content` - Architecture description (optional, nếu cần mô tả chi tiết)
- **Source**: TEMPLATE.md Section 4 + Architecture diagram from architecture-generator skill

**Content**:
- Diagram: Generated từ architecture-diagram-generator
- Description: Data flow, components, network topology (if detailed description needed)

---

### Slide 7-10: System Requirements
- **Type**: `content_table` hoặc `content_bullets`
- **Source**: TEMPLATE.md Section 5

**Sub-slides**:
- **Slide 7**: Network Requirements
  - External bandwidth
  - Per-camera bandwidth
  - Total system bandwidth
- **Slide 8**: Camera Specifications
  - Resolution, frame rate
  - Connectivity type
- **Slide 9**: AI Inference Workstation
  - CPU, GPU, RAM, Storage, OS, Quantity
- **Slide 10**: Additional Workstations (if applicable)
  - AI Training Workstation
  - Dashboard Workstation
  - Additional Equipment

**Decision**: Tách thành multiple slides nếu content dài, hoặc combine nếu ngắn.

---

### Slide 11-12: Implementation Plan
- **Slide 11**: `timeline` - Visual timeline với milestones
- **Slide 12**: `content_bullets` - Deliverables and Milestones (optional, if using that format)
- **Source**: TEMPLATE.md Section 6

**Content**:
- Timeline: T0, T1, T2, T3 với dates
- Deliverables: List of milestones (if needed)

---

### Slide 13-20+: Proposed Modules
- **Type**: `module_description` hoặc `content_bullets`
- **Source**: TEMPLATE.md Section 7

**Structure**:
- **Option 1**: 1 slide per module (nếu modules nhiều)
- **Option 2**: Group modules (e.g., PPE Detection group → 1 slide với multiple modules)
- **Option 3**: Overview slide (list all modules) + Detail slides (per module)

**Recommended**: Group by category (PPE, Safety, Operations, etc.) → 1 slide per category.

**Content per Module**:
- Module Name
- Module Type (Standard/Custom)
- Purpose Description
- Alert Trigger Logic
- Detection Criteria (if custom)
- Preconditions
- Image URL (optional)
- Video URL (optional)
- Client Data Requirements (if custom)

---

### Slide 21-23: User Interface & Reporting
- **Type**: `content_bullets`
- **Source**: TEMPLATE.md Section 8

**Sub-slides**:
- **Slide 21**: Alerts & Notifications
  - Channels: Email, Mobile App, SMS, Dashboard, etc.
- **Slide 22**: Dashboard Visualizations
  - Event Analysis, Alert Timelines, Evidence Snapshots, Custom KPIs
- **Slide 23**: Daily/Weekly Summary Reports
  - Automated reporting features

---

## Slide Order Summary

```
1. Cover Page
2. Project Requirement Statement
3-4. Scope of Work
5-6. System Architecture
7-10. System Requirements
11-12. Implementation Plan
13-20+. Proposed Modules (varies by module count)
21-23. User Interface & Reporting
```

**Total**: ~20-30 slides (depends on number of modules and detail level)

---

## Layout Configurations

### Layout IDs (for PowerPoint template)

| Layout Name | Layout ID | Usage |
|-------------|-----------|-------|
| `title` | 0 | Cover page |
| `content_title_body` | 1 | Title + body content |
| `two_column` | 5 | Scope of Work |
| `blank` | 6 | Diagram slides (custom layout) |
| `title_only` | 7 | Title only |
| `content_section_header` | 8 | Section headers |

**Note**: Layout IDs có thể khác nhau tùy PowerPoint template. Cần configure trong `layout_mapping.json`.

---

## Content Formatting Rules

### Bullet Points
- **Level 0**: Main points (18pt font, bold)
- **Level 1**: Sub-points (16pt font)
- **Level 2**: Sub-sub-points (14pt font)

### Tables
- **Headers**: Bold, background color
- **Rows**: Alternating row colors (if possible)
- **Alignment**: Left-align text, center-align numbers

### Images
- **Diagram**: Full width, maintain aspect ratio
- **Logo**: Top-right corner (cover page), size: 1-1.5 inches

---

## Notes for Implementation

1. **Slide numbering**: Start from 1 (not 0)
2. **Speaker notes**: Optional, có thể thêm vào mỗi slide
3. **Branding**: Apply viAct colors, fonts (via master template)
4. **Consistency**: Ensure consistent formatting across slides
5. **Page breaks**: Split content nếu quá dài (multiple slides per section)

---

## Example JSON Structure

```json
{
  "project_name": "STS Oman Proposal",
  "total_slides": 25,
  "slides": [
    {
      "slide_number": 1,
      "type": "title",
      "title": "Video Analytics Solution Proposal for STS Oman",
      "subtitle": "Implement AI-based video analytics to detect unsafe working conditions",
      "date": "05 2025"
    },
    {
      "slide_number": 2,
      "type": "content_table",
      "title": "Project Requirement Statement",
      "table": {
        "headers": ["Field", "Value"],
        "rows": [
          ["Project", "AI-based video analytics to monitor unsafe working conditions"],
          ["Project Owner", "STS Oman"],
          ["Project Duration", "3 months"],
          ["Camera Number", "5 cameras"]
        ]
      }
    },
    {
      "slide_number": 3,
      "type": "two_column",
      "title": "Scope of Work",
      "left_column": {
        "title": "viAct Responsibilities",
        "content": [
          "Software: license, maintenance, support",
          "Camera integration"
        ]
      },
      "right_column": {
        "title": "Client Responsibilities",
        "content": [
          "Hardware: Procurement, configuration, installation",
          "Network infrastructure"
        ]
      }
    }
    // ... more slides
  ]
}
```

---

## Testing Checklist

Khi test slide-content-mapper, verify:

- [ ] Tất cả sections từ TEMPLATE.md đều được map vào slides
- [ ] Slide types đúng với content
- [ ] Slide numbering liên tục (1, 2, 3...)
- [ ] Content format đúng (bullet points, tables, etc.)
- [ ] Two-column slides có balance content
- [ ] Diagram slides có reference đến architecture diagram
- [ ] Module slides được group hợp lý
- [ ] JSON structure valid và parse được

---

## References

- **TEMPLATE.md**: Proposal content structure
- **KB Proposals**: Real proposal slides analyzed
- **Architecture diagrams**: From architecture-generator skill


