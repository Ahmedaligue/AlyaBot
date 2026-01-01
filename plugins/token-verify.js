import fetch from 'node-fetch';
import fs from 'fs';

// الرابط مشفر بـ base64
const encryptedURL = 'aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL0VscGFwaWVtYS9BZGljaW9uZXMtcGFyYS1BbHlhQm90LVJhcGh0YWxpYUJvdC0vcmVmcy9oZWFkcy9tYWluL2FjY2Vzby90b2tlbi5qc29u';

const handler = async (m, { args }) => {
    if (!args[0]) return m.reply('⚠️ يجب أن تُدخل رمزاً.\nمثال: *.token ABCD1234*');

    const token = args[0].toUpperCase();
    // فك تشفير الرابط من base64
    const url = Buffer.from(encryptedURL, 'base64').toString('utf-8');

    try {
        // 📥 جلب ملف `tokens.json` من GitHub
        const response = await fetch(url);
        if (!response.ok) throw new Error('خطأ أثناء جلب JSON من GitHub.');

        const githubData = await response.json();

        // 📥 جلب ملف `token_status.json` محلياً
        let localData = {};
        
        // التحقق إذا كان الملف موجوداً
        if (fs.existsSync('./token_status.json')) {
            localData = JSON.parse(fs.readFileSync('./token_status.json', 'utf-8'));
        } else {
            // إذا لم يكن موجوداً، إنشاؤه ببنية افتراضية
            localData = {};
            fs.writeFileSync('./token_status.json', JSON.stringify(localData, null, 2), 'utf-8');
        }

        // 🔍 البحث عن الرمز في `tokens.json`
        if (githubData.mainTokens && githubData.mainTokens[token]) {
            const tokenData = githubData.mainTokens[token];
            const tokenValue = tokenData.value;
            const maxUses = tokenData.maxUses;
            const createdAt = new Date(tokenData.createdAt).toLocaleString();
            return m.reply(`✅ الرمز: *${token}*\n🔹 القيمة: ${tokenValue}\n🔸 الحد الأقصى للاستخدام: ${maxUses}\n📅 تاريخ الإنشاء: ${createdAt}`);
        }

        if (githubData.subBotTokens && githubData.subBotTokens[token]) {
            const subBotInfo = localData[token] || { inUse: false };
            return m.reply(`🔹 رمز فرعي للبوت: *${token}*\n🚀 قيد الاستخدام: ${subBotInfo.inUse ? 'نعم' : 'لا'}`);
        }

        return m.reply(`❌ الرمز *${token}* غير موجود.`);
    } catch (error) {
        return m.reply('❌ حدث خطأ أثناء جلب الرموز. تأكد أن ملف JSON متاح.');
    }
};

handler.command = ['token'];

export default handler;
