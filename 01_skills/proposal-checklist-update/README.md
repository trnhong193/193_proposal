# Proposal Checklist Update Skill

This skill updates proposal template file based on presale checklist confirmation.

## Overview

Handles the mandatory checkpoint after proposal generation:
1. Validates checklist completion
2. Updates template from checklist answers
3. Validates no placeholders remain

## Quick Start

```bash
# Validate checklist completion
python scripts/validate_checklist_completion.py <checklist.md> <template.md>

# Update template from checklist
python scripts/update_template_from_checklist.py <checklist.md> <template.md>

# Validate no placeholders
python scripts/validate_no_placeholders.py <template.md>
```

## Resources

- **UPDATE_TEMPLATE_SCRIPT.md**: Detailed documentation for update process
- **CHECKLIST_VALIDATION_GUIDE.md**: Complete validation workflow guide

## Scripts

- **validate_checklist_completion.py**: Validate checklist has been completed
- **update_template_from_checklist.py**: Update template from checklist
- **validate_no_placeholders.py**: Validate template has no placeholders

## Update Logic

- **Empty presale answer**: Keep estimated value, remove placeholder ID
- **Presale answer provided**: Replace estimated value with presale answer, remove placeholder ID

## Workflow

```
Generate Template (proposal-generation)
  ↓
Presale Review Checklist
  ↓
Validate Checklist Completion
  ↓
Update Template
  ↓
Validate No Placeholders
  ↓
Ready for Next Step
```

## See Also

- **SKILL.md**: Complete skill documentation
- **proposal-generation**: Skill for generating initial proposal files

