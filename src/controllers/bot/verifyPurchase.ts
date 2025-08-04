import { Context } from "telegraf";
import db from "../../model/firebase";

const verifyPurchase = async (ctx: Context) => {
  if ("successful_payment" in ctx.message) {
    const payment = ctx.message.successful_payment!; // Now it's safe
    const payloadParts = payment.invoice_payload.split("_");

    if (payloadParts[0] === "buy" && payloadParts[1] === "coins") {
      const uid = payloadParts[2];
      const coinsToAdd = parseInt(payloadParts[3], 10);

      const coinRef = db.collection("coinBalances").doc(uid);
      const coinSnap = await coinRef.get();
      const currentCoins = coinSnap.exists ? coinSnap.data().balance || 0 : 0;
      const newBalance = currentCoins + coinsToAdd;

      // Update transactions
      await db.collection("transactions").add({
        userId: String(uid),
        type: "coin_sale",
        amount: coinsToAdd,
        description: "Purchase of coins",
        date: new Date().toISOString(),
      });

      await coinRef.set({ balance: newBalance });
      console.log(
        `✅ Added ${coinsToAdd} coins to ${uid}. New balance: ${newBalance}`
      );
      await ctx.reply(
        `✅ Your purchase of ${coinsToAdd} coins was successful! 🎉`
      );
    }
  }
};

export default verifyPurchase;
