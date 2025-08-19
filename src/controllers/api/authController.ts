import { Request, Response } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import BOT_TOKEN from "../../utils/BOT_TOKEN";
import JWT_SECRET from "../../utils/JWT_SECRET";

function checkTelegramAuth(data: any, BOT_TOKEN: string): boolean {
  const { hash, ...rest } = data;
  const dataCheckArr = Object.keys(rest)
    .sort()
    .map((k) => `${k}=${rest[k]}`)
    .join("\n");
  const secretKey = crypto.createHash("sha256").update(BOT_TOKEN).digest();
  const hmac = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckArr)
    .digest("hex");
  return hmac === hash;
}

const authController = (req: Request, res: Response) => {
  if (!checkTelegramAuth(req.query, BOT_TOKEN)) {
    return res.status(401).send("Unauthorized");
  }
  const user = {
    id: req.query.id,
    username: req.query.username,
    first_name: req.query.first_name,
  };

  // Create JWT for session
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });

  // Set as HTTP-only cookie
  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: true, // only over HTTPS
    sameSite: "none", // allow cross-site (because frontend is on Netlify)
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Redirect back to frontend
  res.redirect(`https://nuttyvibes-contents.netlify.app`);
};

export default authController;
