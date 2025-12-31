import os from 'os';
import process from 'process';

let handler = async (m, { conn }) => {
  const used = process.memoryUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const platform = os.platform();
  const arch = os.arch();
  const uptime = process.uptime();
  const cpus = os.cpus();
  const load = os.loadavg();

  const format = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    return `${h}h ${m}m ${s}s`;
  };

  // حساب نسبة استخدام المعالج (متوسط جميع الأنوية)
  const cpuUsagePercent = cpus.map(cpu => {
    const total = Object.values(cpu.times).reduce((acc, tv) => acc + tv, 0);
    const idle = cpu.times.idle;
    return 100 - (100 * idle / total);
  });

  const avgCpuUsage = (cpuUsagePercent.reduce((a, b) => a + b, 0) / cpuUsagePercent.length).toFixed(2);

  const cpuModel = cpus[0].model;
  const cpuSpeed = cpus[0].speed;
  const cores = cpus.length;

  const message = `
🖥️ *حالة البوت*

🔹 المنصة: ${platform} ${arch}
🔹 المعالج: ${cpuModel}
🔹 عدد الأنوية: ${cores} @ ${cpuSpeed} MHz
🔹 استخدام المعالج: ${avgCpuUsage}%
🔹 مدة التشغيل: ${formatTime(uptime)}

💾 الذاكرة المستخدمة: ${format(used.rss)}
💾 الذاكرة الحرة: ${format(freeMem)}
💾 الذاكرة الكلية: ${format(totalMem)}

⚙️ حمل النظام:
   • 1 دقيقة: ${load[0].toFixed(2)}
   • 5 دقائق: ${load[1].toFixed(2)}
   • 15 دقيقة: ${load[2].toFixed(2)}
`.trim();

  m.reply(message);
};

handler.help = ['status', 'estado', 'حالة'];
handler.tags = ['info'];
handler.command = ['status', 'estado', 'حالة'];

export default handler;
