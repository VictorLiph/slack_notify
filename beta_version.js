function sendBreakTimeAlert() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const SLACK_URL = "XXX";
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]; 
  const data = sheet.getDataRange().getValues();
  const now = new Date();

  // Skipping header row with (1)
  data.slice(1).forEach((row, index) => {
    // Column Mapping: A=id, C=startTime, D=breakType, F=name, G=status
    const [id, , startTime, breakType, , name, status] = row; 
    
    if (!startTime || !name) return;

    const breakDate = new Date(startTime);
    const diffInMinutes = (breakDate - now) / (1000 * 60);

    // Logic: If break is within 0-5 mins and alert hasn't been SENT yet
    if (diffInMinutes > 0 && diffInMinutes <= 5 && status !== "SENT") {
      postToSlack(SLACK_URL, name, breakType);
      
      // Update Column G (index 7) to avoid duplicate alerts
      sheet.getRange(index + 2, 7).setValue("SENT"); 
      Logger.log(`Alert sent to ${name} for ${breakType}`);
    }
  });
}

function postToSlack(url, employeeName, type) {
  const payload = { 
    "text": `*Break Reminder* \nHi ${employeeName}, your *${type}* starts in 5 minutes. Don't forget to clock in!` 
  };
  
  const options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload)
  };
  
  UrlFetchApp.fetch(url, options);
}


function resetDailyStatus() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const lastRow = sheet.getLastRow();
  
  if (lastRow > 1) {
    sheet.getRange(2, 7, lastRow - 1).clearContent();
    Logger.log("Daily status reset completed.");
  }
}