import fetch from 'node-fetch';

let handler = async (m, { args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(`🔎 استخدم الأمر هكذا:\n${usedPrefix + command} <اسم الشخصية>`);
  }

  const personajeBuscado = args.join(' ').toLowerCase();
  const url = 'https://raw.githubusercontent.com/Elpapiema/CharHub-Store/main/image_json/characters.json';

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`❌ خطأ في جلب البيانات. الكود: ${res.status}`);
    const data = await res.json();

    const personaje = data.find(p => p.name.toLowerCase().includes(personajeBuscado));

    if (!personaje) {
      return m.reply(`❌ لم يتم العثور على أي شخصية تطابق: *${args.join(' ')}*`);
    }

    let info = `✨ *معلومات الشخصية*\n\n`;
    info += `📛 *الاسم:* ${personaje.name}\n`;
    if (personaje.age) info += `🎂 *العمر:* ${personaje.age}\n`;
    if (personaje.source) info += `📺 *الأصل:* ${personaje.source}\n`;
    if (personaje.relationship) info += `💞 *العلاقة:* ${personaje.relationship}\n`;

    await conn.sendFile(m.chat, personaje.img, 'personaje.jpg', info, m);
  } catch (e) {
    console.error(e);
    m.reply(`⚠️ حدث خطأ أثناء البحث عن الشخصية. حاول لاحقاً.`);
  }
};

handler.help = ['winfo <اسم>'];
handler.tags = ['anime', 'info'];
handler.command = ['winfo', 'معلومات_وايفو'];

export default handler;
