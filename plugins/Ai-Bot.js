import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const jimp = require('jimp');

let handler = async (m, { conn, command, usedPrefix }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg ? q.msg : q).mimetype ? q.mimetype : q.mediaType || '';
    if (/image/g.test(mime) && !/webp/g.test(mime)) {
        try {
            let media = await q.download();
            if (!media) {
                return m.reply('فشل في تنزيل الصورة.');
            }
            let botNumber = await conn.user.jid;
            let { img } = await pepe(media);
            await conn.query({
                tag: 'iq',
                attrs: {
                    to: botNumber,
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
            m.reply('*تم وضع الصورة كبروفايل بنجاح*');
        } catch (e) {
            console.error(e);
            m.reply('حدث خطأ أثناء معالجة الصورة. يرجى المحاولة مرة أخرى.');
        }
    } else {
        m.reply(`*أرسل الصورة مع التسمية التوضيحية ${usedPrefix + command}* \n*أو قم  بالاشارة  للصورة التي تريد وضعها كبروفايل البوت*`);
    }
};

handler.help = ['حطها_بروفايل'];
handler.tags = ['owner'];
handler.command = /^(حطها_بروفايل)$/i;

handler.rowner = true;

export default handler;

async function pepe(media) {
    try {
        const image = await jimp.read(media);
        // إزالة قيود الحجم
        return {
            img: await image.getBufferAsync(jimp.MIME_JPEG),
            preview: await image.normalize().getBufferAsync(jimp.MIME_JPEG)
        };
    } catch (error) {
        console.error('Error in pepe function:', error);
        throw error;
    }
}
