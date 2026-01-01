import fs from 'fs';

const filePath = './database/personalize.json';

let handler = async (m) => {
    const data = JSON.parse(fs.readFileSync(filePath));

    // إعادة ضبط التخصيص العام إلى الحالة الافتراضية
    data.global = {
        botName: null,
        currency: null,
        videos: []
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    m.reply('✅ تم إعادة ضبط التخصيص العام بنجاح.');
};

handler.help = ['resetpreferences'];
handler.tags = ['config'];
handler.command = /^resetpreferences$/i;

export default handler;
