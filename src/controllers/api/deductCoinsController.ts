import { Request, Response } from "express";
import db from "../../model/firebase";

const deductCoinsontroller = async (req: Request, res: Response) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ error: "Not logged in" });

  try {
    const { uid, coins } = req.body;

    if (!uid) return res.status(400).json({ error: "Missing uid" });

    // Update coins
    const coinRef = db.collection("coinBalances").doc(uid.toString());
    const coinSnap = await coinRef.get();
    let currentCoins = coinSnap.exists ? coinSnap.data().balance || 0 : 0;
    const newBalance = currentCoins - coins;
    await coinRef.set({ balance: newBalance });

    res.json({
      coinsBalance: newBalance,
    });
  } catch {
    res.status(401).json({ error: "Session expired" });
  }
};

export default deductCoinsontroller;
