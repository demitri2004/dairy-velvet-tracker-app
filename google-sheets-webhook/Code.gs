var SPREADSHEET_ID = '1ALFEuknVDGM9yvKK_FVY3NsGoR7LM2cyfgkumTXiCYQ';

var TRACKER_HEADERS = {
  Time: [
    'submitted_at',
    'entry_date',
    'time_type',
    'time_type_other',
    'duration_minutes',
    'note',
    'source_app'
  ],
  Sales: [
    'submitted_at',
    'event_date',
    'event_name',
    'event_name_other',
    'cash_sales',
    'card_sales',
    'venmo_sales',
    'total_sales',
    'note',
    'source_app'
  ],
  Batch: [
    'submitted_at',
    'dv_batch_number',
    'manufactured_date',
    'cheese',
    'butter',
    'sugar',
    'vanilla',
    'cocoa_powder',
    'coating_compound_chocolate',
    'coconut_oil',
    'milk',
    'lecithin',
    'salt',
    'other',
    'note',
    'source_app'
  ],
  Miles: [
    'submitted_at',
    'trip_date',
    'trip_type',
    'purpose_notes',
    'from_location',
    'to_location',
    'odometer_start',
    'odometer_end',
    'miles_driven',
    'reimbursable',
    'source_app'
  ]
};

function doGet(e) {
  try {
    var mode = e && e.parameter ? e.parameter.mode : '';

    if (mode === 'latestBatchMeta') {
      return createResponse_({
        ok: true,
        latestBatchNumber: getLatestBatchNumber_()
      }, e);
    }

    return createResponse_({ ok: false, error: 'Unsupported mode.' }, e);
  } catch (error) {
    return createResponse_(
      {
        ok: false,
        error: error && error.message ? error.message : 'Unknown error'
      },
      e
    );
  }
}

function doPost(e) {
  try {
    var payload = parsePayload_(e);
    validatePayload_(payload);

    var configuredSecret = PropertiesService.getScriptProperties().getProperty('TRACKER_SHARED_SECRET');
    if (configuredSecret && payload.sharedSecret !== configuredSecret) {
      throw new Error('Invalid shared secret.');
    }

    var sheet = getOrCreateSheet_(payload.sheetName);
    ensureHeaders_(sheet, TRACKER_HEADERS[payload.sheetName]);

    var headers = TRACKER_HEADERS[payload.sheetName];
    var row = headers.map(function(header) {
      var value = payload.data[header];
      return value === null || typeof value === 'undefined' ? '' : value;
    });

    writeRow_(sheet, payload.sheetName, row);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, sheetName: payload.sheetName }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        ok: false,
        error: error && error.message ? error.message : 'Unknown error'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function parsePayload_(e) {
  if (e && e.parameter && e.parameter.payload) {
    return JSON.parse(e.parameter.payload);
  }

  if (e && e.postData && e.postData.contents) {
    return JSON.parse(e.postData.contents);
  }

  throw new Error('Missing payload.');
}

function validatePayload_(payload) {
  if (!payload || !payload.sheetName || !payload.data) {
    throw new Error('Payload is incomplete.');
  }

  if (!TRACKER_HEADERS[payload.sheetName]) {
    throw new Error('Unsupported sheet name: ' + payload.sheetName);
  }
}

function getOrCreateSheet_(sheetName) {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  return sheet;
}

function ensureHeaders_(sheet, headers) {
  if (sheet.getLastRow() > 0) {
    return;
  }

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
}

function writeRow_(sheet, sheetName, row) {
  var nextRow = sheet.getLastRow() + 1;
  var targetRange = sheet.getRange(nextRow, 1, 1, row.length);

  if (sheetName === 'Batch') {
    sheet.getRange(nextRow, 2).setNumberFormat('@');
    row[1] = row[1] === '' ? '' : String(row[1]);
  }

  targetRange.setValues([row]);
}

function getLatestBatchNumber_() {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = spreadsheet.getSheetByName('Batch');

  if (!sheet || sheet.getLastRow() < 2) {
    return null;
  }

  var lastValue = sheet.getRange(sheet.getLastRow(), 2).getDisplayValue();
  return lastValue || null;
}

function createResponse_(payload, e) {
  var callback = e && e.parameter ? e.parameter.callback : '';
  var body = JSON.stringify(payload);

  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + body + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(body)
    .setMimeType(ContentService.MimeType.JSON);
}
