---
name: proposal-checklist-update
description: Update proposal template file based on presale checklist confirmation. Use when presale has filled the checklist answers and template needs to be updated to remove placeholders. Validates checklist completion and updates template by replacing placeholders with presale-confirmed values.
---

# Proposal Checklist Update Skill

## Instruction

You are tasked with updating a proposal template file after presale team has confirmed the checklist. This skill validates checklist completion and updates the template file by removing placeholders based on presale answers.

## Task

After presale has filled the checklist file, update the template file:
1. **Validate** that checklist has been completed by presale (all placeholders have answers)
2. **Update** template file by replacing placeholders with presale-confirmed values
3. **Validate** that template has no remaining placeholders

## Overview

This skill handles the mandatory checkpoint after proposal generation. It ensures that:
- Checklist has been completed by presale team
- Template is updated based on presale answers
- Template has no remaining placeholders before proceeding to next workflow step

## Resources Available

This skill includes the following resources (loaded as needed):

- **UPDATE_TEMPLATE_SCRIPT.md**: Detailed documentation for the update process
- **CHECKLIST_VALIDATION_GUIDE.md**: Complete guide for checklist validation workflow
- **scripts/validate_checklist_completion.py**: Script to validate checklist has been completed
- **scripts/update_template_from_checklist.py**: Script to update template from checklist
- **scripts/validate_no_placeholders.py**: Script to validate template has no placeholders

## When to Use This Skill

