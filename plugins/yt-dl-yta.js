import fetch from 'node-fetch';

const handler = async (m, { conn, text, command }) => {
  if (!text) {
    return conn.reply(m.chat, '❌ يرجى تقديم رابط يوتيوب صالح.', m);
  }

  const servers = [
    { name: 'خادم ماشا', baseUrl: masha },
    { name: 'خادم أليا', baseUrl: alya },
    { name: 'خادم ماساتشيكا', baseUrl: masachika },
  ];

  // Función para intentar descargar audio de los servidores en orden aleatorio
  async function tryServers(serversList) {
    if (serversList.length === 0) throw '❌ جميع الخوادم فشلت. حاول لاحقاً.';

    const [currentServer, ...rest] = serversList;

    try {
      await conn.reply(m.chat, `🔄 جاري محاولة تحميل الصوت من ${currentServer.name}...`, m);

      const apiUrl = `${currentServer.baseUrl}/download_audio?url=${encodeURIComponent(text)}`;
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);

      const result = await res.json();

      if (!result || !result.file_url) {
        throw new Error('لم يتم تلقي رابط الصوت');
      }

      return { result, server: currentServer };
    } catch (e) {
      console.error(`Error en ${currentServer.name}:`, e.message || e);
      return tryServers(rest);
    }
  }

  try {
    const { result, server } = await tryServers(shuffleArray(servers));

    // Enviar audio
    await conn.sendMessage(
      m.chat,
      {
        audio: { url: result.file_url },
        mimetype: 'audio/mp4',
        ptt: false,
      },
      { quoted: m }
    );

    await conn.reply(m.chat, `✅ تم تحميل الصوت بنجاح من ${server.name}.`, m);

  } catch (e) {
    console.error(e);
    conn.reply(m.chat, e.toString(), m);
  }
};

// Función para barajar array (Fisher-Yates)
function shuffleArray(array) {
  let arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

handler.command = /^(ytmp3|yta)$/i;

export default handler;
