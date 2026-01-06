#!/usr/bin/env python3
"""
Verify slide structure JSON mapping correctness
"""

import json
import sys
from pathlib import Path


def verify_structure(json_file: str) -> bool:
    """Verify slide structure JSON"""
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"❌ File not found: {json_file}")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON: {e}")
        return False
    
    errors = []
    warnings = []
    
    # Check required fields
    required_fields = ["project_name", "client_name", "total_slides", "slides"]
    for field in required_fields:
        if field not in data:
            errors.append(f"Missing required field: {field}")
    
    # Check slides
    if "slides" in data:
        slides = data["slides"]
        
        if not slides:
            errors.append("No slides found in structure")
        
        # Check numbering
        slide_numbers = [s.get("slide_number") for s in slides]
        expected_numbers = list(range(1, len(slides) + 1))
        if slide_numbers != expected_numbers:
            errors.append(f"Slide numbering incorrect: {slide_numbers} vs {expected_numbers}")
        
        # Check for duplicate slide numbers
        if len(slide_numbers) != len(set(slide_numbers)):
            errors.append("Duplicate slide numbers found")
        
        # Check each slide has required fields
        for i, slide in enumerate(slides):
            slide_num = slide.get("slide_number", f"slide_{i}")
            if "slide_number" not in slide:
                errors.append(f"Slide {slide_num}: missing slide_number field")
            if "type" not in slide:
                errors.append(f"Slide {slide_num}: missing type field")
            if "title" not in slide:
                warnings.append(f"Slide {slide_num}: missing title field (optional)")
            
            # Check type-specific fields
            slide_type = slide.get("type")
            if slide_type == "two_column":
                if "left_column" not in slide:
                    errors.append(f"Slide {slide_num}: two_column type missing left_column")
                if "right_column" not in slide:
                    errors.append(f"Slide {slide_num}: two_column type missing right_column")
            elif slide_type == "content_table":
                if "table" not in slide:
                    errors.append(f"Slide {slide_num}: content_table type missing table")
            elif slide_type == "content_bullets":
                if "content" not in slide:
                    warnings.append(f"Slide {slide_num}: content_bullets type missing content")
            elif slide_type == "diagram":
                if "diagram" not in slide:
                    warnings.append(f"Slide {slide_num}: diagram type missing diagram (optional)")
            elif slide_type == "timeline":
                if "timeline" not in slide:
                    errors.append(f"Slide {slide_num}: timeline type missing timeline")
            elif slide_type == "module_description":
                if "content" not in slide:
                    warnings.append(f"Slide {slide_num}: module_description type missing content")
        
        # Check total matches
        if data.get("total_slides") != len(slides):
            errors.append(f"total_slides ({data.get('total_slides')}) != actual count ({len(slides)})")
    
    # Report
    if errors:
        print("❌ Errors found:")
        for error in errors:
            print(f"  - {error}")
        return False
    
    if warnings:
        print("⚠️  Warnings:")
        for warning in warnings:
            print(f"  - {warning}")
    
    if not errors:
        print("✅ All checks passed!")
        print(f"   Project: {data.get('project_name', 'N/A')}")
        print(f"   Client: {data.get('client_name', 'N/A')}")
        print(f"   Total Slides: {data.get('total_slides', 0)}")
        return True
    
    return False


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python verify_mapping.py <slide_structure.json>")
        sys.exit(1)
    
    json_file = sys.argv[1]
    success = verify_structure(json_file)
    sys.exit(0 if success else 1)

