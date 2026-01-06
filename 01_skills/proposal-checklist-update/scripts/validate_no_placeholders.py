#!/usr/bin/env python3
"""
Validate that template file has NO remaining placeholders.

This script checks that after presale has confirmed checklist and template has been updated,
there are no placeholders remaining in the template file.

Usage:
    python validate_no_placeholders.py <template_file>
"""

import re
import sys
from pathlib import Path

def find_placeholders(content):
    """Find all placeholders in template content."""
    # Pattern: [Estimated Value] [PLACEHOLDER_ID]
    placeholder_pattern = r'\[([A-Z_]+\d+)\]'
    placeholders = re.findall(placeholder_pattern, content)
    return set(placeholders)

def validate_no_placeholders(template_file):
    """Validate that template has no placeholders."""
    errors = []
    warnings = []
    
    template_path = Path(template_file)
    if not template_path.exists():
        errors.append(f"❌ Template file not found: {template_file}")
        return errors, warnings
    
    template_content = template_path.read_text(encoding='utf-8')
    
    # Find all placeholders
    placeholders = find_placeholders(template_content)
    
    if placeholders:
        errors.append(f"❌ Found {len(placeholders)} placeholder(s) still remaining in template:")
        for pid in sorted(placeholders)[:20]:  # Show first 20
            # Find line numbers where placeholder appears
            lines = template_content.split('\n')
            line_numbers = []
            for i, line in enumerate(lines, 1):
                if f'[{pid}]' in line:
                    line_numbers.append(i)
            if line_numbers:
                errors.append(f"   - [{pid}] (lines: {', '.join(map(str, line_numbers[:5]))})")
        if len(placeholders) > 20:
            errors.append(f"   ... and {len(placeholders) - 20} more")
        
        errors.append("\n⚠️  ACTION REQUIRED:")
        errors.append("   1. Presale team must review checklist and provide answers")
        errors.append("   2. Update template file by replacing placeholders with confirmed values")
        errors.append("   3. Run this validation again to confirm all placeholders are removed")
    else:
        warnings.append("✅ No placeholders found in template - ready for next step!")
    
    return errors, warnings

def main():
    if len(sys.argv) < 2:
        print("Usage: validate_no_placeholders.py <template_file>")
        print("\nThis script validates that template has NO remaining placeholders.")
        print("Use this AFTER presale has confirmed checklist and template has been updated.")
        sys.exit(1)
    
    template_file = sys.argv[1]
    
    print(f"\n📄 Validating template for remaining placeholders: {Path(template_file).name}")
    
    errors, warnings = validate_no_placeholders(template_file)
    
    if errors:
        print("\n" + "\n".join(errors))
    
    if warnings:
        print("\n" + "\n".join(warnings))
    
    print(f"\n{'='*50}")
    if errors:
        print(f"❌ Template still contains {len(errors)} placeholder(s)")
        print("\n⚠️  DO NOT proceed to next step until all placeholders are removed!")
        sys.exit(1)
    else:
        print("✅ Template is ready - no placeholders remaining!")
        print("✅ Safe to proceed to next step (slide-content-mapper)")
    
    sys.exit(0)

if __name__ == '__main__':
    main()

