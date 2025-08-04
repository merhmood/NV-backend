import { Request, Response } from "express";
import db from "../../model/firebase";

const transactionsController = async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    const snapshot = await db
      .collection("transactions")
      .where("userId", "==", String(userId))
      .orderBy("date", "desc")
      .limit(50)
      .get();

    const transactions = snapshot.docs.map((doc) => doc.data());
    res.json({ transactions });
  } catch (err) {
    console.error("Error getting transactions:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default transactionsController;
