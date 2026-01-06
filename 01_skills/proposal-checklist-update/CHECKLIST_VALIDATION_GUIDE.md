# Checklist Validation Guide

## Overview

After generating the `[Project_Name]_template.md` file, **MANDATORY** presale confirmation is required to ensure the template has no remaining placeholders before proceeding to the next step (e.g., slide-content-mapper).

## Validation Process

### Step 1: Validate Checklist Completion

Check that the checklist has been fully completed by presale team:

```bash
python3 scripts/validate_checklist_completion.py \
    [Project_Name]_checklist.md \
    [Project_Name]_template.md
```

**Expected Results:**
- ✅ **Pass**: All placeholders have presale answers
- ❌ **Fail**: Some placeholders still missing presale answers → **DO NOT** proceed

**Output when pass:**
```
✅ Checklist is complete - all placeholders have presale answers!
```

**Output when fail:**
```
❌ Checklist is NOT complete: X error(s) found
⚠️  ACTION REQUIRED: Presale team must fill all answers in checklist before proceeding.
```

### Step 2: Update Template File

After the checklist has been fully completed by presale, there are 2 ways to update the template:

#### Method 1: Use Script (Recommended)

Use the automated script to update the template:

```bash
python3 scripts/update_template_from_checklist.py \
    [Project_Name]_checklist.md \
    [Project_Name]_template.md
```

**Script automatically handles:**
- If presale's Answer is empty → keep the estimated value and remove placeholder
- If presale's Answer has content → replace estimated value with presale's Answer and remove placeholder
- Creates backup file before updating

**Example:**
- Template: `20 Mbps [NETWORK_001]`
- Checklist presale's Answer: (empty) → Template after update: `20 Mbps`
- Checklist presale's Answer: `50 Mbps` → Template after update: `50 Mbps`

#### Method 2: Manual Update

1. **Open file** `[Project_Name]_template.md`
2. **Replace all placeholders** with presale-confirmed values:
   - Find: `30 Mbps [NETWORK_001]`
   - If presale's Answer is empty → Replace with: `30 Mbps` (keep estimated value)
   - If presale's Answer has content → Replace with presale-confirmed value
3. **Remove all placeholder IDs** `[PLACEHOLDER_ID]` from template

### Step 3: Validate No Placeholders

Check that the template has no remaining placeholders:

```bash
python3 scripts/validate_no_placeholders.py [Project_Name]_template.md
```

**Expected Results:**
- ✅ **Pass**: Template has no placeholders → **ALLOWED** to proceed to next step
- ❌ **Fail**: Template still has placeholders → **NOT ALLOWED** to proceed to next step

**Output when pass:**
```
✅ Template is ready - no placeholders remaining!
✅ Safe to proceed to next step (slide-content-mapper)
```

**Output when fail:**
```
❌ Template still contains X placeholder(s)
⚠️  DO NOT proceed to next step until all placeholders are removed!
```

## Complete Workflow

```
1. Generate Template Files
   ↓
2. Validate Output Format (validate_output.py)
   ↓
3. ⚠️ PRESALE REVIEW CHECKLIST (MANDATORY)
   ↓
4. Validate Checklist Completion (validate_checklist_completion.py)
   ↓
5. Update Template (update_template_from_checklist.py)
   ↓
6. Validate No Placeholders (validate_no_placeholders.py)
   ↓
7. ✅ Ready for Next Step (slide-content-mapper)
```

## Important Notes

1. ⚠️ **DO NOT** proceed to next step if:
   - Checklist has not been fully completed by presale
   - Template still has placeholders

2. ✅ **ONLY** proceed to next step when:
   - `validate_checklist_completion.py` passes
   - `validate_no_placeholders.py` passes

3. 📋 **Checklist format:**
   - Must have "presale's Answer" column
   - All placeholders must have answers (cannot be empty)

4. 📄 **Template format after update:**
   - No remaining `[PLACEHOLDER_ID]` placeholders
   - Only keep presale-confirmed values

## Troubleshooting

### Checklist validation fails

**Problem**: Checklist has placeholders without presale answers

**Solution**:
1. Check if checklist file format is correct
2. Ensure presale has filled all answers
3. Re-run `validate_checklist_completion.py`

### Template validation fails

**Problem**: Template still has placeholders

**Solution**:
1. Find all placeholders: `grep -E "\[[A-Z_]+\d+\]" template.md`
2. Replace each placeholder with presale-confirmed value
3. Remove placeholder IDs
4. Re-run `validate_no_placeholders.py`

## Scripts Reference

- **validate_checklist_completion.py**: Check that checklist has been fully completed by presale
- **update_template_from_checklist.py**: Update template from checklist
- **validate_no_placeholders.py**: Check that template has no remaining placeholders

## Example

```bash
# Step 1: Generate template (using proposal-generation skill)
# Output: New2_template.md, New2_reasoning.md, New2_checklist.md

# Step 2: Validate format
python3 scripts/validate_output.py \
    ../01_test/New2_template.md \
    ../01_test/New2_reasoning.md \
    ../01_test/New2_checklist.md

# Step 3: Presale reviews and fills checklist
# (Manual step - presale fills "presale's Answer" column)

# Step 4: Validate checklist completion
python3 scripts/validate_checklist_completion.py \
    ../01_test/New2_checklist.md \
    ../01_test/New2_template.md
# Expected: ✅ Checklist is complete

# Step 5: Update template (remove placeholders)
python3 scripts/update_template_from_checklist.py \
    ../01_test/New2_checklist.md \
    ../01_test/New2_template.md
# Expected: ✅ Template updated successfully!

# Step 6: Validate no placeholders
python3 scripts/validate_no_placeholders.py ../01_test/New2_template.md
# Expected: ✅ Template is ready - no placeholders remaining!

# Step 7: Proceed to next step (slide-content-mapper)
cd ../slide-content-mapper
python3 scripts/map_to_slides.py ../01_test/New2_template.md "" tests/output/
```
