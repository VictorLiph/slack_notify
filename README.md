# Slack Scale Notifier
Data-Driven Shift Automation & Internal Communication

## Project Overview
This project addresses a critical operational challenge: shift adherence. In fast-paced environments, agents often miss their scheduled breaks due to deep task immersion.

I developed an automated pipeline that monitors employee schedules in real-time and triggers personalized Slack notifications exactly 5 minutes before each break, ensuring operational quality and team well-being.


### The Data Pipeline
The architecture follows a modern data lifecycle:

1. Extraction & Transformation (SQL): A query extracts raw schedule data from the database, performing data cleaning and standardizing time zones to ensure consistency.
2. Storage (Google Sheets): The transformed data is loaded into a centralized spreadsheet, serving as a lightweight UI for leadership oversight.
3. Logic & Processing (Google Apps Script): Implemented a custom script to parse schedule data using getDisplayValues().
4. Activation (Slack API): Sending asynchronous messages via chat.postMessage to the user ID after email validation.


### Tech Stack
* SQL: Data extraction and pre-processing.
* JavaScript / Google Apps Script: Automation logic and API integration.
* Slack API: Direct communication and alerting.

### Visuals

This is the project's "Control Panel." The Status column (Column E) is updated in real-time by the script. It provides instant visual feedback: green for successful notifications and red for any API errors, allowing for quick operational audits

![alt text](/images/sheets.png)



The final output delivered to the employee. The message is personalized and triggered exactly 5 minutes before the event.

![alt text](/images/slack.png)

#### 🔮 Future Roadmap
* Migrate logic to **Python** for better scalability.


