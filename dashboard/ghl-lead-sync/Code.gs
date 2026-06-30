// ============================================================
// Paradise Spas — GHL Lead Sync
// Syncs GHL form submissions to Google Sheets
// Sheet: "Paradise Spas — Dashboard Feed"
// Tabs: lead_log, daily_summary
//
// Setup:
//   1. Extensions → Apps Script → paste this file
//   2. Project Settings → Script properties → add:
//      GHL_API_KEY = pit-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
//      GHL_LOCATION_ID = 3uSZwndvL6yEo5syDV5m
//      GHL_FORM_ID = iz3wpzwCI9GQhR3wlwbV
//   3. Run syncGhlLeadsToSheet once → approve permissions
//   4. Menu: Paradise Spas Sync → Install hourly trigger
// ============================================================

var GHL_BASE = 'https://services.leadconnectorhq.com';

// ── Entry point ──────────────────────────────────────────────
function syncGhlLeadsToSheet() {
  var props = PropertiesService.getScriptProperties();
  var apiKey = props.getProperty('GHL_API_KEY');
  var locationId = props.getProperty('GHL_LOCATION_ID') || '3uSZwndvL6yEo5syDV5m';
  var formId = props.getProperty('GHL_FORM_ID') || 'iz3wpzwCI9GQhR3wlwbV';

  if (!apiKey) {
    Logger.log('ERROR: GHL_API_KEY not set in Script Properties.');
    return;
  }

  var leads = fetchGhlFormSubmissions(apiKey, locationId, formId);
  if (!leads || leads.length === 0) {
    Logger.log('No leads returned from GHL.');
    return;
  }

  writeLeadLog(leads);
  updateDailySummary(leads);
  Logger.log('Sync complete. Leads processed: ' + leads.length);
}

// ── Fetch form submissions from GHL ─────────────────────────
function fetchGhlFormSubmissions(apiKey, locationId, formId) {
  var url = GHL_BASE + '/forms/submissions?locationId=' + locationId
    + '&formId=' + formId + '&limit=100&page=1';

  var options = {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Version': '2021-07-28',
      'Accept': 'application/json'
    },
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(url, options);
  var code = response.getResponseCode();

  if (code !== 200) {
    Logger.log('GHL API error: ' + code + ' — ' + response.getContentText().substring(0, 300));
    return [];
  }

  var data = JSON.parse(response.getContentText());
  return data.submissions || [];
}

// ── Write to lead_log tab ────────────────────────────────────
function writeLeadLog(leads) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('lead_log');
  if (!sheet) {
    sheet = ss.insertSheet('lead_log');
    sheet.appendRow(['contact_id','created_at','date','first_name','last_name','email','phone','source','tags']);
  }

  // Build set of existing contact IDs to avoid duplicates
  var existingData = sheet.getDataRange().getValues();
  var existingIds = {};
  for (var i = 1; i < existingData.length; i++) {
    existingIds[existingData[i][0]] = true;
  }

  var newRows = [];
  leads.forEach(function(sub) {
    var contactId = sub.contactId || sub.id || '';
    if (existingIds[contactId]) return; // skip duplicate

    var createdAt = sub.createdAt || '';
    var dateStr = createdAt ? createdAt.substring(0, 10) : '';
    var fields = sub.formData || {};
    var firstName = fields.first_name || fields.firstName || '';
    var lastName = fields.last_name || fields.lastName || '';
    var email = fields.email || '';
    var phone = fields.phone || fields.phone_number || '';
    var source = sub.source || 'website-form';
    var tags = (sub.tags || []).join(', ');

    newRows.push([contactId, createdAt, dateStr, firstName, lastName, email, phone, source, tags]);
  });

  if (newRows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, 9).setValues(newRows);
    Logger.log('Added ' + newRows.length + ' new leads to lead_log.');
  } else {
    Logger.log('No new leads to add to lead_log.');
  }
}

// ── Update daily_summary tab ─────────────────────────────────
function updateDailySummary(leads) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('daily_summary');
  if (!sheet) {
    sheet = ss.insertSheet('daily_summary');
    sheet.appendRow(['date','form_leads','gbp_call_clicks','click_call','pricing_click','generate_lead','synced_at']);
  }

  // Count leads per date
  var countsByDate = {};
  leads.forEach(function(sub) {
    var createdAt = sub.createdAt || '';
    var dateStr = createdAt ? createdAt.substring(0, 10) : 'unknown';
    countsByDate[dateStr] = (countsByDate[dateStr] || 0) + 1;
  });

  // Read existing rows to update in-place
  var data = sheet.getDataRange().getValues();
  var dateColIndex = 0;
  var formLeadsColIndex = 1;
  var syncedAtColIndex = 6;
  var existingRows = {};
  for (var i = 1; i < data.length; i++) {
    existingRows[data[i][dateColIndex]] = i + 1; // 1-indexed row number
  }

  var now = new Date().toISOString();
  Object.keys(countsByDate).forEach(function(dateStr) {
    var count = countsByDate[dateStr];
    if (existingRows[dateStr]) {
      // Update existing row
      var rowNum = existingRows[dateStr];
      sheet.getRange(rowNum, formLeadsColIndex + 1).setValue(count);
      sheet.getRange(rowNum, syncedAtColIndex + 1).setValue(now);
    } else {
      // Append new row
      sheet.appendRow([dateStr, count, '', '', '', '', now]);
    }
  });

  Logger.log('daily_summary updated.');
}

// ── Custom menu ──────────────────────────────────────────────
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Paradise Spas Sync')
    .addItem('Sync GHL leads now', 'syncGhlLeadsToSheet')
    .addItem('Install hourly trigger', 'installHourlyTrigger')
    .addItem('Remove all triggers', 'removeAllTriggers')
    .addToUi();
}

// ── Trigger management ───────────────────────────────────────
function installHourlyTrigger() {
  removeAllTriggers();
  ScriptApp.newTrigger('syncGhlLeadsToSheet')
    .timeBased()
    .everyHours(1)
    .create();
  SpreadsheetApp.getUi().alert('Hourly trigger installed. GHL leads will sync every hour.');
  Logger.log('Hourly trigger installed.');
}

function removeAllTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(t) { ScriptApp.deleteTrigger(t); });
  Logger.log('All triggers removed.');
}
