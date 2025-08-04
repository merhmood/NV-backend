import { Markup, Context } from "telegraf";
import CHANNEL_ID from "../../channelID";

const walletController = async (ctx: Context) => {
  console.log("Wallet command received from user:", ctx.from?.id);

  const res = await ctx.telegram.getChatMember(
    CHANNEL_ID,
    ctx.from?.id as number
  );
  try {
    await ctx.replyWithHTML(
      `Here is your wallet, ${
        ctx.from?.first_name
      }! \n\nYou can use this wallet to manage your coins and view your transactions. \n\nFor more information, please visit the official website. <a href="https://nuttyvibescontent.netlify.app/wallet">Nutt and Vibes Wallet Info</a> ${
        ["member", "administrator", "creator"].includes(res.status)
          ? ""
          : `\n\nJoin our channel for updates and support. <a href="https://t.me/nuttandvibestelegram">Join Channel</a>`
      }`,
      Markup.inlineKeyboard([
        Markup.button.url(
          "Open Wallet",
          "https://t.me/NuttyVibesBot/NuttyVibes"
        ),
      ])
    );
  } catch (error: any) {
    if (error.code === 403) {
      console.log(
        `User ${ctx.chat?.id} has blocked the bot (during wallet command).`
      );
    } else {
      console.error("Error sending wallet photo:", error);
    }
  }
};

export default walletController;
