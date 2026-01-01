import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database', 'db_users.json');
const personalizePath = path.join(process.cwd(), 'database', 'personalize.json');

// دالة لقراءة ملفات JSON
function readJSON(filePath) {
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// دالة للكتابة في ملفات JSON
function writeJSON(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// الحصول على العملة المخصصة من personalize.json
function getCurrency() {
    let personalizeData = readJSON(personalizePath);
    return personalizeData.global?.currency || personalizeData.default?.currency || 'عملات';
}

let handler = async (m, { text }) => {
    let userId = m.sender; // معرف المستخدم الذي نفذ الأمر
    if (!userId) {
        m.reply('❌ لم يتمكن من الحصول على معرفك.');
        return;
    }

    let db = readJSON(dbPath);
    let currency = getCurrency();

    // التأكد من أن هيكل بيانات المستخدم موجود
    if (!db[userId]) db[userId] = { money: 0, bank: 0 };

    let userMoney = db[userId].money;
    let userBank = db[userId].bank;

    // التعامل مع الأمر بدون وسيط
    if (!text) {
        m.reply(`❌ استخدام غير صحيح. استخدم:\n- \`.retirar الكمية\`\n- \`.retirar all\``);
        return;
    }

    let withdrawAmount;

    if (text.toLowerCase() === 'all') {
        withdrawAmount = userBank; // سحب كل الرصيد
    } else {
        withdrawAmount = parseInt(text);
        if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
            m.reply(`❌ أدخل كمية صالحة.`);
            return;
        }
    }

    // التحقق من أن المستخدم لديه رصيد كافٍ في البنك للسحب
    if (withdrawAmount > userBank) {
        m.reply(`❌ ليس لديك رصيد كافٍ في البنك لسحب هذه الكمية.`);
        return;
    }

    // تنفيذ عملية السحب
    db[userId].money = userMoney + withdrawAmount;
    db[userId].bank = userBank - withdrawAmount; // تحديث رصيد البنك بشكل صحيح

    writeJSON(dbPath, db); // حفظ التغييرات

    m.reply(`✅ لقد سحبت ${withdrawAmount} ${currency} من البنك.\n\n💰 **${currency} المتاح:** ${db[userId].money}\n🏦 **الرصيد المتبقي في البنك:** ${db[userId].bank}`);
};

// تعريف الأمر
handler.command = /^(retirar|سحب)$/i;

export default handler;
