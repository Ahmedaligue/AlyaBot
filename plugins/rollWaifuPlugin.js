import { promises as fs } from 'fs';
import fetch from 'node-fetch';

// رابط ملف characters.json (عن بُعد من GitHub)
const charactersUrl = 'https://raw.githubusercontent.com/Elpapiema/CharHub-Store/refs/heads/main/image_json/characters.json';
const filePath = './database/personalize.json';

// دالة لتحميل ملف characters.json من GitHub
async function loadCharacters() {
    try {
        const res = await fetch(charactersUrl);
        const characters = await res.json();
        return characters;
    } catch (error) {
        throw new Error('❌ لم يتمكن من تحميل ملف characters.json من GitHub.');
    }
}

// تعريف المعالج للأمر "rw" أو "rollwaifu"
let handler = async (m, { conn }) => {
    try {
        // تحميل العملة من ملف personalize.json
        const data = JSON.parse(await fs.readFile(filePath));
        const globalConfig = data.global;
        const defaultConfig = data.default;
        const currency = globalConfig.currency || defaultConfig.currency;

        // تحميل الشخصيات واختيار شخصية عشوائية
        const characters = await loadCharacters();
        const randomCharacter = characters[Math.floor(Math.random() * characters.length)];

        // رسالة معلومات الشخصية
        const message = `
✨ *الاسم*: ${randomCharacter.name}
🎂 *العمر*: ${randomCharacter.age} سنة
💖 *الحالة العاطفية*: ${randomCharacter.relationship}
📚 *الأصل*: ${randomCharacter.source}
💵 *التكلفة*: ${randomCharacter.buy} ${currency}
        `;

        // إرسال الرسالة مع معلومات الشخصية والصورة
        const sentMsg = await conn.sendFile(m.chat, randomCharacter.img, `${randomCharacter.name}.jpg`, message, m);

        // تخزين الشخصية المولدة باستخدام معرف الرسالة المرسلة من البوت
        if (!global.lastCharacter) global.lastCharacter = {};
        global.lastCharacter[sentMsg.key.id] = randomCharacter;

    } catch (error) {
        await conn.reply(m.chat, `❌ خطأ أثناء تحميل الشخصية: ${error.message}`, m);
    }
};

// إعدادات الأمر
handler.help = ['rw', 'rollwaifu', 'رولوايفو'];
handler.tags = ['anime'];
handler.command = ['rw', 'rollwaifu', 'رولوايفو']; // إضافة أمر بالعربية

export default handler;
