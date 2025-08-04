import { Request, Response } from "express";
import db from "../../model/firebase";
import dayjs from "dayjs";

const COINS_PER_AD = 10; // 🔹 Now 10 coins per ad

const adViewController = async (req: Request, res: Response) => {
  const { uid }: { uid: number } = req.body;
  if (!uid) return res.status(400).json({ error: "Missing uid" });

  const today = dayjs().format("YYYY-MM-DD");
  try {
    const adRef = db.collection("adViews").doc(uid.toString());
    const coinRef = db.collection("coinBalances").doc(uid.toString());

    const adSnap = await adRef.get();
    let views = 0;
    if (adSnap.exists && adSnap.data().date === today) {
      views = adSnap.data().count || 0;
    }

    if (views >= 10) {
      return res.json({
        allowed: false,
        totalViews: views,
        reason: "Daily limit reached",
      });
    }

    // Update ad views
    await adRef.set({ count: views + 1, date: today });

    // Update coins
    const coinSnap = await coinRef.get();
    let currentCoins = coinSnap.exists ? coinSnap.data().balance || 0 : 0;
    const newBalance = currentCoins + COINS_PER_AD;
    await coinRef.set({ balance: newBalance });

    // Update transactions
    await db.collection("transactions").add({
      userId: String(uid),
      type: "ad_reward",
      amount: 10,
      description: "Earned from watching an ad",
      date: new Date().toISOString(),
    });

    res.json({
      allowed: true,
      totalViews: views + 1,
      coins: newBalance,
    });
  } catch (err) {
    console.error("Error in adViewController:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default adViewController;
