# Architecture Generator Skill

Agent Skill để generate System Architecture Mermaid diagrams từ proposal templates (từ proposal-template-generation-skill).

> 📖 **Xem hướng dẫn chi tiết**: [SKILL.md](./SKILL.md) - Hướng dẫn đầy đủ cách sử dụng skill

## Quick Start

```bash
# Parse proposal và generate architecture diagram
cd scripts
python3 generate_architecture.py <proposal_template.md>

# Hoặc với output directory
python3 generate_architecture.py <proposal_template.md> ./output
```

## Cấu Trúc

```
architecture-generator-skill/
├── SKILL.md                    # Main instructions (Level 2)
├── ARCHITECTURE_TEMPLATES.md   # Architecture patterns from KB (Level 3)
├── README.md                   # This file
├── scripts/
│   ├── parse_proposal.py           # Parse proposal template
│   ├── generate_mermaid.py         # Generate Mermaid diagram
│   └── generate_architecture.py    # Main script (combines both)
└── ...
```

## Features

✅ **Matches KB Examples**: Architecture diagrams match the clean, client-friendly format from KB "DOCUMENT" dataset

✅ **Essential Flow Only**: Shows only what clients need: Camera → Processing → Dashboard & Alert

✅ **AI Modules Listed**: Lists all AI modules with full names (no M1:, M2: prefixes)

✅ **NVR Handling**: Shows NVR only when needed, marked as optional

✅ **No Internal Details**: Hides DB, API Gateway, Auth Service (internal implementation)

✅ **Clean Layout**: Professional, readable, matches proposal slides

## Input

**Proposal Template** (from proposal-template-generation-skill):
- Markdown file with proposal content
- Contains: Camera number, AI modules, Deployment method, Alert methods

## Output

**Architecture Diagram**:
- `[Project_Name]_architecture_diagram.md`: Mermaid diagram code
- `[Project_Name]_project_info.json`: Extracted project information

## Usage

### For Agent (Claude):

**Agent sẽ tự động:**
1. Detect khi user cung cấp proposal template hoặc yêu cầu architecture diagram
2. **Execute script**: `python3 scripts/generate_architecture.py <proposal_file.md>`
3. Đọc output files đã được generate
4. Trình bày architecture diagram cho user

**Agent KHÔNG cần tự parse/generate** - script đã làm sẵn tất cả!

> 📖 **Xem chi tiết**: [AGENT_USAGE.md](./AGENT_USAGE.md) - Hướng dẫn cho agent

### Command Line (User tự chạy):

```bash
# Generate architecture from proposal template
python3 scripts/generate_architecture.py proposal_template.md

# With custom output directory
python3 scripts/generate_architecture.py proposal_template.md ./output
```

**Command line hoạt động độc lập** - không cần agent, perfect cho automation.

## Architecture Types

### Cloud Architecture
- On-Site: Cameras, (NVR optional), Internet Connection
- Cloud: viAct's CMP, Online Dashboard, Alert System
- AI Modules: Listed separately

### On-Premise Architecture
- On-Site: Cameras, (NVR optional), AI Processing, Local Dashboard, Alert System
- AI Modules: Listed separately

### Hybrid Architecture
- On-Site: Cameras, (NVR optional), AI Processing, Local Dashboard, Internet
- Cloud: viAct's Cloud (Training), Online Dashboard, Alert System
- AI Modules: Listed separately

## Key Principles

1. **Match KB Examples**: Always reference KB "DOCUMENT" dataset for patterns
2. **Essential Information Only**: Show only what clients need to understand flow
3. **List All Modules**: Don't just show count, list all module names
4. **NVR Optional**: Show NVR only when needed, mark as optional
5. **Clean Flow**: Camera → Processing → Dashboard & Alert
6. **No Internal Details**: Hide DB, API Gateway, Auth Service

## Progressive Disclosure

Skill sử dụng progressive disclosure:

1. **Level 1 (Startup)**: Metadata từ SKILL.md frontmatter
2. **Level 2 (Triggered)**: SKILL.md được load khi skill được trigger
3. **Level 3 (As Needed)**: Resources chỉ được load khi cần:
   - ARCHITECTURE_TEMPLATES.md khi cần architecture patterns
   - Scripts khi cần parse/generate

## Testing

Test skill với sample proposal template:
```bash
# Trong Claude Code hoặc command line
python3 scripts/generate_architecture.py sample_proposal_template.md
# Verify output: architecture_diagram.md, project_info.json
```

## Maintenance

- Update SKILL.md khi có thay đổi process
- Update ARCHITECTURE_TEMPLATES.md khi có patterns mới từ KB
- Update scripts khi có thay đổi parsing/generation logic

## References

- [Agent Skills Overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- [Skills Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- KB "DOCUMENT" dataset for architecture examples

