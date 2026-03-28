const handleStart = (bot, msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'User';

  const welcomeMessage = `
🚀 *مرحباً بك في VEXO Follow Bot!* 🚀
Welcome to VEXO Follow Bot!

أهلاً ${firstName}! 👋

🤖 أنا مساعدك الشخصي لخدمات التسويق عبر وسائل التواصل الاجتماعي (SMM). يمكنني مساعدتك في تنمية حضورك على منصات التواصل الاجتماعي بمتابعين حقيقيين وإعجابات وتفاعل.

I'm your personal SMM assistant for growing your social media presence with real followers, likes, and engagement.

📌 *الأوامر المتاحة | Available Commands:*
/packages — 📦 استعراض الباقات | Browse packages
/order — 🛒 تقديم طلب جديد | Place an order
/orders — 📋 متابعة الطلبات | Track orders
/balance — 💰 الرصيد | Check balance
/help — ❓ المساعدة | Help & support

💎 *VEXO Follow Bot* — شريكك في النمو | Your growth partner!
`;

  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '📦 الباقات | Packages', callback_data: 'packages' },
          { text: '🛒 طلب جديد | New Order', callback_data: 'order' },
        ],
        [
          { text: '💰 الرصيد | Balance', callback_data: 'balance' },
          { text: '📋 طلباتي | My Orders', callback_data: 'orders' },
        ],
        [{ text: '❓ المساعدة | Help', callback_data: 'help' }],
      ],
    },
  };

  bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown', ...keyboard });
};

module.exports = handleStart;
