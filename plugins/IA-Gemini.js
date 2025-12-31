/* código y API desarrollada por
Https://github.com/deylin-eliac
Parchado y corregido por @Emma (Violet's Version) https://github.com/Elpapiema
No quites créditos */


import fetch from 'node-fetch'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

const MAX_IMAGE_SIZE_MB = 5

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const q = m.quoted || m
  const mime = (q.msg || q).mimetype || ''
  const isSupportedImage = /^image\/(jpe?g|png|webp|gif)$/.test(mime)

  if (!text && !isSupportedImage) {
    return conn.reply(m.chat, `💡 أرسل أو رد على صورة (jpg, png, webp, gif) مع سؤال.\n\nمثال:\n${usedPrefix + command} ماذا ترى في هذه الصورة؟`, m)
  }

  try {
    await m.react('🌟')
    conn.sendPresenceUpdate('composing', m.chat)

    let base64Image = null
    let mimeType = null

    if (isSupportedImage) {
      const stream = await downloadContentFromMessage(q, 'image')
      let buffer = Buffer.from([])

      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
      }

      // Validar tamaño máximo
      const sizeInMB = buffer.length / (1024 * 1024)
      if (sizeInMB > MAX_IMAGE_SIZE_MB) {
        await m.react('⚠️')
        return conn.reply(m.chat, `⚠️ الصورة كبيرة جداً (${sizeInMB.toFixed(2)} MB). الحد الأقصى: ${MAX_IMAGE_SIZE_MB} MB.`, m)
      }

      base64Image = `data:${mime};base64,${buffer.toString('base64')}`
      mimeType = mime
    }

    const body = {
      prompts: text ? [text] : [],
      imageBase64List: base64Image ? [base64Image] : [],
      mimeTypes: mimeType ? [mimeType] : [],
      temperature: 0.7
    }

    const res = await fetch('https://g-mini-ia.vercel.app/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (!res.ok) throw `🌐 خطأ في الـ API: ${res.status} ${res.statusText}`

    const data = await res.json()
    const respuesta = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!respuesta) throw '❌ لم يتم تلقي رد صالح من الذكاء الاصطناعي.'

    await m.reply(respuesta.trim())

  } catch (e) {
    console.error('[❌ Gemini Plugin Error]', e)
    await m.react('⚠️')
    await conn.reply(m.chat, '⚠️ حدث خطأ في معالجة الصورة أو السؤال. حاول مرة أخرى لاحقاً.', m)
  }
}

handler.command = ['gemini', 'geminis']
handler.help = ['gemini <سؤال>']
handler.tags = ['ai']
handler.group = false // ponlo en true si quieres que funcione también en grupos

export default handler
