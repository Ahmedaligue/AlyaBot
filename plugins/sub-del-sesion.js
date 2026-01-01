import { readdirSync, statSync, unlinkSync, existsSync, readFileSync, watch, rmSync, promises as fs } from "fs";
import path, { join } from 'path';

let handler = async (m, { conn, usedPrefix, command }, args) => {
  let parentw = conn;
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
  let uniqid = `${who.split`@`[0]}`;
  let userS = `${conn.getName(who)}`;

  if (global.conn.user.jid !== conn.user.jid) {
    return conn.sendMessage(
      m.chat,
      {
        text: `*⚠️ ${await tr("استخدم هذا الأمر مع البوت الرئيسي")}*\n\nwa.me/${global.conn.user.jid.split`@`[0]}&text=${usedPrefix + command}`
      },
      { quoted: m }
    );
  } else {
    try {
      await fs.rmdir("./jadibts/" + uniqid, { recursive: true, force: true });
      await conn.sendMessage(
        m.chat,
        { text: `*${await tr("سوف أفتقدك")} ${wm} ${await tr("إلى اللقاء!!")} 🥹*` },
        { quoted: m }
      );
      await conn.sendMessage(
        m.chat,
        { text: await tr(`*⚠️ تم تسجيل الخروج وحذف كل الآثار*`) },
        { quoted: m }
      );
    } catch (err) {
      if (err.code === 'ENOENT' && err.path === `./jadibts/${uniqid}`) {
        await conn.sendMessage(
          m.chat,
          { text: await tr("⚠️ أنت لست بوت فرعي") },
          { quoted: m }
        );
      } else {
        console.error(userS + ' ' + await tr(`⚠️ تم تسجيل الخروج كبوت فرعي`), err);
      }
    }
  }
};

handler.help = ['deletesession', 'eliminarsesion', 'حذف_الجلسة'];
handler.tags = ['jadibot'];
handler.command = /^(deletesess?ion|eliminarsesion|borrarsesion|delsess?ion|cerrarsesion|حذف_الجلسة)$/i;
handler.private = true;
handler.fail = null;

export default handler;
