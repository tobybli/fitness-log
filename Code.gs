/**
 * Strength Training Log: data store for the app on GitHub Pages.
 * The app sends each set, tick and logged time here, and they're added as rows on the "Log" tab.
 * Your progress (ticks, sets, weights you've entered) is kept on the "State" tab.
 *
 * Opening this web app's link shows a one-off connection code to paste into the app.
 * A private key is created the first time it runs, so only your app can read or write your sheet.
 */

const LOG_SHEET = 'Log';
const STATE_SHEET = 'State';
const LOG_HEADER = ['Timestamp', 'Week', 'Day', 'Exercise', 'Action', 'Sets done', 'Target sets', 'Reps', 'Weight'];
const STATE_HEADER = ['Program', 'Saved progress (used by the app, do not edit)', 'Updated'];

function appKey_() {
  const props = PropertiesService.getScriptProperties();
  let key = props.getProperty('APP_KEY');
  if (!key) {
    key = Utilities.getUuid() + Utilities.getUuid().slice(0, 8);
    props.setProperty('APP_KEY', key);
  }
  return key;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action === 'state') {
    if (p.key !== appKey_()) return json_({ ok: false, error: 'wrong key' });
    return json_({ ok: true, result: getState(p.program) });
  }
  // No action: show the connection code to paste into the app.
  const code = Utilities.base64Encode(JSON.stringify({ u: ScriptApp.getService().getUrl(), k: appKey_() }), Utilities.Charset.UTF_8);
  const html =
    '<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<style>body{font-family:system-ui,sans-serif;padding:20px;max-width:560px;margin:auto;color:#17202b}' +
    'textarea{width:100%;height:120px;font-size:13px;padding:8px;box-sizing:border-box}' +
    'button{font-size:16px;padding:10px 16px;margin-top:10px;background:#1f5fbf;color:#fff;border:0;border-radius:6px}</style></head><body>' +
    '<h2>Connect your Training Log app</h2>' +
    '<p>Copy this code, open the Training Log app, open <b>Google Sheet</b> and paste it in. You only need to do this once per phone.</p>' +
    '<textarea id="c" readonly>' + code + '</textarea>' +
    '<button onclick="var t=document.getElementById(\'c\');t.select();try{navigator.clipboard.writeText(t.value).then(function(){b.textContent=\'Copied\'})}catch(e){document.execCommand(\'copy\');b.textContent=\'Copied\'}" id="b">Copy code</button>' +
    '<script>var b=document.getElementById("b");</script>' +
    '<p style="color:#5b6878;font-size:14px">Keep this code private. Anyone with it could add rows to your sheet.</p>' +
    '</body></html>';
  return HtmlService.createHtmlOutput(html).setTitle('Connect Training Log');
}

function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'bad request' }); }
  if (!body || body.key !== appKey_()) return json_({ ok: false, error: 'wrong key' });
  const args = body.args || [];
  if (body.action === 'logRows') return json_({ ok: true, result: logRows(args[0]) });
  if (body.action === 'saveState') return json_({ ok: true, result: saveState(args[0], args[1]) });
  if (body.action === 'getState') return json_({ ok: true, result: getState(args[0]) });
  return json_({ ok: false, error: 'unknown action' });
}

function sheet_(name, header) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(header);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, header.length).setFontWeight('bold');
  }
  return sh;
}

/** rows of [isoTime, week, day, exercise, action, setsDone, targetSets, reps, weight] */
function logRows(rows) {
  if (!rows || !rows.length) return 0;
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet_(LOG_SHEET, LOG_HEADER);
    const values = rows.map(function (r) {
      return [new Date(r[0]), r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8]];
    });
    sh.getRange(sh.getLastRow() + 1, 1, values.length, LOG_HEADER.length).setValues(values);
    sh.getRange(2, 1, sh.getLastRow() - 1, 1).setNumberFormat('ddd d mmm yyyy, HH:mm');
    return values.length;
  } finally {
    lock.releaseLock();
  }
}

function getState(programId) {
  const sh = sheet_(STATE_SHEET, STATE_HEADER);
  const values = sh.getDataRange().getValues();
  for (let r = 1; r < values.length; r++) {
    if (values[r][0] === programId) return String(values[r][1]);
  }
  return null;
}

function saveState(programId, json) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet_(STATE_SHEET, STATE_HEADER);
    const values = sh.getDataRange().getValues();
    for (let r = 1; r < values.length; r++) {
      if (values[r][0] === programId) {
        sh.getRange(r + 1, 2, 1, 2).setValues([[json, new Date()]]);
        return true;
      }
    }
    sh.appendRow([programId, json, new Date()]);
    return true;
  } finally {
    lock.releaseLock();
  }
}
