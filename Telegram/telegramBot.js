// telegram/telegramBot.js
const axios = require('axios');
const dotenv = require('dotenv'); // Import dotenv
dotenv.config(); // Load environment variables

async function sendTelegramMessage(chatId, message) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN; // Retrieve bot token from environment variables
 console.log(botToken);
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const response = await axios.post(telegramApiUrl, {
      chat_id: chatId,
      text: message,
    });

    if (response.data.ok) {
      console.log(`Message sent to chat ${chatId}: ${message}`);
    } else {
      console.error(`Failed to send message to chat ${chatId}`);
    }
  } catch (error) {
    console.error('Error sending message to Telegram:', error);
  }
}

module.exports = {
  sendTelegramMessage,
};
