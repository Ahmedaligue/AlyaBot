import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const dbPath = path.join(process.cwd(), 'db_users.json');
const eventsUrl = 'https://raw.githubusercontent.com/Elpapiema/CharHub-Store/refs/heads/main/Random/rob-events.json'; // رابط ملف الأحداث

// دالة لقراءة JSON محلي
function readJSON(filePath) {
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// دالة للحصول على العملة المخصصة
function getCurrency() {
    let personalizePath = path.join(process.cwd(), 'personalize.json');
    let personalizeData = readJSON(personalizePath);
    return personalizeData.global?.currency || personalizeData.default?.currency || 'عملات';
}

// دالة لجلب الأحداث من GitHub
async function fetchEvents() {
    try {
        let res = await fetch(eventsUrl);
        if (!res.ok) throw new Error('لم يتمكن من جلب ملف JSON.');
        return await res.json();
    } catch (e) {
        console.error('خطأ أثناء جلب أحداث السرقة:', e);
        return { successful: [], failed: [] };
    }
}

let handler = async (m, { conn, text }) => {
    let userId = m.sender;
    let args = text.split(' ');
    let target = args[0];

    let db = readJSON(dbPath);
    let userData = db[userId] || { money: 0, bank: 0 };
    let currency = getCurrency();

    let events = await fetchEvents(); // جلب الأحداث من GitHub

    if (target && target.startsWith('@')) {
        // وضع: سرقة مستخدم محدد
        let targetId = target.replace('@', '') + '@s.whatsapp.net';

        if (!db[targetId]) {
            m.reply('❌ المستخدم المذكور غير مسجل في قاعدة البيانات.');
            return;
        }

        let targetData = db[targetId];

        if (targetData.money <= 0) {
            m.reply(`❌ ${target} لا يملك مالاً في يده لتسرقه.`);
            return;
        }

        let success = Math.random() < 0.3; // نسبة نجاح 30%
        let amount = Math.floor(Math.random() * 200) + 50;

        if (success) {
            amount = Math.min(amount, targetData.money);
            targetData.money -= amount;
            userData.money += amount;
            db[targetId] = targetData;
            db[userId] = userData;
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            m.reply(`✅ لقد نجحت في سرقة *${amount} ${currency}* من ${target}!`);
        } else {
            let lostAmount = Math.floor(amount / 2);
            userData.money = Math.max(0, userData.money - lostAmount);
            db[userId] = userData;
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            m.reply(`❌ فشلت في السرقة وخسرت *${lostAmount} ${currency}* أثناء المحاولة.`);
        }
    } else {
        // وضع: حدث سرقة عشوائي
        let isSuccess = Math.random() < 0.5;
        let eventList = isSuccess ? events.successful : events.failed;
        let event = eventList[Math.floor(Math.random() * eventList.length)];
        let amount = event.amount;

        if (isSuccess) {
            userData.money += amount;
        } else {
            amount = Math.min(amount, userData.money);
            userData.money = Math.max(0, userData.money - amount);
        }

        db[userId] = userData;
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        m.reply(event.message.replace('{amount}', `${Math.abs(amount)} ${currency}`));
    }
};

handler.command = ['rob', 'robar', 'crime', 'سرقة'];

export default handler;
