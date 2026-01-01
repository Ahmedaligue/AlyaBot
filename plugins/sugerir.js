const handler = async (m, { args, text, conn, command }) => {
  if (!text) return m.reply('⚠️ من فضلك اكتب اقتراحاً. مثال: .sug أضف المزيد من الأوامر الممتعة.');

  const grupoSugerencias = '120363395553029777@g.us';
  const sugerencia = `*اقتراح جديد تم استلامه:*\n\n"${text}"\n\n*أُرسل بواسطة:* @${m.sender.split('@')[0]}`;

  // إرسال إلى المجموعة المخصصة
  await conn.sendMessage(grupoSugerencias, {
    text: sugerencia,
    mentions: [m.sender]
  });

  // تأكيد للمستخدم
  await m.reply('✅ شكراً على اقتراحك! تم إرساله بنجاح إلى فريق الإدارة.');
};

handler.command = /^sug$/i;
handler.help = ['sug <النص>'];
handler.tags = ['info'];
handler.register = true;

export default handler;
