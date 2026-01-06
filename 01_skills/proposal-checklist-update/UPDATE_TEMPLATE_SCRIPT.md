# Update Template from Checklist Script

## Overview

The `update_template_from_checklist.py` script automatically updates the template file based on presale checklist answers.

## Logic

### Rule 1: Empty Presale Answer (Presale Agrees with LLM Estimate)
- **If**: `presale's Answer` column is empty or blank
- **Then**: Keep the estimated value from template, remove placeholder ID
- **Example**:
  - Template: `20 Mbps [NETWORK_001]`
  - Checklist presale's Answer: (empty)
  - Result: `20 Mbps`

### Rule 2: Presale Answer Provided (Presale Updates Estimate)
- **If**: `presale's Answer` column has content
- **Then**: Replace estimated value with presale's Answer, remove placeholder ID
- **Example**:
  - Template: `20 Mbps [NETWORK_001]`
  - Checklist presale's Answer: `50 Mbps`
  - Result: `50 Mbps`

## Usage

### Basic Usage (Update In-Place with Backup)

```bash
python3 scripts/update_template_from_checklist.py \
    [Project_Name]_checklist.md \
    [Project_Name]_template.md
```

This will:
1. Create a backup file: `[Project_Name]_template.backup_YYYYMMDD_HHMMSS.md`
2. Update the template file in-place
3. Show summary of changes

### Output to New File

```bash
python3 scripts/update_template_from_checklist.py \
    [Project_Name]_checklist.md \
    [Project_Name]_template.md \
    --output [Project_Name]_template_updated.md
```

This will:
1. Keep original template unchanged
2. Write updated content to new file
3. Show summary of changes

## Output Summary

The script provides a detailed summary:

```
✅ Template updated successfully!

==================================================
Update Summary:
==================================================

✅ Kept estimated values (presale agreed): X
   - [PLACEHOLDER_ID]: estimated value...

🔄 Replaced with presale answers: Y
   - [PLACEHOLDER_ID]:
     Old: old estimated value...
     New: presale answer...

⚠️  Placeholders in checklist but not in template: Z
   - PLACEHOLDER_ID
```

## Examples

### Example 1: Presale Agrees (Empty Answer)

**Checklist:**
```
| NETWORK_001 | ... | 20 Mbps (estimated) | |
```

**Template before:**
```
- **External bandwidth:** 20 Mbps [NETWORK_001]
```

**Template after:**
```
- **External bandwidth:** 20 Mbps
```

### Example 2: Presale Updates (Answer Provided)

**Checklist:**
```
| NETWORK_001 | ... | 20 Mbps (estimated) | 50 Mbps |
```

**Template before:**
```
- **External bandwidth:** 20 Mbps [NETWORK_001]
```

**Template after:**
```
- **External bandwidth:** 50 Mbps
```

### Example 3: Complex Text with Placeholder

**Checklist:**
```
| TIMELINE_001 | ... | Implementation within 3-4 weeks | |
```

**Template before:**
```
**Project Duration:** Implementation within 3-4 weeks once project is awarded [TIMELINE_001]
```

**Template after:**
```
**Project Duration:** Implementation within 3-4 weeks once project is awarded
```

## Integration with Workflow

This script is part of the mandatory checklist validation workflow:

```
1. Generate Template Files
   ↓
2. Validate Output Format
   ↓
3. ⚠️ PRESALE REVIEW CHECKLIST (MANDATORY)
   ↓
4. Validate Checklist Completion
   ↓
5. Update Template (update_template_from_checklist.py) ← THIS SCRIPT
   ↓
6. Validate No Placeholders
   ↓
7. ✅ Ready for Next Step
```

## Safety Features

1. **Backup Creation**: When updating in-place, a backup is automatically created
2. **No Changes if No Placeholders**: Script won't modify file if no placeholders found
3. **Detailed Summary**: Shows exactly what was changed
4. **Error Handling**: Validates checklist format before processing

## Troubleshooting

### Script reports "No changes made"

**Possible causes:**
- All placeholders already removed from template
- Placeholder IDs in checklist don't match template
- Checklist format is incorrect

**Solution:**
1. Check placeholder IDs match between checklist and template
2. Verify checklist table format is correct
3. Run `validate_checklist_completion.py` first

### Placeholder not found in template

**Possible causes:**
- Placeholder was already removed
- Placeholder ID mismatch
- Placeholder in different format

**Solution:**
1. Check if placeholder exists: `grep -E "\[PLACEHOLDER_ID\]" template.md`
2. Verify placeholder ID spelling matches exactly
3. Check if placeholder format is correct: `[estimated value] [PLACEHOLDER_ID]`

## Related Scripts

- **validate_checklist_completion.py**: Validate checklist is complete before updating
- **validate_no_placeholders.py**: Validate all placeholders removed after updating
- **validate_output.py**: Validate template format

