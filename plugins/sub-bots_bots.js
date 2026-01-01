import ws from 'ws';

async function handler(m, { conn: _envio, usedPrefix }) {
  const msgTxt = await ("✅ إعارة البوت للانضمام إلى المجموعات");
  const msgTxt2 = await ("مدة التشغيل");
  const msgTxt3 = await ("*عذراً، لم يتم العثور على أي بوتات فرعية، تحقق لاحقاً.*");
  const msgTxt4 = await ("اسم المستخدم");

  const users = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])];

  function convertirMsADiasHorasMinutosSegundos(ms) {
    var segundos = Math.floor(ms / 1000);
    var minutos = Math.floor(segundos / 60);
    var horas = Math.floor(minutos / 60);
    var días = Math.floor(horas / 24);
    segundos %= 60;
    minutos %= 60;
    horas %= 24;
    var resultado = "";
    if (días !== 0) {
      resultado += días + " يوم، ";
    }
    if (horas !== 0) {
      resultado += horas + " ساعة، ";
    }
    if (minutos !== 0) {
      resultado += minutos + " دقيقة، ";
    }
    if (segundos !== 0) {
      resultado += segundos + " ثانية";
    }
    return resultado;
  }

  const message = users.map((v, index) => {
    const botConfig = global.db.data.users[v.user.jid] || {};
    const botNumber = botConfig.privacy ? `${msgTxt4}: ` : `wa.me/${v.user.jid.replace(/[^0-9]/g, '')}?text=${usedPrefix}estado`;
    const prestarStatus = botConfig.privacy ? '' : (botConfig.prestar ? msgTxt : '');
    return `📡 ${botNumber} (${v.user.name || '-'})\n*⏳ ${msgTxt2} :* ${v.uptime ? convertirMsADiasHorasMinutosSegundos(Date.now() - v.uptime) : "غير معروف"}\n${prestarStatus}`;
  }).join('\n\n');

  const replyMessage = message.length === 0 ? msgTxt3 : message;
  const totalUsers = users.length;

  const responseMessage = await (`*🤖 إليك قائمة ببعض البوتات الفرعية المتصلة 🤖️*\n\n*👉🏻 يمكنك التواصل معهم لمعرفة إن كانوا سينضمون إلى مجموعتك*\n\n*نرجو منك:*\n*1.- أن تكون لطيفاً ✅*\n*2.- لا تُلح ولا تجادل ✅*\n\n*✳️ إذا ظهر النص التالي فارغاً فهذا يعني أنه لا يوجد أي بوت فرعي متاح حالياً، حاول لاحقاً.*\n\n*_⚠ ملاحظة: هذه الجلسات تخص أشخاصاً لا علاقة لهم بفريق AlyaBot، لذلك لسنا مسؤولين عما يحدث هناك._*\n\n*🤖 عدد البوتات الفرعية المتصلة :* `) + `${totalUsers || '0'}\n\n${replyMessage.trim()}`.trim();

  await _envio.sendMessage(m.chat, {
    text: responseMessage,
    contextInfo: {
      mentionedJid: _envio.parseMention(responseMessage)
      /*, externalAdReply: { mediaUrl: null, mediaType: 1, description: null, title: wm, body: '𝐒𝐮𝐩𝐞𝐫 𝐁𝐨𝐭 𝐃𝐞 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩', previewType: 0, thumbnail: null, sourceUrl: null}*/
    }
  }, { quoted: m });
}

handler.command = handler.help = ['listjadibot', 'bots', 'قائمة_البوتات'];
handler.tags = ['jadibot'];

export default handler;
