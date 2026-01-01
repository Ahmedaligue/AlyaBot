import fetch from 'node-fetch'; // إذا لم يكن لديك 'node-fetch'، قم بتثبيته بـ 'npm install node-fetch'
import fs from 'fs';

// دالة للحصول على عمل عشوائي من GitHub
const getRandomJob = async () => {
    const url = 'https://raw.githubusercontent.com/Elpapiema/CharHub-Store/refs/heads/main/Random/slut.json'; // رابط ملف JSON
    const response = await fetch(url);
    const data = await response.json();
    const jobs = data.jobs;
    return jobs[Math.floor(Math.random() * jobs.length)];
};

// دالة للحصول على اسم العملة من 'personalize.json' (تحت الوسم global)
const getCurrencyName = () => {
    const config = JSON.parse(fs.readFileSync('./database/personalize.json'));
    return config.global?.currency || 'ين'; // إذا لم توجد عملة مخصصة، استخدم 'ين'
};

// حفظ المال المكتسب في 'db_users.json'
const saveEarnings = (userId, moneyEarned) => {
    const database = fs.existsSync('./database/db_users.json') ? JSON.parse(fs.readFileSync('./database/db_users.json')) : {};
    if (!database[userId]) {
        database[userId] = { money: 0 };
    }
    database[userId].money += moneyEarned;
    fs.writeFileSync('./database/db_users.json', JSON.stringify(database, null, 2));
};

// الأمر للعمل
const handler = async (m, { conn, command }) => {
    try {
        const userId = m.sender;
        const job = await getRandomJob(); // الحصول على عمل عشوائي
        const moneyEarned = Math.floor(Math.random() * (job.maxMoney - job.minMoney + 1)) + job.minMoney; // حساب المال المكتسب
        const currency = getCurrencyName(); // الحصول على اسم العملة (مخصص أو افتراضي)

        // حفظ المال المكتسب في قاعدة البيانات
        saveEarnings(userId, moneyEarned);

        // الرد برسالة العمل المنجز
        const message = ` ❀ ${job.description} ${moneyEarned} ${currency}.`;
        await conn.reply(m.chat, message, m);
    } catch (error) {
        console.error(error);
        await conn.reply(m.chat, '❌ حدث خطأ أثناء المعالجة \n \n خطأ في بناء الجملة داخل slut.json.', m);
    }
};

handler.command = /^(عمل|slut)$/i;

export default handler;
