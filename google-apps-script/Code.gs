/*
 * Google Apps Script backend for the Employee Transport Management System.
 *
 * Deploy as a Web app:
 *   Execute as: Me
 *   Who has access: Anyone
 *
 * The database is stored as one JSON file in the configured Drive folder.
 * Set SCRIPT properties:
 *   DRIVE_FOLDER_ID - optional folder ID; defaults to the root of Drive
 *   APP_KEY         - optional shared application key
 */

var DATABASE_FILE_NAME = 'imo-transport-database.json';

function doGet(e) {
  return handleRequest_(e && e.parameter ? e.parameter : {});
}

function doPost(e) {
  var body;
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return json_({ ok: false, error: 'Request body must be valid JSON.' });
  }
  return handleRequest_(body);
}

function handleRequest_(request) {
  try {
    checkKey_(request.key || '');
    if (request.action === 'load') return json_({ ok: true, data: readDatabase_() });
    if (request.action === 'save') {
      validateDatabase_(request.data);
      writeDatabase_(request.data);
      return json_({ ok: true, savedAt: new Date().toISOString() });
    }
    return json_({ ok: false, error: 'Unsupported action.' });
  } catch (err) {
    return json_({ ok: false, error: err.message || String(err) });
  }
}

function checkKey_(key) {
  var expected = PropertiesService.getScriptProperties().getProperty('APP_KEY') || '';
  if (expected && key !== expected) throw new Error('Invalid application key.');
}

function getFolder_() {
  var id = PropertiesService.getScriptProperties().getProperty('DRIVE_FOLDER_ID');
  return id ? DriveApp.getFolderById(id) : DriveApp.getRootFolder();
}

function findDatabaseFile_() {
  var files = getFolder_().getFilesByName(DATABASE_FILE_NAME);
  return files.hasNext() ? files.next() : null;
}

function readDatabase_() {
  var file = findDatabaseFile_();
  return file ? JSON.parse(file.getBlob().getDataAsString()) : null;
}

function writeDatabase_(data) {
  var folder = getFolder_();
  var file = findDatabaseFile_();
  var content = JSON.stringify(data);
  if (file) {
    file.setContent(content);
  } else {
    folder.createFile(DATABASE_FILE_NAME, content, MimeType.PLAIN_TEXT);
  }
}

function validateDatabase_(data) {
  if (!data || !Array.isArray(data.users) || !Array.isArray(data.vehicles) ||
      !Array.isArray(data.employees) || !Array.isArray(data.departments)) {
    throw new Error('The submitted data is not a valid transport database.');
  }
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
