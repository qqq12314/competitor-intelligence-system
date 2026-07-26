from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path

from app.db.session import SessionLocal
from app.services.team_data_import import (
    ImportReport,
    REPO_ROOT,
    apply_to_database,
    archive_raw,
    portable_path,
    read_source_csvs,
    transform,
    write_outputs,
    write_report,
)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Safely validate, normalize, archive and merge teammate CSV data into the project.",
    )
    parser.add_argument("source_path", type=Path, help="Path to data.zip or a directory containing the six raw CSV files")
    parser.add_argument("--batch-id", default=date.today().isoformat(), help="Import batch date/id, default: today")
    parser.add_argument("--write-files", action="store_true", help="Extract raw CSV and write normalized processed CSV")
    parser.add_argument("--apply-db", action="store_true", help="Merge normalized rows into the configured database")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    source_path = args.source_path.expanduser().resolve()
    batch_slug = args.batch_id.replace("-", "")
    raw_dir = REPO_ROOT / "data" / "raw" / f"team_data_{batch_slug}"
    processed_dir = REPO_ROOT / "data" / "processed" / f"team_data_{batch_slug}"
    report = ImportReport(
        batch_id=args.batch_id,
        source_path=source_path.name,
        dry_run=not args.apply_db,
    )

    try:
        source_rows = read_source_csvs(source_path, report)
        output = transform(source_rows, report)
        if args.write_files or args.apply_db:
            archive_raw(source_path, raw_dir)
            report.raw_directory = portable_path(raw_dir)
            write_outputs(output, processed_dir, report)
        if args.apply_db:
            with SessionLocal() as session:
                apply_to_database(output, session, report)
        report_path = write_report(report, processed_dir if (args.write_files or args.apply_db) else REPO_ROOT / ".codex_work" / "team_data_preview")
    except Exception as exc:
        report.errors.append(str(exc))
        print(json.dumps(report.to_dict(), ensure_ascii=False, indent=2))
        return 1

    print(json.dumps(report.to_dict(), ensure_ascii=False, indent=2))
    print(f"Report: {report_path}")
    if not args.apply_db:
        print("DRY RUN: database was not changed. Add --apply-db to merge data after reviewing the report.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
