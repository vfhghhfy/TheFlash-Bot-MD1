import uploadFile from '../lib/uploadFile.js';
import uploadImage from '../lib/uploadImage.js';
import fetch from 'node-fetch';
import FormData from 'form-data';

let handler = async (m) => {
  try {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!mime) throw '*يرجى الرد على صورة أو فيديو لرفعه.*';
    if (!/image\/(png|jpe?g|gif)|video\/mp4/.test(mime)) {
      throw '*الرجاء استخدام صورة (PNG/JPG/GIF) أو فيديو (MP4) فقط.*';
    }

    // تحميل الميديا
    let media = await q.download();
    let isImage = /image\/(png|jpe?g|gif)/.test(mime);
    let fileName = isImage ? 'image.jpg' : 'video.mp4';

    // تكوين الطلب لـ Catbox
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', media, fileName);

    // إرسال الطلب
    const response = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: form,
    });

    const result = await response.text();

    // التحقق من الاستجابة
    if (result.startsWith('https://')) {
      m.reply(`*❐═━━━═╊⊰🏯⊱╉═━━━═❐*
*❮🎩↜ تم رفع الملف بنجاح ❯*
*❮⛓‍💥↜رابط الملف┇ ${result}  ❯*
*❮📦↜حجم الملف┇ ${media.length} بايت ❯*
*❐═━━━═╊⊰🏯⊱╉═━━━═❐*
> *𝙱𝚈┇Mori-Dev* 🏯
`);
    } else {
      m.reply(`*حدث خطأ أثناء رفع الملف باستخدام Catbox API.*\n\n*استجابة الـ API:*\n${result}`);
    }
  } catch (error) {
    m.reply(`*❐═━━━═╊⊰🏯⊱╉═━━━═❐*
❮🏯خطاء┇ قم بي الرد علي الرسالة المراد رفعها علي موقع CatBox ❯
*❐═━━━═╊⊰🏯⊱╉═━━━═❐*
> *𝙱𝚈┇Mori-Dev*`);
    console.error('Error Details:', error);
  }
};

handler.help = ['catbox <reply image/video>'];
handler.tags = ['tools'];
handler.command = /^(catbox|تليجراف2)$/i;

export default handler;