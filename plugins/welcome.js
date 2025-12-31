import fetch from 'node-fetch';
import fs from 'fs';

const settingsPath = './database/settings.json';
// نخزن الحالات السابقة لكل مجموعة
const welcomeStatusCache = {};

export async function before(m, { conn, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return;

  const chatId = m.chat;

  // قراءة الإعدادات في الوقت الفعلي
  let settings = {};
  if (fs.existsSync(settingsPath)) {
    try {
      settings = JSON.parse(fs.readFileSync(settingsPath));
    } catch (e) {
      console.error('[ERROR] لم يتمكن من قراءة settings.json:', e);
      return;
    }
  }

  // الحصول على حالة "welcome" (المجموعة > عام > false)
  const groupConfig = settings.groups?.[chatId];
  const currentWelcome = groupConfig?.welcome ?? settings.global?.welcome ?? false;

  // التحقق من التغييرات مقارنة بالحالة السابقة
  const prevWelcome = welcomeStatusCache[chatId];
  if (prevWelcome !== currentWelcome) {
    welcomeStatusCache[chatId] = currentWelcome;
    if (currentWelcome) {
      console.log(`✅ الترحيب مُفعل للمجموعة ${chatId}`);
    } else {
      console.log(`❌ الترحيب مُعطل للمجموعة ${chatId}`);
    }
  }

  // إذا كان معطل، لا تكمل
  if (!currentWelcome) return;

  const userJid = m.messageStubParameters?.[0];
  if (!userJid) return;

  const usuario = `@${userJid.split('@')[0]}`;
  const pp = await conn.profilePictureUrl(userJid, 'image').catch(() => 'https://files.catbox.moe/xegxay.jpg');
  const img = await (await fetch(pp)).buffer();

  const subject = groupMetadata.subject;
  const descs = groupMetadata.desc || "*الوصف الافتراضي للمجموعة*";

  if (m.messageStubType === 27) {
    const textWel = `
┏━━━━━❖━━━✦━━━❖━━━━━┓
┃ 💠 مـرحـبـاً 💠
┗━━━━━❖━━━✦━━━❖━━━━━┛

🌸 أهلاً ${usuario}~
✨ مرحباً بك في *『${subject}』*

🫶 هنا ستجد فقط:
– صداقات جميلة  
– فوضى لطيفة  
– وبوت رائع... *يعني أنا~ 💁‍♀️*

💬 اكتب *#menu* إذا أردت أن ترى ما أستطيع فعله~

📌 *اقرأ وصف المجموعة، حسناً؟*
> *${descs}*

🎀 استمتع بوقتك، وإلا سأشدك من أذنك 😘
`;
    await conn.sendMessage(chatId, {
      image: img,
      caption: textWel,
      mentions: [userJid]
    });

  } else if (m.messageStubType === 32) {
    const textBye = `
┏━━━━━❖━━━✦━━━❖━━━━━┓
┃ 💔 وداعاً... أو ربما لا 💔
┗━━━━━❖━━━✦━━━❖━━━━━┛

😢 غادرنا ${usuario}...

🕊️ نتمنى أن يحفظه القدر...  
🚆 أو أن يدهسه قطار، من يدري 😇

✨ سيضيء هذا المكان أقل بدونك... لكن فقط قليلاً~
`;
    await conn.sendMessage(chatId, {
      image: img,
      caption: textBye,
      mentions: [userJid]
    });

  } else if (m.messageStubType === 28) {
    const textBan = `
┏━━━━━❖━━━✦━━━❖━━━━━┓
┃ 💅 مـطـرود 💥
┗━━━━━❖━━━✦━━━❖━━━━━┛

${usuario} تم *طرده من المجموعة* 🧹

🥀 نتمنى له التوفيق...  
🚪 ولا يعود مرة أخرى، شكراً~

✨ أقل دراما، وأكثر سلام ☕
`;
    await conn.sendMessage(chatId, {
      image: img,
      caption: textBan,
      mentions: [userJid]
    });
  }
}
