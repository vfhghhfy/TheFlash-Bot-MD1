import fs from 'fs'
import jimp from 'jimp'

let handler = async (m, { conn, command, usedPrefix }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg ? q.msg : q).mimetype || ''
  if (/image/g.test(mime) && !/webp/g.test(mime)) {
    try {
      let media = await q.download()
      let botNumber = conn.user.jid
      let { img } = await pepe(media)
      await conn.updateProfilePicture(botNumber, img) // استخدام الدالة المدمجة
      m.reply('✅ تم تغيير صورة البروفايل بنجاح!')
    } catch (e) {
      console.error(e)
      m.reply('❌ فشل التحديث، تأكد من الصورة وحاول لاحقًا.')
    }
  } else {
    m.reply(`⚠️ أرسل صورة مع التسمية: ${usedPrefix + command}`)
  }
}

handler.help = ['setpp']
handler.tags = ['owner']
handler.command = /^(تغير)$/i
handler.owner = true

export default handler

async function pepe(media) {
  const image = await jimp.read(media)
  const cropped = image.crop(0, 0, image.bitmap.width, image.bitmap.height)
  return {
    img: await cropped.scaleToFit(720, 720).getBufferAsync(jimp.MIME_JPEG)
  }
}
