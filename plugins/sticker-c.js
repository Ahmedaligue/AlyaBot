import { sticker } from '../lib/sticker.js'
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import { webp2png } from '../lib/webp2mp4.js'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let stiker = false
  let stick = args.join(" ").split("|");
  let f = stick[0] !== "" ? stick[0] : packname;
  let g = typeof stick[1] !== "undefined" ? stick[1] : author;
  try {         
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mediaType || ''
    if (/webp|image|video/g.test(mime)) {
      if (/video/g.test(mime)) if ((q.msg || q).seconds > 18) return m.reply('⚠️ أين رأيت ملصق فيديو مدته 15 ثانية؟ اجعل الفيديو أقصر، بحد أقصى 12 ثانية.')
      let img = await q.download?.()
      if (!img) return m.reply(`*وأين هي الصورة؟ 🤔 قم بالرد على صورة لصنع الملصق. استخدم:* ${usedPrefix + command}`) 
      let out
      try {
        stiker = await sticker(img, false, f, g)
      } catch (e) {
        console.error(e)
      } finally {
        //conn.reply(m.chat, `انتظر قليلاً، أقوم بإنشاء الملصق 👏\n\n> *تذكر أن الفيديوهات يجب أن تكون 7 ثوانٍ فقط*`, m)
        if (!stiker) {
          if (/webp/g.test(mime)) out = await webp2png(img)
          else if (/image/g.test(mime)) out = await uploadImage(img)
          else if (/video/g.test(mime)) out = await uploadFile(img)
          if (typeof out !== 'string') out = await uploadImage(img)
          stiker = await sticker(false, out, f, g)
        }
      }
    } else if (args[0]) {
      if (isUrl(args[0])) stiker = await sticker(false, args[0], global.packname, global.author)
      else return m.reply('❌ الرابط غير صالح')
    }
  } catch (e) {
    console.error(e)
    if (!stiker) stiker = e
  } finally {
    if (stiker) conn.sendFile(m.chat, stiker, 'sticker.webp', '', m, true, { contextInfo: { 'forwardingScore': 200, 'isForwarded': false }}, { quoted: m })
    else return m.reply(`*وأين هي الصورة؟ 🤔 قم بالرد على صورة لصنع الملصق. استخدم:* ${usedPrefix + command}`) 
  }
}

handler.help = ['sticker']
handler.tags = ['sticker']
handler.command = ['s', 'sticker', 'ملصق'] 
handler.register = true

export default handler

const isUrl = (text) => {
  return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png)/, 'gi'))
}
