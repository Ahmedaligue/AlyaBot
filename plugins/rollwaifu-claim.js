import { promises as fs } from 'fs';

const haremFilePath = './database/harem.json';
const usersDbPath = './database/db_users.json';
const perzonaliPath = './database/personalize.json';

async function loadJSON(path, defaultValue = {}) {
    try {
        const data = await fs.readFile(path, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(path, JSON.stringify(defaultValue, null, 2));
            return defaultValue;
        } else {
            throw new Error(`❌ خطأ أثناء تحميل الملف ${path}`);
        }
    }
}

async function saveJSON(path, data) {
    try {
        await fs.writeFile(path, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        throw new Error(`❌ خطأ أثناء حفظ الملف ${path}`);
    }
}

let handler = async (m, { conn }) => {
    try {
        const dataP = JSON.parse(await fs.readFile(perzonaliPath));
        const globalConfig = dataP.global;
        const defaultConfig = dataP.default;
        const currency = globalConfig.currency || defaultConfig.currency;

        let character;

        if (m.quoted) {
            const quotedSender = m.quoted.sender || m.quoted.participant || '';
            const botJid = conn.user.jid;
            const isFromBot =
                quotedSender === botJid ||
                quotedSender === botJid.replace(/:[0-9]+/, '') ||
                quotedSender.endsWith('@lid') ||
                m.quoted.id?.startsWith('BAE5') ||
                m.quoted.id?.startsWith('3EB0');

            if (!isFromBot) {
                await conn.reply(m.chat, '⚠️ الرسالة التي ترد عليها لا تحتوي على شخصية صالحة للمطالبة.', m);
                return;
            }

            character = global.lastCharacter?.[m.quoted.id];

            if (!character) {
                await conn.reply(m.chat, '❌ لم يتم العثور على الشخصية المقابلة. تأكد من الرد على الرسالة الصحيحة.', m);
                return;
            }

        } else {
            await conn.reply(m.chat, '⚠️ يجب أن ترد على رسالة تحتوي على شخصية للمطالبة بها.', m);
            return;
        }

        const harem = await loadJSON(haremFilePath);
        const usersDb = await loadJSON(usersDbPath);

        if (!usersDb[m.sender]) {
            usersDb[m.sender] = { money: 0, bank: 0 };
        }

        const userMoney = usersDb[m.sender].money || 0;
        const userBank = usersDb[m.sender].bank || 0;
        const cost = parseInt(character.buy) || 0;

        if (userMoney + userBank < cost) {
            await conn.reply(
                m.chat,
                `❌ ليس لديك ما يكفي من المال للمطالبة بـ ${character.name}.\n\nتحتاج إلى ${cost} ${currency} إجمالاً.\n\nاستخدم #work لكسب المال.`,
                m
            );
            return;
        }

        if (userMoney >= cost) {
            usersDb[m.sender].money -= cost;
        } else {
            const remaining = cost - userMoney;
            usersDb[m.sender].money = 0;
            usersDb[m.sender].bank -= remaining;
        }

        if (!harem[m.sender]) harem[m.sender] = [];

        if (harem[m.sender].some(c => c.name === character.name)) {
            await conn.reply(m.chat, `❗ لقد طالبت بالفعل بـ ${character.name}.`, m);
            return;
        }

        harem[m.sender].push(character);

        await saveJSON(haremFilePath, harem);
        await saveJSON(usersDbPath, usersDb);

        await conn.reply(
            m.chat,
            `✅ لقد طالبت بـ ${character.name} بنجاح.\n\nتم خصم ${cost} ${currency}.\n\nرصيدك الحالي:\n💰 المال في اليد: ${usersDb[m.sender].money} ${currency}\n🏦 المال في البنك: ${usersDb[m.sender].bank} ${currency}`,
            m
        );
    } catch (error) {
        await conn.reply(m.chat, `❌ خطأ أثناء المطالبة بالشخصية: ${error.message}`, m);
    }
};

handler.help = ['claim'];
handler.tags = ['anime'];
handler.command = ['claim', 'c', 'reclamar', 'مطالبة'];

export default handler;
