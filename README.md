# 💬 WhatsApp Bot

🚀 **Automate your WhatsApp communication with ease!**  
This Node.js-based WhatsApp Bot lets you send **bulk or personalized messages** directly from your computer — perfect for businesses, campaigns, or community managers.

---

## ✨ Features

✅ **Bulk Messaging:** Send messages to hundreds of contacts in seconds.  
✅ **Personalized Content:** Use templates to send unique messages to each recipient.  
✅ **Easy Setup:** Plug-and-play configuration using simple text files.  
✅ **Lightweight:** No heavy dependencies, minimal setup required.  
✅ **Custom Data Sources:** Send messages using data from `.txt` or `.json` files.  

---

## 🧱 Project Structure

| File | Description |
|------|--------------|
| `bot.js` | Main logic file — handles message sending and automation. |
| `config.js` | Configuration settings for the bot (session, messages, delay, etc.). |
| `phone_numbers.txt` | List of recipient phone numbers (one per line). |
| `message.txt` | Template message to be sent. |
| `business_data.json` | Optional — store personalized info for each contact. |
| `Commands Info.txt` | Reference for bot commands and usage. |

---

## ⚙️ Installation

Make sure you have **Node.js (v16+)** and **npm** installed.

```bash
# 1️⃣ Clone the repository
git clone https://github.com/WebGharOfficial/Whatsapp-Bot.git

# 2️⃣ Go into the project directory
cd Whatsapp-Bot

# 3️⃣ Install dependencies
npm install
