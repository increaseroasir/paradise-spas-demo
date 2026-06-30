# Paradise Spas — Dashboard Setup

## Overview

This folder contains all automation files for the Paradise Spas performance dashboard.

| File | Purpose |
|------|---------|
| `ghl-lead-sync/Code.gs` | Apps Script: syncs GHL form submissions to Google Sheets hourly |
| `ghl-lead-sync/appsscript.json` | Apps Script manifest (OAuth scopes, timezone) |

## Google Sheet

**Name:** Paradise Spas — Dashboard Feed  
**ID:** `1Ip9VwWOj1FSoARH4V8he4p_EUWUXJCP3R6bvLx8-hTE`

### Tabs

| Tab | Columns | Purpose |
|-----|---------|---------|
| `daily_summary` | date, form_leads, gbp_call_clicks, click_call, pricing_click, generate_lead, synced_at | Daily aggregated KPIs |
| `lead_log` | contact_id, created_at, date, first_name, last_name, email, phone, source, tags | Raw GHL form submissions |
| `looker_kpi` | metric_label, metric_key, last_7_days, last_30_days | Flat KPI table for Looker scorecards |

## Apps Script Setup

1. Open the Google Sheet → **Extensions → Apps Script**
2. Paste the contents of `ghl-lead-sync/Code.gs`
3. **Project Settings → Script properties** → add:
   - `GHL_API_KEY` = your GHL Private Integration Token (pit-...)
   - `GHL_LOCATION_ID` = `3uSZwndvL6yEo5syDV5m`
   - `GHL_FORM_ID` = `iz3wpzwCI9GQhR3wlwbV`
4. Run `syncGhlLeadsToSheet` once → approve permissions
5. Menu **Paradise Spas Sync → Install hourly trigger**

## GHL Reference

| Item | Value |
|------|-------|
| Location ID | `3uSZwndvL6yEo5syDV5m` |
| Form ID | `iz3wpzwCI9GQhR3wlwbV` |
| Form name | WEBSITE FORM |

## Looker Studio

**Report:** Paradise Spas — Performance Dashboard  
**Data sources:**
1. Google Analytics → GA4 `G-E5WGSEGZYP` → `Paradise Spas — GA4`
2. Google Sheets → `looker_kpi` tab → `Paradise Spas — KPI`
3. Google Sheets → `daily_summary` tab → `Paradise Spas — GHL+GBP`
