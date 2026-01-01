import { execSync } from 'child_process';

const handler = async (m, { conn, text }) => {
  try {
    const stdout = execSync('git pull' + (m.fromMe && text ? ' ' + text : ''));
    let messager = stdout.toString();

    if (messager.includes('Already up to date.')) {
      messager = `✅ البوت محدث بالفعل إلى آخر نسخة.`;
    }
    if (messager.includes('Updating')) {
      messager = `✅ تم التحديث بنجاح ...\n` + stdout.toString();
    }

    conn.reply(m.chat, messager, m);
  } catch {
    try {
      const status = execSync('git status --porcelain');
      if (status.length > 0) {
        const conflictedFiles = status
          .toString()
          .split('\n')
          .filter(line => line.trim() !== '')
          .map(line => {
            if (
              line.includes('.npm/') ||
              line.includes('.cache/') ||
              line.includes('tmp/') ||
              line.includes('GataBotSession/') ||
              line.includes('npm-debug.log')
            ) {
              return null;
            }
            return '*→ ' + line.slice(3) + '*';
          })
          .filter(Boolean);

        if (conflictedFiles.length > 0) {
          const errorMessage = `⚠️ تم العثور على تغييرات محلية في ملفات البوت تتعارض مع التحديثات الجديدة من المستودع.\n\n> لإكمال التحديث، قم بإعادة تثبيت البوت أو نفذ التحديثات يدوياً.\n\n*📂 الملفات المتعارضة:*\n\n${conflictedFiles.join('\n')}.\n`;
          await conn.reply(m.chat, errorMessage, m);
        }
      }
    } catch (error) {
      console.error(error);
      if (error.message) {
        const errorMessage2 = `❌ خطأ: ${error.message}`;
        await m.reply(errorMessage2);
      } else {
        await m.reply('❌ حدث خطأ غير متوقع أثناء محاولة التحديث.');
      }
    }
  }
};

handler.command = /^(update|actualizar|gitpull|تحديث)$/i;
handler.rowner = true;

export default handler;
