import { promises as fs } from 'fs';

// مسار ملف harem.json
const haremFilePath = './database/harem.json';

// دالة لتحميل ملف harem.json
async function loadHarem() {
    try {
        const data = await fs.readFile(haremFilePath, 'utf-8');
        return JSON.parse(data); // إرجاع الكائن بالكامل
    } catch (error) {
        throw new Error('❌ لم يتمكن من تحميل ملف harem.json.');
    }
}

// تعريف المعالج للأمر "harem"
let handler = async (m, { conn }) => {
    try {
        const harem = await loadHarem();
        
        // الحصول على معرف المستخدم الذي نفذ الأمر
        const userId = m.sender; // m.sender يحتوي على معرف المستخدم

        // التحقق إذا كان لدى المستخدم شخصيات في الهاريم
        const userHarem = harem[userId];
        if (!userHarem || userHarem.length === 0) {
            await conn.reply(m.chat, '⚠️ ليس لديك شخصيات مُطالبة في الهاريم.', m);
            return;
        }

        // إنشاء رسالة مع قائمة الشخصيات والبيانات الجديدة
        let message = '✨ *الشخصيات في هاريمك:*\n';
        userHarem.forEach((character, index) => {
            message += `${index + 1}. ${character.name}\n`;
            message += `   الحالة العاطفية: ${character.relationship}\n`;
            message += `   الأصل: ${character.source}\n \n`;
        });

        // إرسال الرسالة مع قائمة الشخصيات وصورة مخصصة
        await conn.sendFile(m.chat, 'https://files.catbox.moe/bnjw8e.jpg', 'harem.jpg', message, m);
    } catch (error) {
        await conn.reply(m.chat, `❌ خطأ أثناء تحميل الهاريم: ${error.message}`, m);
    }
};

// إعدادات الأمر
handler.help = ['harem'];
handler.tags = ['anime'];
handler.command = /^(harem|هاريم)$/i; // إضافة أمر "هاريم" بالعربية

export default handler;
