import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const jimp_1 = require('jimp');

let handler = async (m, { conn, command, usedPrefix }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg ? q.msg : q).mimetype ? q.mimetype : q.mediaType || '';

  if (/image/g.test(mime) && !/webp/g.test(mime)) {
    try {
      let media = await q.download();
      let botNumber = await conn.user.jid;
      let { img } = await pepe(media);

      // تغيير صورة البروفايل
      await conn.query({
        tag: 'iq',
        attrs: {
          to: "@s.whatsapp.net",
          type: 'set',
          xmlns: 'w:profile:picture'
        },
        content: [
          {
            tag: 'picture',
            attrs: { type: 'image' },
            content: img
          }
        ]
      });

      // إرسال رسالة مزخرفة مع أزرار
      const buttons = [
        { buttonId: `${usedPrefix}حطها_بروفايل`, buttonText: { displayText: 'تغيير البروفايل مرة أخرى' }, type: 1 },
        { buttonId: `${usedPrefix}مساعدة`, buttonText: { displayText: 'مساعدة' }, type: 1 }
      ];

      const buttonMessage = {
        text: `*🎉 تم تغيير صورة البروفايل بنجاح!*\n\n*يمكنك الضغط على الأزرار أدناه للتفاعل:*`,
        footer: '© MysticBot',
        buttons: buttons,
        headerType: 1
      };

      await conn.sendMessage(m.chat, buttonMessage, { quoted: m });
    } catch (e) {
      console.log(e);
      m.reply('حدثحاول مرة أخرى لاحقًا');
    }
  } else {
    // إرسال رسالة توجيهية مع أزرار
    const buttons = [
      { buttonId: `${usedPrefix}مساعدة`, buttonText: { displayText: 'مساعدة' }, type: 1 }
    ];

    const buttonMessage = {
      text: `*📸 أرسل ا مع التسمية التوضيحية ${usedPrefix + command}*\n*أو قم بالاشارة للصورة التي تريد وضعها كبروفايل البوت*\n\n*يمكنك الضغط على الزر أدناه للحصول على المساعدة:*`,
      footer: '© MysticBot',
      buttons: buttons,
      headerType: 1
    };

    await conn.sendMessage(m.chat, buttonMessage, { quoted: m });
  }
};

handler.help = ['حطها_بروفايل'];
handler.tags = ['owner'];
handler.command = /^(حطها_بروفايل)$/i;
handler.rowner = true;

export default handler;

async function pepe(media) {
  const jimp = require('jimp');
  const image = await jimp.read(media);
  const min = image.getWidth();
  const max = image.getHeight();
  const cropped = image.crop(0, 0, min, max);
  return {
    img: await cropped.scaleToFit(720, 720).getBufferAsync(jimp.MIME_JPEG),
    preview: await cropped.normalize().getBufferAsync(jimp.MIME_JPEG)
  };
}
