import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';

const timeout = 60000;

let handler = async (m, { conn, command }) => {
    if (!global.db.data.users[m.sender]) {
        global.db.data.users[m.sender] = { gold: 0 }; 
    }

    let user = global.db.data.users[m.sender];

    if (command.startsWith('answer_')) {
        let id = m.chat;
        let Mori = conn.Mori[id];

        if (!Mori) {
            return conn.reply(m.chat, `❌ *لَا يــوجــد اخــتــبــار نــشــط فــي الــوقــت الــحــالــي*`, m);
        }

        let selectedAnswerIndex = parseInt(command.split('_')[1]);
        if (isNaN(selectedAnswerIndex) || selectedAnswerIndex < 1 || selectedAnswerIndex > 4) {
            return conn.reply(m.chat, `❌ *اخــتــيــار غــيــر صــالــح.*`, m);
        }

        let selectedAnswer = Mori.options[selectedAnswerIndex - 1];
        let isCorrect = Mori.correctAnswer === selectedAnswer;

        if (isCorrect) {
            let reward = 2000;
            user.exp += reward;
            await conn.reply(m.chat, `✅ *إجــابــة صــحــيــحــة! ربحــت ${reward} مــن XP!📍*`, m);
            clearTimeout(Mori.timer);
            delete conn.Mori[id];
        } else {
            Mori.attempts -= 1;
            if (Mori.attempts > 0) {
                await conn.reply(m.chat, `❌ *إجــابــة خــاطــئــة. تــبــقــى ${Mori.attempts} مــحــاولات.*`, m);
            } else {
                await conn.reply(m.chat, `❌ *انــتــهــت الــمــحــاولات. الــإجــابــة الــصــحــيــحــة هــي:* ${Mori.correctAnswer}`, m);
                clearTimeout(Mori.timer);
                delete conn.Mori[id];
            }
        }
    } else {
        try {
            conn.Mori = conn.Mori || {};
            let id = m.chat;

            if (conn.Mori[id]) {
                return conn.reply(m.chat, `⌛ *لَا يــمــكــنــك بــدء اخــتــبــار جــديــد حــتــى تــنــتــهــي مــن الاخــتــبــار الــحــالــي.*`, m);
            }

            const response = await fetch('https://raw.githubusercontent.com/DK3MK/worker-bot/main/eye.json');
            const MoriData = await response.json();

            if (!MoriData) {
                throw new Error('فشل في الحصول على بيانات الاختبار.');
            }

            const MoriItem = MoriData[Math.floor(Math.random() * MoriData.length)];
            const { img, name } = MoriItem;

            let options = [name];
            while (options.length < 4) {
                let randomItem = MoriData[Math.floor(Math.random() * MoriData.length)].name;
                if (!options.includes(randomItem)) {
                    options.push(randomItem);
                }
            }
            options.sort(() => Math.random() - 0.5);

            const media = await prepareWAMessageMedia({ image: { url: img } }, { upload: conn.waUploadToServer });

            const interactiveMessage = {
                body: {
                    text: ` *┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅╮*
*❐↞┇الـوقـت⏳↞ ${(timeout / 1000).toFixed(2)} ثـانـيـة┇❯*
*❐↞┇الـجـائـزة💰↞ 2000 XP┇❯* 
*┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅╯*

⚡ *قـم بـاخـتـيـار زر الإجـابـة!* ⚡  
🏦 *إسـتـخـدم [ .لــفــل ] لـلإطـلاع عـلـى مــســتــواك*`,
                },
                footer: { text: 'اخــتــر الــإجــابــة الــصــحــيــحــة:' },
                header: {
                    title: 'مــرحــبــا',
                    subtitle: 'اخــتــر أحــد الــخــيــارات أدنــاه:',
                    hasMediaAttachment: true,
                    imageMessage: media.imageMessage,
                },
                nativeFlowMessage: {
                    buttons: options.map((option, index) => ({
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: `『${index + 1}┇${option}┇』`,
                            id: `.answer_${index + 1}`
                        })
                    })),
                },
            };

            let msg = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: {
                    message: { interactiveMessage },
                },
            }, { userJid: conn.user.jid, quoted: m });

            conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

            conn.Mori[id] = {
                correctAnswer: name,
                options: options,
                timer: setTimeout(() => delete conn.Mori[id], timeout),
                attempts: 2
            };

        } catch (e) {
            console.error(e);
            conn.reply(m.chat, `❌ *حــدث خــطــأ فــي إرــســال الــرســالــة.*`, m);
        }
    }
};

handler.command = /^(عين|answer_\d+)$/i;

export default handler;