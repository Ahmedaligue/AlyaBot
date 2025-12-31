import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database', 'db_users.json');
const personalizePath = path.join(process.cwd(), 'database', 'personalize.json');

// دالة لقراءة ملفات JSON
function readJSON(filePath) {
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// الحصول على العملة المخصصة من personalize.json
function getCurrency() {
    let personalizeData = readJSON(personalizePath);
    return personalizeData.global?.currency || personalizeData.default?.currency || 'عملات';
}

let handler = async (m, { conn, text }) => {
    let userId = m.sender; // معرف المستخدم الذي نفذ الأمر
    let args = text.split(' '); // تقسيم النص إلى وسائط
    let amount = parseInt(args[0]); // كمية المال المراد تحويلها
    let target = args[1]; // المستلم للتحويل

    if (!amount || isNaN(amount) || amount <= 0) {
        m.reply('❌ من فضلك أدخل كمية صالحة للتحويل.');
        return;
    }

    if (!target || !target.startsWith('@')) {
        m.reply('❌ يجب أن تذكر المستخدم الذي تريد التحويل له.');
        return;
    }

    // الحصول على بيانات المستخدم والمستلم
    let db = readJSON(dbPath);
    let userData = db[userId] || { money: 0, bank: 0 };
    let targetId = target.replace('@', '') + '@s.whatsapp.net'; // تنسيق معرف المستلم

    // التحقق من وجود رصيد كافٍ في البنك
    if (userData.bank < amount) {
        m.reply('❌ ليس لديك رصيد كافٍ في البنك لإجراء هذا التحويل.');
        return;
    }

    // إذا لم يكن المستلم موجوداً في قاعدة البيانات، أنشئ له مدخلاً جديداً
    if (!db[targetId]) {
        db[targetId] = { money: 0, bank: 0 };
    }

    // تنفيذ عملية التحويل
    userData.bank -= amount; // خصم من بنك المرسل
    db[userId] = userData; // تحديث بيانات المرسل

    db[targetId].bank += amount; // إضافة إلى بنك المستلم
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2)); // حفظ التغييرات في db_users.json

    let currency = getCurrency(); // الحصول على العملة المخصصة

    // تأكيد عملية التحويل مع ذكر المستلم
    let receiverMention = `@${targetId.split('@')[0]}`;
    m.reply(`✅ لقد حولت *${amount} ${currency}* إلى ${receiverMention} داخل حسابه البنكي.`, null, { mentions: [targetId] });
};

// تعريف الأمر
handler.command = /^(تحويل)$/i;

export default handler;
