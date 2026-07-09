type WelcomeParams = {
  studentName: string;
  department: string;
  level: number;
};

type CourseRegistrationParams = {
  studentName: string;
  courseCode: string;
  courseName: string;
  action: "registered" | "unregistered";
};

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

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function baseLayout(title: string, body: string): string {
  const safeTitle = esc(title);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;border:1px solid #e2e8f0;overflow:hidden;max-width:560px;width:100%;">
          <tr>
            <td style="background:#0055a4;padding:20px 28px;">
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

export function welcomeEmailHtml(params: WelcomeParams): string {
  const name = esc(params.studentName);
  const dept = esc(params.department);
  const level = params.level; // number — no escaping needed
  const body = `
    <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;font-weight:700;">Welcome to LAT</h2>
    <p style="margin:0 0 20px;color:#64748b;font-size:14px;">Your student account has been created successfully.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:6px;border:1px solid #e2e8f0;margin-bottom:24px;">
      <tr><td style="padding:16px 20px;">
        <p style="margin:0 0 12px;color:#0f172a;font-size:16px;font-weight:600;">${name}</p>
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:3px 12px 3px 0;color:#64748b;font-size:13px;white-space:nowrap;">🏛️ Department</td>
            <td style="padding:3px 0;color:#0f172a;font-size:13px;font-weight:500;">${dept}</td>
          </tr>
          <tr>
            <td style="padding:3px 12px 3px 0;color:#64748b;font-size:13px;white-space:nowrap;">📚 Level</td>
            <td style="padding:3px 0;color:#0f172a;font-size:13px;font-weight:500;">${level} Level</td>
          </tr>
        </table>
      </td></tr>
    </table>
    <p style="margin:0 0 24px;color:#64748b;font-size:13px;">
      You can now view your timetable, register elective and carryover courses, and receive class reminders by email.
    </p>`;
  return baseLayout("Welcome to LASU Academic Timetable", body);
}

export function courseRegistrationEmailHtml(params: CourseRegistrationParams): string {
  const name = esc(params.studentName);
  const code = esc(params.courseCode);
  const courseName = esc(params.courseName);
  const { action } = params;
  const isRegister = action === "registered";
  const icon = isRegister ? "✅" : "🗑️";
  const title = isRegister ? "Course Registered" : "Course Removed";
  const msg = isRegister
    ? "You have successfully registered for this course. It will now appear in your personal timetable."
    : "You have been removed from this course. It will no longer appear in your personal timetable.";
  const bgColor = isRegister ? "#f0fdf4" : "#fef2f2";
  const borderColor = isRegister ? "#16a34a33" : "#dc262633";
  const body = `
    <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;font-weight:700;">${icon} ${title}</h2>
    <p style="margin:0 0 20px;color:#64748b;font-size:14px;">Hi ${name},</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:${bgColor};border-radius:6px;border:1px solid ${borderColor};margin-bottom:24px;">
      <tr><td style="padding:16px 20px;">
        <p style="margin:0 0 4px;color:#0f172a;font-size:15px;font-weight:600;">${code}</p>
        <p style="margin:0;color:#64748b;font-size:13px;">${courseName}</p>
      </td></tr>
    </table>
    <p style="margin:0 0 24px;color:#64748b;font-size:13px;">${msg}</p>`;
  return baseLayout(`${title}: ${code}`, body);
}

export function reminderEmailHtml(params: ReminderParams): string {
  const name = esc(params.studentName);
  const code = esc(params.courseCode);
  const courseName = esc(params.courseName);
  const venue = esc(params.venueName);
  const lecturer = esc(params.lecturerName);
  const startTime = esc(params.startTime);
  const day = esc(params.day);
  const body = `
    <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;font-weight:700;">Class Reminder</h2>
    <p style="margin:0 0 20px;color:#64748b;font-size:14px;">You have an upcoming class in <strong>30 minutes</strong>.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:6px;border:1px solid #e2e8f0;margin-bottom:24px;">
      <tr><td style="padding:16px 20px;">
        <p style="margin:0 0 12px;color:#0f172a;font-size:16px;font-weight:600;">${code} &mdash; ${courseName}</p>
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
            <td style="padding:3px 0;color:#0f172a;font-size:13px;font-weight:500;">${venue}</td>
          </tr>
          <tr>
            <td style="padding:3px 12px 3px 0;color:#64748b;font-size:13px;white-space:nowrap;">👤 Lecturer</td>
            <td style="padding:3px 0;color:#0f172a;font-size:13px;font-weight:500;">${lecturer}</td>
          </tr>
        </table>
      </td></tr>
    </table>
    <p style="margin:0 0 24px;color:#64748b;font-size:13px;">Hi ${name}, please ensure you arrive on time.</p>`;
  return baseLayout(`Class Reminder: ${code}`, body);
}

export function changeEmailHtml(params: ChangeParams): string {
  const name = esc(params.studentName);
  const code = esc(params.courseCode);
  const courseName = esc(params.courseName);
  const details = esc(params.details);
  const { changeType } = params;
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
    <p style="margin:0 0 20px;color:#64748b;font-size:14px;">Hi ${name}, there has been a change to one of your classes.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border-radius:6px;border:1px solid ${alertColor}33;margin-bottom:24px;">
      <tr><td style="padding:16px 20px;">
        <p style="margin:0 0 8px;color:#0f172a;font-size:15px;font-weight:600;">${code} &mdash; ${courseName}</p>
        <p style="margin:0;color:#64748b;font-size:13px;">${details}</p>
      </td></tr>
    </table>
    <p style="margin:0 0 24px;color:#64748b;font-size:13px;">
      Please check the timetable system for the most up-to-date information.
    </p>`;
  return baseLayout(`${title}: ${code}`, body);
}
