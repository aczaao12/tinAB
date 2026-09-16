/**
 * Telegram Logger & Device Information Collector
 */

const BOT_TOKEN =
  import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '8733034826:AAHTqLibXPXn43n8TwpNxF280uPiZrsv7d8';
const CHAT_ID =
  import.meta.env.VITE_TELEGRAM_CHAT_ID || '-4943145852';

export interface DeviceInfo {
  deviceType: 'Mobile' | 'Tablet' | 'Desktop';
  os: string;
  browser: string;
  screen: string;
  userAgent: string;
  ip?: string;
  location?: string;
}

/**
 * Detect client device, operating system, browser, and screen size
 */
export function getDeviceInfo(): DeviceInfo {
  const ua = navigator.userAgent;
  let deviceType: 'Mobile' | 'Tablet' | 'Desktop' = 'Desktop';
  let os = 'Unknown OS';
  let browser = 'Unknown Browser';

  // Device detection
  if (/iPad|Tablet|(android(?!.*mobile))/i.test(ua)) {
    deviceType = 'Tablet';
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    deviceType = 'Mobile';
  }

  // OS detection
  if (/Win/i.test(ua)) os = 'Windows';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Linux/i.test(ua)) os = 'Linux';

  // Browser detection
  if (/FBAN|FBAV/i.test(ua)) browser = 'Facebook In-App';
  else if (/Zalo/i.test(ua)) browser = 'Zalo In-App';
  else if (/Edg/i.test(ua)) browser = 'Microsoft Edge';
  else if (/Chrome/i.test(ua) && !/Chromium|Edg/i.test(ua)) browser = 'Google Chrome';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Firefox/i.test(ua)) browser = 'Mozilla Firefox';
  else if (/SamsungBrowser/i.test(ua)) browser = 'Samsung Internet';
  else if (/Opera|OPR/i.test(ua)) browser = 'Opera';

  const screen = `${window.screen.width}x${window.screen.height} (dpr: ${window.devicePixelRatio || 1})`;

  return {
    deviceType,
    os,
    browser,
    screen,
    userAgent: ua,
  };
}

/**
 * Optionally fetch public IP with a 2-second timeout
 */
async function fetchIpInfo(): Promise<{ ip?: string; location?: string }> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      return {
        ip: data.ip,
        location: [data.city, data.country_name].filter(Boolean).join(', '),
      };
    }
  } catch {
    // Fallback: silently ignore or try simple ipify
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1500);
      const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        return { ip: data.ip };
      }
    } catch {
      // ignore
    }
  }
  return {};
}

/**
 * Send Markdown formatted notification to Telegram channel/group
 */
export async function sendTelegramMessage(text: string): Promise<boolean> {
  if (!BOT_TOKEN || !CHAT_ID) return false;

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to send telegram log:', e);
    return false;
  }
}

/**
 * Log when someone starts a test or visits the quiz
 */
export async function logStartQuiz(params: {
  userName: string;
  testTitle: string;
  mode: 'practice' | 'exam';
  totalQuestions: number;
}) {
  const device = getDeviceInfo();
  const net = await fetchIpInfo();

  const timeStr = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  const message = `
🚀 <b>[tinAB] CÓ NGƯỜI BẮT ĐẦU LÀM BÀI</b>
━━━━━━━━━━━━━━━━━━
👤 <b>Thí sinh:</b> <code>${params.userName || 'Chưa đặt tên'}</code>
📚 <b>Đề thi:</b> ${params.testTitle} (${params.totalQuestions} câu)
🎯 <b>Chế độ:</b> ${params.mode === 'exam' ? '⏱️ Thi thử (Tính giờ)' : '🎯 Ôn tập (Tức thì)'}
⏰ <b>Thời gian:</b> ${timeStr}

📱 <b>THÔNG TIN THIẾT BỊ:</b>
• <b>Loại:</b> ${device.deviceType} (${device.os})
• <b>Trình duyệt:</b> ${device.browser}
• <b>Màn hình:</b> <code>${device.screen}</code>
${net.ip ? `• <b>IP:</b> <code>${net.ip}</code>` : ''}
${net.location ? `• <b>Vị trí:</b> ${net.location}` : ''}
`;

  sendTelegramMessage(message.trim());
}

/**
 * Log when someone submits an exam
 */
export async function logSubmitExam(params: {
  userName: string;
  testTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpentSeconds: number;
}) {
  const device = getDeviceInfo();
  const net = await fetchIpInfo();

  const mins = Math.floor(params.timeSpentSeconds / 60);
  const secs = params.timeSpentSeconds % 60;
  const timeSpentFormatted = mins > 0 ? `${mins} phút ${secs} giây` : `${secs} giây`;
  const grade10 = ((params.score / params.totalQuestions) * 10).toFixed(1);
  const timeStr = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  const isPass = params.percentage >= 50;

  const message = `
🏁 <b>[tinAB] KẾT QUẢ NỘP BÀI THI</b>
━━━━━━━━━━━━━━━━━━
👤 <b>Thí sinh:</b> <code>${params.userName || 'Ẩn danh'}</code>
📚 <b>Đề thi:</b> ${params.testTitle}
🏆 <b>Điểm số:</b> <b>${grade10} / 10đ</b> (${params.score}/${params.totalQuestions} câu đúng - ${params.percentage}%)
${isPass ? '✅ <b>Xếp loại:</b> ĐẠT' : '❌ <b>Xếp loại:</b> CHƯA ĐẠT'}
⏱️ <b>Thời gian làm:</b> ${timeSpentFormatted}
⏰ <b>Nộp lúc:</b> ${timeStr}

📱 <b>THIẾT BỊ NỘP BÀI:</b>
• <b>Loại máy:</b> ${device.deviceType} - ${device.os}
• <b>Trình duyệt:</b> ${device.browser}
• <b>Độ phân giải:</b> <code>${device.screen}</code>
${net.ip ? `• <b>IP:</b> <code>${net.ip}</code>` : ''}
${net.location ? `• <b>Vị trí:</b> ${net.location}` : ''}
`;

  sendTelegramMessage(message.trim());
}