Use this skill when:
- Presale has filled the checklist file (presale's Answer column completed)
- Template file needs to be updated to remove placeholders
- User asks to update template from checklist
- User mentions "checklist confirmation", "update template", "remove placeholders"
- Before proceeding to next workflow step (e.g., slide-content-mapper)

## Process

### Step 1: Validate Checklist Completion

**MANDATORY**: Before updating template, validate that checklist has been completed by presale team.

```bash
python scripts/validate_checklist_completion.py \
    [Project_Name]_checklist.md \
    [Project_Name]_template.md
```

**Expected Output:**
```
✅ Checklist is complete - all placeholders have presale answers!
```

**If errors:**
```
❌ Checklist is NOT complete: X error(s) found
⚠️  ACTION REQUIRED: Presale team must fill all answers in checklist before proceeding.
```

**What this validates:**
- All placeholders in checklist have presale answers (not empty)
- All placeholders from template are present in checklist
- Checklist format is correct

**If validation fails:**
- Do NOT proceed to update template
- Request presale to complete all answers in checklist
- Re-run validation after presale completes checklist

### Step 2: Update Template File

After checklist validation passes, update the template file using the automated script:

```bash
python scripts/update_template_from_checklist.py \
    [Project_Name]_checklist.md \
    [Project_Name]_template.md
```

**Script Logic:**

1. **If presale's Answer is empty** (presale agrees with LLM estimate):
   - Keep the estimated value from template
   - Remove placeholder ID
   - Example: `20 Mbps [NETWORK_001]` → `20 Mbps` (if presale answer is empty)

2. **If presale's Answer has content** (presale updates estimate):
   - Replace estimated value with presale's Answer
   - Remove placeholder ID
   - Example: `20 Mbps [NETWORK_001]` → `50 Mbps` (if presale answer is "50 Mbps")

**Script Features:**
- Creates backup file automatically (if updating in-place)
- Shows detailed summary of changes
- Handles all placeholders in template
- Preserves template formatting

**Output Summary:**
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

### Step 3: Validate No Placeholders Remaining

**MANDATORY**: After updating template, validate that no placeholders remain:

```bash
python scripts/validate_no_placeholders.py [Project_Name]_template.md
```

**Expected Output:**
```
✅ Template is ready - no placeholders remaining!
✅ Safe to proceed to next step (slide-content-mapper)
```

**If errors:**
```
❌ Template still contains X placeholder(s)
⚠️  DO NOT proceed to next step until all placeholders are removed!
```

**What this validates:**
- Template has no remaining placeholder IDs (e.g., `[NETWORK_001]`)
- All placeholders have been replaced or removed
- Template is ready for next workflow step

**If validation fails:**
- Review update summary from Step 2
- Check if any placeholders were missed
- Manually update remaining placeholders if needed
- Re-run validation

### Step 4: Workflow Checkpoint

This skill represents a **MANDATORY CHECKPOINT** in the proposal generation workflow:

```
Generate Template (proposal-generation skill)
  ↓
Validate Format
  ↓
⚠️ PRESALE REVIEW CHECKLIST (MANDATORY)
  ↓
Validate Checklist Completion (this skill - Step 1)
  ↓
Update Template (this skill - Step 2)
  ↓
Validate No Placeholders (this skill - Step 3)
  ↓
✅ Ready for Next Step (slide-content-mapper, etc.)
```

**Important Notes:**
- ⚠️ **DO NOT** proceed to next step if template still contains placeholders
- ⚠️ **DO NOT** skip the checklist confirmation step
- ✅ Only proceed when `validate_no_placeholders.py` passes
- ✅ This checkpoint ensures template quality before downstream processing

## Output

After successful completion:

1. **Updated Template File**: `[Project_Name]_template.md`
   - All placeholders removed
   - Values confirmed by presale
   - Ready for next workflow step

2. **Backup File** (if updated in-place): `[Project_Name]_template.backup_YYYYMMDD_HHMMSS.md`
   - Original template before update
   - For reference or rollback if needed

## Using Resources

- **When validating checklist**: Run `python scripts/validate_checklist_completion.py <checklist_file> [template_file]`
- **When updating template**: Run `python scripts/update_template_from_checklist.py <checklist_file> <template_file>`
- **When validating no placeholders**: Run `python scripts/validate_no_placeholders.py <template_file>`
- **For detailed documentation**: Read `UPDATE_TEMPLATE_SCRIPT.md` and `CHECKLIST_VALIDATION_GUIDE.md`

## Important Rules

### Update Rules

1. **Empty Presale Answer** (Presale Agrees):
   - Keep estimated value from template
   - Remove placeholder ID only
   - Example: `20 Mbps [NETWORK_001]` → `20 Mbps`

2. **Presale Answer Provided** (Presale Updates):
   - Replace estimated value with presale answer
   - Remove placeholder ID
   - Example: `20 Mbps [NETWORK_001]` → `50 Mbps` (if presale answer is "50 Mbps")

3. **Validation Requirements**:
   - Checklist must be validated before update
   - Template must be validated after update
   - Both validations must pass before proceeding

### Workflow Rules

1. **Mandatory Sequence**:
   - Step 1 (Validate Checklist) → Step 2 (Update Template) → Step 3 (Validate No Placeholders)
   - Do NOT skip any step
   - Do NOT proceed if any validation fails

2. **Error Handling**:
   - If checklist validation fails → Request presale to complete checklist
   - If update fails → Review error messages and fix issues
   - If placeholder validation fails → Manually fix remaining placeholders

3. **Quality Assurance**:
   - Always create backup before updating (script does this automatically)
   - Review update summary to verify changes
   - Verify template is clean before proceeding

## Examples

### Example 1: Presale Agrees with Estimate

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

### Example 2: Presale Updates Estimate

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

## Troubleshooting

### Checklist validation fails

**Problem**: Checklist has empty presale answers

**Solution**:
1. Check checklist file format
2. Ensure presale has filled all answers
3. Re-run `validate_checklist_completion.py`

### Template update fails

**Problem**: Script cannot find placeholders or update fails

**Solution**:
1. Check placeholder IDs match between checklist and template
2. Verify template format is correct
3. Check file paths are correct
4. Review error messages from script

### Placeholders still remain after update

**Problem**: Some placeholders not removed

**Solution**:
1. Review update summary to see which placeholders were processed
2. Check if placeholder IDs match exactly
3. Manually update remaining placeholders if needed
4. Re-run `validate_no_placeholders.py`

## Related Skills

- **proposal-generation**: Generates initial template, reasoning, and checklist files
- Use this skill after `proposal-generation` skill completes

