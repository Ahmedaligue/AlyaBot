const handler = async (m, { conn }) => {
    const token = generateToken(8);
    m.reply(`🔑 تم إنشاء الرمز: *${token}*`);
};

handler.command = ['الحصول_على_الرمز', 'gettoken'];
handler.rowner = true; // فقط المالكين يمكنهم استخدام هذا الأمر

function generateToken(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

export default handler;
