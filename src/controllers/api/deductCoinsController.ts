import { Request, Response } from "express";
import db from "../../model/firebase";

const deductCoinsController = async (req: Request, res: Response) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ error: "Not logged in" });

  try {
    const { uid, coins } = req.body;

    if (!uid) return res.status(400).json({ error: "Missing uid" });
    if (!coins || isNaN(coins)) {
      return res.status(400).json({ error: "Invalid coins value" });
    }

    const coinRef = db.collection("coinBalances").doc(uid.toString());
    const coinSnap = await coinRef.get();

    let currentCoins = coinSnap.exists ? coinSnap.data()?.balance || 0 : 0;
    const deduction = Number(coins);

    if (deduction <= 0) {
      return res.status(400).json({ error: "Deduction must be positive" });
    }
    if (currentCoins < deduction) {
      return res.status(400).json({ error: "Not enough balance" });
    }

    const newBalance = currentCoins - deduction;

    await coinRef.set({ balance: newBalance }, { merge: true });

    res.json({
      success: true,
      coinsBalance: newBalance,
    });
  } catch (err) {
    console.error("Error deducting coins:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export default deductCoinsController;
