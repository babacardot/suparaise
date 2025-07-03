# Data Seeding & Management System

This directory contains tools and templates for managing large-scale data imports for targets (VCs), angels, and accelerators.

## Quick Start

1. **Initial Bulk Seeding (500 VCs, 100 angels, 100 accelerators)**

   ```bash
   bun run scripts/seed-data/bulk-seed.ts
   ```

2. **CSV Import (ongoing data management)**

   ```bash
   bun run scripts/seed-data/csv-import.ts --table targets --file data/new-vcs.csv
   bun run scripts/seed-data/csv-import.ts --table angels --file data/new-angels.csv
   bun run scripts/seed-data/csv-import.ts --table accelerators --file data/new-accelerators.csv
   ```

3. **Validate Data Before Import**
   ```bash
   bun run scripts/seed-data/validate-csv.ts --table targets --file data/new-vcs.csv
   ```

## File Structure

```
scripts/seed-data/
├── README.md                 # This guide
├── bulk-seed.ts             # Initial bulk seeding
├── csv-import.ts            # CSV import utility
├── validate-csv.ts          # Data validation
├── generate-templates.ts    # Generate CSV templates
├── templates/               # CSV templates
│   ├── targets-template.csv
│   ├── angels-template.csv
│   └── accelerators-template.csv
├── data/                    # Your CSV data files
│   ├── targets-bulk.csv
│   ├── angels-bulk.csv
│   └── accelerators-bulk.csv
└── utils/                   # Utility functions
    ├── db-utils.ts
    ├── csv-utils.ts
    └── validation.ts
```

## CSV Column Mapping

### Targets (VCs)

- `name*` - VC firm name (required, unique)
- `website` - Website URL
- `application_url*` - Application form URL (required)
- `application_email` - Contact email
- `submission_type` - form|email|other (default: form)
- `stage_focus` - Comma-separated: Pre-seed,Seed,Series A,etc.
- `industry_focus` - Comma-separated industries
- `region_focus` - Comma-separated regions
- `form_complexity` - simple|standard|comprehensive
- `question_count_range` - 1-5|6-10|11-20|21+
- `required_documents` - Comma-separated: pitch_deck,video,etc.
- `notes` - Additional notes

### Angels

- `first_name*`, `last_name*` - Investor name (required)
- `email` - Contact email
- `linkedin`, `twitter` - Social profiles
- `location` - Geographic location
- `bio` - Short biography
- `check_size` - 1K-10K|10K-25K|25K-50K|etc.
- `stage_focus`, `industry_focus`, `region_focus` - Same as targets
- `investment_approach` - hands-on|passive|advisory|network-focused
- `previous_exits` - Comma-separated company names
- `domain_expertise` - Comma-separated expertise areas
- `response_time` - 1-3 days|1 week|2 weeks|etc.
- `notable_investments` - Comma-separated portfolio companies

### Accelerators

- `name*` - Accelerator name (required, unique)
- `website` - Website URL
- `application_url` - Application form URL
- `program_type` - in-person|remote|hybrid
- `program_duration` - 3 months|6 months|12 months|etc.
- `location` - Program location
- `is_remote_friendly` - true|false
- `batch_size` - 1-10|11-20|21-50|etc.
- `equity_taken` - 0%|1-3%|4-6%|etc.
- `funding_provided` - 0-25K|25K-50K|etc.
- `acceptance_rate` - <1%|1-5%|6-10%|etc.
- `next_application_deadline` - YYYY-MM-DD format

## Workflow

1. **Excel → CSV Conversion**: Export your Excel data as CSV
2. **Template Matching**: Use our templates to ensure column alignment
3. **Validation**: Run validation script to catch errors early
4. **Import**: Use the import script to load data
5. **Verification**: Check imported data in your database

## Advanced Features

- **Duplicate Detection**: Automatically detects and handles duplicates
- **Data Enrichment**: Validates URLs, normalizes data formats
- **Batch Processing**: Handles large files (10K+ rows) efficiently
- **Error Reporting**: Detailed logs of any import issues
- **Rollback Support**: Can undo imports if needed

## Production Considerations

- All imports are logged for audit trails
- Large datasets are processed in batches to avoid timeouts
- Foreign key constraints are handled properly
- Data is validated against database enums before import
