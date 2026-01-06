#!/usr/bin/env python3
"""
Validate that checklist has been completed by presale team.

This script checks:
1. All placeholder IDs in checklist have answers in the "presale's Answer" column
2. No empty answers (blank or whitespace only)
3. All placeholders from template are present in checklist

Usage:
    python validate_checklist_completion.py <checklist_file> [template_file]
"""

import re
import sys
from pathlib import Path

def extract_placeholders_from_template(template_content):
    """Extract all placeholder IDs from template file."""
    placeholder_pattern = r'\[([A-Z_]+\d+)\]'
    placeholders = set(re.findall(placeholder_pattern, template_content))
    return placeholders

def parse_checklist_table(checklist_content):
    """Parse checklist table and extract placeholder IDs with their answers."""
    # Find the table section
    table_start = checklist_content.find('| ID |')
    if table_start == -1:
        return None, "Checklist table not found"
    
    # Extract table lines
    lines = checklist_content[table_start:].split('\n')
    table_lines = []
    for line in lines:
        line = line.strip()
        if line.startswith('|') and not line.startswith('|---'):
            table_lines.append(line)
    
    if len(table_lines) < 2:  # Header + at least one data row
        return None, "Checklist table has no data rows"
    
    # Parse header to find column indices
    header = table_lines[0]
    columns = [col.strip() for col in header.split('|')[1:-1]]  # Remove empty first/last
    
    try:
        id_col = columns.index('ID')
        answer_col = columns.index("presale's Answer")
    except ValueError as e:
        return None, f"Required columns not found: {e}"
    
    # Parse data rows
    placeholders = {}
    for row in table_lines[1:]:  # Skip header
        cells = [cell.strip() for cell in row.split('|')[1:-1]]  # Remove empty first/last
        if len(cells) > max(id_col, answer_col):
            placeholder_id = cells[id_col].strip()
            answer = cells[answer_col].strip()
            
            # Remove brackets if present (e.g., [NETWORK_001] -> NETWORK_001)
            placeholder_id = re.sub(r'[\[\]]', '', placeholder_id)
            
            if placeholder_id:
                placeholders[placeholder_id] = answer
    
    return placeholders, None

def validate_checklist_completion(checklist_file, template_file=None):
    """Validate that checklist is complete."""
    errors = []
    warnings = []
    
    checklist_path = Path(checklist_file)
    if not checklist_path.exists():
        errors.append(f"❌ Checklist file not found: {checklist_file}")
        return errors, warnings
    
    checklist_content = checklist_path.read_text(encoding='utf-8')
    
    # Parse checklist table
    placeholders, parse_error = parse_checklist_table(checklist_content)
    if parse_error:
        errors.append(f"❌ Failed to parse checklist: {parse_error}")
        return errors, warnings
    
    if not placeholders:
        errors.append("❌ No placeholders found in checklist")
        return errors, warnings
    
    # Check for empty answers
    empty_answers = []
    for placeholder_id, answer in placeholders.items():
        if not answer or not answer.strip():
            empty_answers.append(placeholder_id)
    
    if empty_answers:
        errors.append(f"❌ Found {len(empty_answers)} placeholder(s) without presale answer:")
        for pid in empty_answers[:10]:  # Show first 10
            errors.append(f"   - {pid}")
        if len(empty_answers) > 10:
            errors.append(f"   ... and {len(empty_answers) - 10} more")
    
    # If template file provided, check all placeholders are in checklist
    if template_file:
        template_path = Path(template_file)
        if template_path.exists():
            template_content = template_path.read_text(encoding='utf-8')
            template_placeholders = extract_placeholders_from_template(template_content)
            
            # Find placeholders in template but not in checklist
            missing_in_checklist = template_placeholders - set(placeholders.keys())
            if missing_in_checklist:
                warnings.append(f"⚠️  Found {len(missing_in_checklist)} placeholder(s) in template but not in checklist:")
                for pid in list(missing_in_checklist)[:10]:
                    warnings.append(f"   - {pid}")
                if len(missing_in_checklist) > 10:
                    warnings.append(f"   ... and {len(missing_in_checklist) - 10} more")
            
            # Find placeholders in checklist but not in template (may be intentional)
            extra_in_checklist = set(placeholders.keys()) - template_placeholders
            if extra_in_checklist:
                warnings.append(f"⚠️  Found {len(extra_in_checklist)} placeholder(s) in checklist but not in template (may be intentional)")
    
    return errors, warnings

def main():
    if len(sys.argv) < 2:
        print("Usage: validate_checklist_completion.py <checklist_file> [template_file]")
        print("\nThis script validates that:")
        print("  1. All placeholders in checklist have presale answers")
        print("  2. No empty answers")
        print("  3. (Optional) All template placeholders are in checklist")
        sys.exit(1)
    
    checklist_file = sys.argv[1]
    template_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    print(f"\n📋 Validating checklist completion: {Path(checklist_file).name}")
    if template_file:
        print(f"📄 Cross-referencing with template: {Path(template_file).name}")
    
    errors, warnings = validate_checklist_completion(checklist_file, template_file)
    
    if errors:
        print("\n" + "\n".join(errors))
    
    if warnings:
        print("\n" + "\n".join(warnings))
    
    print(f"\n{'='*50}")
    if errors:
        print(f"❌ Checklist is NOT complete: {len(errors)} error(s) found")
        print("\n⚠️  ACTION REQUIRED: Presale team must fill all answers in checklist before proceeding.")
        sys.exit(1)
    elif warnings:
        print(f"⚠️  Checklist has {len(warnings)} warning(s) - review recommended")
        print("✅ All placeholders have presale answers")
    else:
        print("✅ Checklist is complete - all placeholders have presale answers!")
    
    sys.exit(0 if not errors else 1)

if __name__ == '__main__':
    main()

