import { Request, Response } from "express";
import db from "../../model/firebase";

const userCoinsontroller = async (req: Request, res: Response) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ error: "Not logged in" });

  try {
    const { uid } = req.params;

    const coinRef = db.collection("coinBalances").doc(uid.toString());
    const coinSnap = await coinRef.get();

    res.json({
      coinsBalance: coinSnap.exists ? coinSnap.data().balance || 0 : 0,
    });
  } catch {
    res.status(401).json({ error: "Session expired" });
  }
};

export default userCoinsontroller;
