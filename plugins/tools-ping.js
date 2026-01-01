let handler = async (m, { conn }) => {
    const start = Date.now();
    await m.reply('⏱️ جاري حساب سرعة الاستجابة...');
    const end = Date.now();
    const ping = end - start;
  
    await m.reply(`> 🏓 سرعة الاستجابة: ${ping} ms`);
};
  
handler.help = ['ping', 'p', 'بنغ'];
handler.tags = ['info'];
handler.command = ['ping', 'p', 'بنغ'];
  
export default handler;
