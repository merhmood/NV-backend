import { Request, Response } from "express";
import db from "../../model/firebase";

// --- Get Client ads views and coins balance ---
const initController = async (req: Request, res: Response) => {
  const { uid } = req.params;
  const coinRef = db.collection("coinBalances").doc(uid.toString());
  const adRef = db.collection("adViews").doc(uid.toString());
  const coinSnap = await coinRef.get();
  const adSnap = await adRef.get();
  res.json({
    balance: coinSnap.exists ? coinSnap.data().balance || 0 : 0,
    view: adSnap.exists ? adSnap.data().count || 0 : 0,
  });
};

export default initController;
