import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import JWT_SECRET from "../../utils/JWT_SECRET";

const loginController = (req: Request, res: Response) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ error: "Not logged in" });

  try {
    const user = jwt.verify(token, JWT_SECRET) as JwtPayload;
    res.status(200).json({ id: user.id });
  } catch {
    res.status(401).json({ error: "Session expired" });
  }
};

export default loginController;
