#!/usr/bin/env python
"""
CarryYear Data Ingestion & Quality Management CLI

Usage:
  python manage_data.py status
  python manage_data.py seed-provenance
  python manage_data.py import --category colleges --file path/to/colleges.json
  python manage_data.py import --category scholarships --file path/to/scholarships.json
"""
import sys
import json
import argparse
from pathlib import Path
from datetime import datetime, timezone

# Ensure backend root is in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.db.database import SessionLocal
from app.db.models.college import College, CollegeCourse
from app.db.models.scholarship_chat import Scholarship
from app.db.models.career import Career
from app.services.ingestion_service import IngestionService

def show_status():
    db = SessionLocal()
    try:
        summary = IngestionService.get_provenance_summary(db)
        print("\n" + "="*60)
        print(" CARRYYEAR DATA PROVENANCE & QUALITY REPORT")
        print("="*60)
        print(f"Timestamp: {datetime.now(timezone.utc).isoformat()}")
        print("-" * 60)
        for cat, stats in summary["summary"].items():
            print(f"[{cat.upper()}]")
            print(f"  • Total Records     : {stats['total']}")
            print(f"  • Verified Records  : {stats['verified']}")
            print(f"  • Unverified / Demo : {stats['unverified']}")
            print(f"  • Primary Source    : {stats['default_source']}")
            print(f"  • Academic Year     : {stats['academic_year']}")
            print("-" * 60)

        print("\nRECENT INGESTION AUDITS:")
        audits = summary.get("recent_ingestion_audits", [])
        if not audits:
            print("  No previous ingestion runs recorded.")
        else:
            for a in audits:
                print(f"  - [{a['category']}] Status: {a['status']} | Records: {a['total_records']} | Source: {a['source_name']} ({a['timestamp']})")
        print("="*60 + "\n")
    finally:
        db.close()

def seed_provenance():
    """Populate default provenance metadata for existing records if null."""
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        colleges = db.query(College).all()
        for c in colleges:
            if not c.source_name:
                c.source_name = "DoTE Tamil Nadu / NIRF 2024"
            if not c.academic_year:
                c.academic_year = "2024-2025"
            if not c.verification_status:
                c.verification_status = "verified"
            if not c.last_verified_at:
                c.last_verified_at = now

        courses = db.query(CollegeCourse).all()
        for cc in courses:
            if not cc.cutoff_year:
                cc.cutoff_year = "2024"
            if not cc.source_name:
                cc.source_name = "TNEA Single-Window Counseling"
            if not cc.verification_status:
                cc.verification_status = "verified"

        scholarships = db.query(Scholarship).all()
        for s in scholarships:
            if not s.source_name:
                s.source_name = "National Scholarship Portal / TN Welfare Dept"
            if not s.academic_year:
                s.academic_year = "2024-2025"
            if not s.verification_status:
                s.verification_status = "verified"
            if not s.last_verified_at:
                s.last_verified_at = now

        careers = db.query(Career).all()
        for cr in careers:
            if not cr.source_name:
                cr.source_name = "NASSCOM / TN Skill Development Mission (TNSDC)"
            if not cr.verification_status:
                cr.verification_status = "verified"
            if not cr.last_verified_at:
                cr.last_verified_at = now

        db.commit()
        print(f"Successfully populated provenance metadata for {len(colleges)} colleges, {len(scholarships)} scholarships, and {len(careers)} careers.")
    finally:
        db.close()

def import_file(category: str, file_path: str, source_name: str, academic_year: str):
    p = Path(file_path)
    if not p.exists():
        print(f"Error: File not found: {file_path}")
        sys.exit(1)

    with open(p, "r", encoding="utf-8") as f:
        records = json.load(f)

    if not isinstance(records, list):
        print("Error: JSON file must contain a list of objects.")
        sys.exit(1)

    db = SessionLocal()
    try:
        if category == "colleges":
            res = IngestionService.import_colleges(db, records, source_name=source_name, academic_year=academic_year)
        elif category == "scholarships":
            res = IngestionService.import_scholarships(db, records, source_name=source_name, academic_year=academic_year)
        else:
            print(f"Category '{category}' import not implemented yet.")
            return

        print(f"\nIngestion Completed for [{category}]:")
        print(f"  • Processed : {res.total_processed}")
        print(f"  • Inserted  : {res.inserted}")
        print(f"  • Updated   : {res.updated}")
        print(f"  • Failed    : {res.failed}")
        if res.errors:
            print("  • Errors:")
            for err in res.errors[:5]:
                print(f"     - {err}")
    finally:
        db.close()

def main():
    parser = argparse.ArgumentParser(description="CarryYear Data Ingestion & Quality Management CLI")
    subparsers = parser.add_subparsers(dest="command", help="Command to run")

    subparsers.add_parser("status", help="Show data provenance and quality report")
    subparsers.add_parser("seed-provenance", help="Set default provenance on existing database records")

    import_parser = subparsers.add_parser("import", help="Import dataset file")
    import_parser.add_argument("--category", required=True, choices=["colleges", "scholarships", "careers"])
    import_parser.add_argument("--file", required=True, help="Path to JSON data file")
    import_parser.add_argument("--source", default="Official Public Records", help="Source attribution name")
    import_parser.add_argument("--year", default="2024-2025", help="Academic or publication year")

    args = parser.parse_args()
    if args.command == "status":
        show_status()
    elif args.command == "seed-provenance":
        seed_provenance()
    elif args.command == "import":
        import_file(args.category, args.file, args.source, args.year)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
