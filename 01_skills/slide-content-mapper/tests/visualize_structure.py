#!/usr/bin/env python3
"""
Visualize slide structure as text tree
"""

import json
import sys
from pathlib import Path


def visualize(json_file: str):
    """Print slide structure as tree"""
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"❌ File not found: {json_file}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON: {e}")
        sys.exit(1)
    
    print(f"📊 Slide Structure: {data.get('project_name', 'Unknown')}")
    print(f"   Client: {data.get('client_name', 'Unknown')}")
    print(f"   Total Slides: {data.get('total_slides', 0)}\n")
    
    slides = data.get("slides", [])
    if not slides:
        print("⚠️  No slides found")
        return
    
    for slide in slides:
        slide_num = slide.get("slide_number", "?")
        slide_type = slide.get("type", "unknown")
        slide_title = slide.get("title", "Untitled")
        
        print(f"  {slide_num:2d}. [{slide_type:20s}] {slide_title}")
        
        # Show content preview
        if "table" in slide:
            rows = slide["table"].get("rows", [])
            print(f"      └─ Table: {len(rows)} rows")
        elif "content" in slide:
            items = slide["content"]
            if isinstance(items, list):
                print(f"      └─ Bullet points: {len(items)} items")
            elif isinstance(items, str):
                print(f"      └─ Content: {len(items)} characters")
        elif "diagram" in slide:
            diagram = slide["diagram"]
            if diagram.get("code"):
                code_len = len(diagram.get("code", ""))
                print(f"      └─ Diagram: Mermaid code ({code_len} chars)")
            else:
                print(f"      └─ Diagram: No code")
        elif "left_column" in slide:
            left_items = len(slide["left_column"].get("content", []))
            right_items = len(slide["right_column"].get("content", []))
            print(f"      └─ Two columns: {left_items} left, {right_items} right items")
        elif "timeline" in slide:
            milestones = len(slide["timeline"].get("milestones", []))
            print(f"      └─ Timeline: {milestones} milestones")
    
    # Summary by type
    print("\n📈 Summary by Type:")
    type_counts = {}
    for slide in slides:
        slide_type = slide.get("type", "unknown")
        type_counts[slide_type] = type_counts.get(slide_type, 0) + 1
    
    for slide_type, count in sorted(type_counts.items()):
        print(f"   {slide_type:20s}: {count} slide(s)")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python visualize_structure.py <slide_structure.json>")
        sys.exit(1)
    
    visualize(sys.argv[1])

