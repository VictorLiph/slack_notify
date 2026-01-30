const SLACK_TOKEN = "XXXX"; 

function monitorSchedule() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]; 
  const data = sheet.getDataRange().getDisplayValues(); 
  const now = new Date();
  
  // Format current time to HH:mm
  const currentTime = Utilities.formatDate(now, "GMT-3", "HH:mm");
  const timeParts = currentTime.split(":");
  const currentMinutes = (parseInt(timeParts[0]) * 60) + parseInt(timeParts[1]);

  console.log("⌚ Checking schedule at: " + currentTime);

  // Loop through data starting from the second row (index 1) to skip header
  for (let i = 1; i < data.length; i++) {
    const name     = data[i][0];
    const email    = data[i][1];
    const shiftTime = data[i][2]; 
    const breakType = data[i][3];
    const status    = data[i][4];

    if (!shiftTime || !email || !shiftTime.includes(":")) continue;

    try {
      const match = shiftTime.match(/(\d{1,2}):(\d{2})/);
      if (match) {
        const breakMinutes = (parseInt(match[1]) * 60) + parseInt(match[2]);
        const diff = breakMinutes - currentMinutes;

        // RULE: Trigger if 5 minutes remain AND not already notified today
        if (diff === 5 && status !== "✅ Sent") {
          console.log(`🎯 Triggering notification for ${name}...`);
          
          const success = sendSlackDM(email, name, breakType);
          
          if (success) {
            // Write status to Column E (5th column)
            sheet.getRange(i + 1, 5).setValue("✅ Sent at " + currentTime);
            sheet.getRange(i + 1, 5).setBackground("#d9ead3"); // Light green
          } else {
            sheet.getRange(i + 1, 5).setValue("❌ Slack Error");
            sheet.getRange(i + 1, 5).setBackground("#f4cccc"); // Light red
          }
        }
      }
    } catch(e) {
      console.log(`Error processing agent ${name}: ${e.message}`);
    }
  }
}

/**
 * Handles the Slack API calls to find the user and post the message.
 */
function sendSlackDM(email, name, breakType) {
  try {
    const cleanEmail = email.trim();
    const lookupUrl = "https://slack.com/api/users.lookupByEmail?email=" + encodeURIComponent(cleanEmail);
    
    const response = UrlFetchApp.fetch(lookupUrl, {
      "method": "get",
      "headers": {"Authorization": "Bearer " + SLACK_TOKEN},
      "muteHttpExceptions": true
    });
    
    const userData = JSON.parse(response.getContentText());

    if (userData.ok) {
      const userId = userData.user.id;
      const payload = {
        "channel": userId,
        "text": `🔔 *Hey ${name}!* Your *${breakType}* starts in 5 minutes.`
      };
      
      const postResponse = UrlFetchApp.fetch("https://slack.com/api/chat.postMessage", {
        "method": "post",
        "contentType": "application/json",
        "headers": {"Authorization": "Bearer " + SLACK_TOKEN},
        "payload": JSON.stringify(payload),
        "muteHttpExceptions": true
      });
      
      return JSON.parse(postResponse.getContentText()).ok;
    }
    return false;
  } catch (e) {
    console.log("Technical Error: " + e.toString());
    return false;
  }
}

/**
 * Resets the status column for a new day.
 */
function clearStatusColumn() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const lastRow = sheet.getLastRow();
  
  if (lastRow > 1) {
    const range = sheet.getRange(2, 5, lastRow - 1, 1);
    range.clearContent();
    range.setBackground(null);
  }
}