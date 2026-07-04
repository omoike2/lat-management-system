type ReminderParams = {
  studentName: string;
  courseCode: string;
  courseName: string;
  venueName: string;
  lecturerName: string;
  startTime: string;
  day: string;
};

type ChangeParams = {
  studentName: string;
  courseCode: string;
  courseName: string;
  changeType: "venue" | "time" | "cancellation";
  details: string;
};

function baseLayout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;border:1px solid #e2e8f0;overflow:hidden;max-width:560px;width:100%;">
          <tr>
            <td style="background:#006633;padding:20px 28px;">
              <span style="color:#ffffff;font-size:16px;font-weight:700;letter-spacing:0.5px;">LASU Academic Timetable</span>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 28px 0;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px;border-top:1px solid #f1f5f9;margin-top:28px;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                Lagos State University &mdash; Academic Timetable System.<br/>
                This is an automated message. Do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function reminderEmailHtml(params: ReminderParams): string {
  const { studentName, courseCode, courseName, venueName, lecturerName, startTime, day } = params;
  const body = `
    <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;font-weight:700;">Class Reminder</h2>
    <p style="margin:0 0 20px;color:#64748b;font-size:14px;">You have an upcoming class in <strong>30 minutes</strong>.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:6px;border:1px solid #e2e8f0;margin-bottom:24px;">
      <tr><td style="padding:16px 20px;">
        <p style="margin:0 0 12px;color:#0f172a;font-size:16px;font-weight:600;">${courseCode} &mdash; ${courseName}</p>
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:3px 12px 3px 0;color:#64748b;font-size:13px;white-space:nowrap;">📅 Day</td>
            <td style="padding:3px 0;color:#0f172a;font-size:13px;font-weight:500;">${day}</td>
          </tr>
          <tr>
            <td style="padding:3px 12px 3px 0;color:#64748b;font-size:13px;white-space:nowrap;">🕐 Time</td>
            <td style="padding:3px 0;color:#0f172a;font-size:13px;font-weight:500;">${startTime}</td>
          </tr>
          <tr>
            <td style="padding:3px 12px 3px 0;color:#64748b;font-size:13px;white-space:nowrap;">📍 Venue</td>
            <td style="padding:3px 0;color:#0f172a;font-size:13px;font-weight:500;">${venueName}</td>
          </tr>
          <tr>
            <td style="padding:3px 12px 3px 0;color:#64748b;font-size:13px;white-space:nowrap;">👤 Lecturer</td>
            <td style="padding:3px 0;color:#0f172a;font-size:13px;font-weight:500;">${lecturerName}</td>
          </tr>
        </table>
      </td></tr>
    </table>
    <p style="margin:0 0 24px;color:#64748b;font-size:13px;">Hi ${studentName}, please ensure you arrive on time.</p>`;
  return baseLayout(`Class Reminder: ${courseCode}`, body);
}

export function changeEmailHtml(params: ChangeParams): string {
  const { studentName, courseCode, courseName, changeType, details } = params;
  const titles: Record<typeof changeType, string> = {
    venue: "Venue Change",
    time: "Schedule Change",
    cancellation: "Class Cancelled",
  };
  const icons: Record<typeof changeType, string> = {
    venue: "📍",
    time: "🕐",
    cancellation: "❌",
  };
  const alertColor = changeType === "cancellation" ? "#dc2626" : "#d97706";
  const title = titles[changeType];
  const icon = icons[changeType];
  const body = `
    <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;font-weight:700;">${icon} ${title}</h2>
    <p style="margin:0 0 20px;color:#64748b;font-size:14px;">Hi ${studentName}, there has been a change to one of your classes.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border-radius:6px;border:1px solid ${alertColor}33;margin-bottom:24px;">
      <tr><td style="padding:16px 20px;">
        <p style="margin:0 0 8px;color:#0f172a;font-size:15px;font-weight:600;">${courseCode} &mdash; ${courseName}</p>
        <p style="margin:0;color:#64748b;font-size:13px;">${details}</p>
      </td></tr>
    </table>
    <p style="margin:0 0 24px;color:#64748b;font-size:13px;">
      Please check the timetable system for the most up-to-date information.
    </p>`;
  return baseLayout(`${title}: ${courseCode}`, body);
}
