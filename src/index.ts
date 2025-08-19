import dotenv from "dotenv";
import { Telegraf, Markup } from "telegraf";
import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";

import walletController from "./controllers/bot/walletController";
import adViewController from "./controllers/api/adViewContoller";
import getCoinsController from "./controllers/api/initController";

import CHANNEL_ID from "./channelID";
import verifyPurchase from "./controllers/bot/verifyPurchase";
import transactionsController from "./controllers/api/transactionsController";
import authController from "./controllers/api/authController";
import loginController from "./controllers/api/loginController";

dotenv.config();

// App server.
const app = express();

const corsOptions = {
  origin: "https://nuttyvibes-contents.netlify.app", // Replace with your frontend origin
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Allow cookies, authorization headers, etc.
};

// Enable CORS for all routes
app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use(cookieParser());

const bot = new Telegraf(process.env.BOT_TOKEN as string);

bot.start(async (ctx) => {
  try {
    await ctx.replyWithPhoto(
      { source: "./logo.jpg" },
      {
        caption: `Hello ${ctx.from.first_name}! Welcome to the <b>Nutt and Vibes</b> official <b>Telegram</b> bot. \n\nThis bot allows you to Get Coins 🪙 and View Contents 🎬 from nutt and vibes.\n\nUse the buttons below to get started.`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Open Wallet",
                url: "https://t.me/NuttyVibesBot/NuttyVibes",
              },
            ],
            [
              {
                text: "Enter Gallery",
                url: "https://nuttyvibescontent.netlify.app",
              },
            ],
            [
              {
                text: "Join Channel",
                url: "https://t.me/nuttandvibestelegram",
              },
            ],
          ],
        },
      }
    );
  } catch (error: any) {
    if (error.code === 403) {
      console.log(`User ${ctx.chat.id} has blocked the bot (during button).`);
    } else {
      console.error("Error sending inline button:", error);
    }
  }
});

bot.command("wallet", walletController);

bot.command("login", async (ctx) => {
  const res = await ctx.telegram.getChatMember(CHANNEL_ID, ctx.from.id);
  try {
    await ctx.replyWithHTML(
      `You can access Nutt and Vibes Contents by clicking the button below. \n\nNote: Whenever you get a <b>login expire</b>, request a new login by using the /login command. ${
        ["member", "administrator", "creator"].includes(res.status)
          ? ""
          : `\n\nJoin our channel for updates and support. <a href="https://t.me/nuttandvibestelegram">Join Channel</a>`
      }`,
      Markup.inlineKeyboard([
        Markup.button.login(
          "Enter Gallery",
          "https://api.nuttyvibes.com/auth",
          {
            request_write_access: true,
          }
        ),
      ])
    );
  } catch (error: any) {
    if (error.code === 403) {
      console.log(
        `User ${ctx.chat.id} has blocked the bot (during wallet command).`
      );
    } else {
      console.error("Error sending wallet photo:", error);
    }
  }
});

// --- Telegraf Payment Handler ---
bot.on("message", verifyPurchase);

// ... (Handle preCheckoutQuery and successful_payment updates from Telegram)

// Handle long polling in production
if (process.env.NODE_ENV !== "production") {
  // Handle bot in development mode
  bot.launch();
} else {
  // Prod: Use webhook attached to Express
  bot.telegram.setWebhook(`${process.env.PUBLIC_URL}/bot${bot.telegram.token}`);
}

app.post("/invoice-link", async (req: Request, res: Response) => {
  try {
    const { title, description, payload, amount } = req.body;
    const invoiceLink = await bot.telegram.createInvoiceLink({
      title,
      description,
      payload,
      provider_token: "",
      currency: "XTR",
      prices: [{ label: "Coins", amount }],
    });
    res.json({ invoiceLink });
  } catch (error) {
    console.error("Error generating invoice:", error);
    res.status(500).json({ error: "Failed to generate invoice" });
  }
});

app.post("/ad-view", adViewController);

// --- Get Coins ---
app.get("/get-coins/:uid", getCoinsController);

// --- Get Transactions ---
app.get("/transactions/:userId", transactionsController);

app.get("/auth", authController);

app.get("/user", loginController);

// Handle Telegram updates via webhook
app.use(bot.webhookCallback(`/bot${bot.telegram.token}`));

// Start express server
const PORT = process.env.PORT || 3000;
app.listen(PORT as number, "0.0.0.0", () => {
  console.log(`Listening on port ${PORT}`);
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
