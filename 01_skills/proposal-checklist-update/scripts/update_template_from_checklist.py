#!/usr/bin/env python3
"""
Update template file based on presale checklist answers.

This script:
1. Reads checklist file to get presale answers
2. For each placeholder in template:
   - If presale answer is empty → keep estimated value, remove placeholder ID
   - If presale answer has content → replace estimated value with presale answer, remove placeholder ID

Usage:
    python update_template_from_checklist.py <checklist_file> <template_file> [--output <output_file>]
    
    If --output is not specified, template file will be updated in-place (with backup).
"""

import re
import sys
from pathlib import Path
from datetime import datetime

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

def update_template_from_checklist(checklist_file, template_file, output_file=None):
    """Update template file based on checklist answers."""
    # Read checklist
    checklist_path = Path(checklist_file)
    if not checklist_path.exists():
        return False, f"Checklist file not found: {checklist_file}"
    
    checklist_content = checklist_path.read_text(encoding='utf-8')
    placeholders, parse_error = parse_checklist_table(checklist_content)
    
    if parse_error:
        return False, f"Failed to parse checklist: {parse_error}"
    
    if not placeholders:
        return False, "No placeholders found in checklist"
    
    # Read template
    template_path = Path(template_file)
    if not template_path.exists():
        return False, f"Template file not found: {template_file}"
    
    template_content = template_path.read_text(encoding='utf-8')
    original_content = template_content
    
    # Track updates
    updates = {
        'kept_estimate': [],  # Empty presale answer - kept estimate
        'replaced': [],       # Presale answer provided - replaced
        'not_found': []      # Placeholder in checklist but not in template
    }
    
    # Process each placeholder from checklist
    for placeholder_id, presale_answer in placeholders.items():
        # Pattern: (estimated value/text) [PLACEHOLDER_ID]
        # Match the placeholder ID with brackets
        pattern = rf'([^\[]+?)\s+\[{re.escape(placeholder_id)}\]'
        
        matches = list(re.finditer(pattern, template_content))
        
        if not matches:
            # Placeholder not found in template (may be intentional)
            updates['not_found'].append(placeholder_id)
            continue
        
        for match in matches:
            estimated_value = match.group(1).strip()
            full_match = match.group(0)
            
            if not presale_answer or not presale_answer.strip():
                # Empty presale answer → keep estimated value, remove placeholder ID
                replacement = estimated_value
                updates['kept_estimate'].append({
                    'id': placeholder_id,
                    'value': estimated_value
                })
            else:
                # Presale answer provided → replace with presale answer
                replacement = presale_answer.strip()
                updates['replaced'].append({
                    'id': placeholder_id,
                    'old': estimated_value,
                    'new': presale_answer.strip()
                })
            
            # Replace in template content
            template_content = template_content.replace(full_match, replacement, 1)
    
    # Check if any changes were made
    if template_content == original_content:
        return False, "No changes made to template (no placeholders found or already processed)"
    
    # Write output
    if output_file:
        output_path = Path(output_file)
        output_path.write_text(template_content, encoding='utf-8')
    else:
        # Create backup before updating in-place
        backup_path = template_path.with_suffix(f'.backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.md')
        backup_path.write_text(original_content, encoding='utf-8')
        template_path.write_text(template_content, encoding='utf-8')
        print(f"📦 Backup created: {backup_path.name}")
    
    return True, updates

def main():
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Update template file based on presale checklist answers'
    )
    parser.add_argument('checklist_file', help='Path to checklist file')
    parser.add_argument('template_file', help='Path to template file')
    parser.add_argument('--output', '-o', help='Output file path (default: update in-place with backup)')
    
    args = parser.parse_args()
    
    print(f"\n📋 Reading checklist: {Path(args.checklist_file).name}")
    print(f"📄 Reading template: {Path(args.template_file).name}")
    
    success, result = update_template_from_checklist(
        args.checklist_file,
        args.template_file,
        args.output
    )
    
    if not success:
        print(f"\n❌ Error: {result}")
        sys.exit(1)
    
    updates = result
    
    print(f"\n✅ Template updated successfully!")
    
    if args.output:
        print(f"📝 Output written to: {args.output}")
    else:
        print(f"📝 Template file updated in-place")
    
    # Print summary
    print(f"\n{'='*50}")
    print("Update Summary:")
    print(f"{'='*50}")
    
    if updates['kept_estimate']:
        print(f"\n✅ Kept estimated values (presale agreed): {len(updates['kept_estimate'])}")
        for item in updates['kept_estimate'][:5]:
            print(f"   - [{item['id']}]: {item['value'][:60]}...")
        if len(updates['kept_estimate']) > 5:
            print(f"   ... and {len(updates['kept_estimate']) - 5} more")
    
    if updates['replaced']:
        print(f"\n🔄 Replaced with presale answers: {len(updates['replaced'])}")
        for item in updates['replaced'][:5]:
            print(f"   - [{item['id']}]:")
            print(f"     Old: {item['old'][:50]}...")
            print(f"     New: {item['new'][:50]}...")
        if len(updates['replaced']) > 5:
            print(f"   ... and {len(updates['replaced']) - 5} more")
    
    if updates['not_found']:
        print(f"\n⚠️  Placeholders in checklist but not in template: {len(updates['not_found'])}")
        for pid in updates['not_found'][:5]:
            print(f"   - {pid}")
        if len(updates['not_found']) > 5:
            print(f"   ... and {len(updates['not_found']) - 5} more")
    
    print(f"\n{'='*50}")
    print("✅ Update complete!")
    print("\n💡 Next step: Run validate_no_placeholders.py to verify all placeholders are removed")
    
    sys.exit(0)

if __name__ == '__main__':
    main()

