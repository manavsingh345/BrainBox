import { NextFunction, Request, Response } from "express";
import { clerkClient, getAuth } from "@clerk/express";
import { UserModel } from "./models/db.js";

const getPrimaryEmail = (user: Awaited<ReturnType<typeof clerkClient.users.getUser>>) => {
  const primaryEmail = user.emailAddresses.find(
    (email) => email.id === user.primaryEmailAddressId
  );

  return primaryEmail?.emailAddress || user.emailAddresses[0]?.emailAddress || null;
};

const getPreferredUsername = (user: Awaited<ReturnType<typeof clerkClient.users.getUser>>) => {
  return (
    user.username ||
    [user.firstName, user.lastName].filter(Boolean).join("") ||
    user.firstName ||
    user.lastName ||
    null
  );
};

const sanitizeUsername = (value: string) => {
  const cleaned = value.toLowerCase().replace(/[^a-z0-9_]/g, "");
  return cleaned || "user";
};

const buildUniqueUsername = async (base: string, clerkUserId: string) => {
  const normalizedBase = sanitizeUsername(base).slice(0, 16);
  let candidate = normalizedBase;
  let suffix = 0;

  while (await UserModel.exists({ username: candidate, clerkId: { $ne: clerkUserId } })) {
    suffix += 1;
    const nextSuffix = `${suffix}`;
    const trimmedBase = normalizedBase.slice(0, Math.max(3, 20 - nextSuffix.length));
    candidate = `${trimmedBase}${nextSuffix}`;
  }

  return candidate;
};

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  void (async () => {
    try {
      const auth = getAuth(req);

      if (!auth.userId) {
        return res.status(401).json({ message: "Missing or invalid Clerk session" });
      }

      const clerkUser = await clerkClient.users.getUser(auth.userId);
      const email = getPrimaryEmail(clerkUser);

      if (!email) {
        return res.status(400).json({ message: "No email found for Clerk user" });
      }

      const preferredUsername =
        getPreferredUsername(clerkUser) ||
        email.split("@")[0] ||
        `user${auth.userId.slice(-6)}`;

      let appUser =
        await UserModel.findOne({ clerkId: auth.userId }) ||
        await UserModel.findOne({ email });

      if (!appUser) {
        const username = await buildUniqueUsername(preferredUsername, auth.userId);
        appUser = await UserModel.create({
          clerkId: auth.userId,
          username,
          email,
          password: undefined,
          isUpgraded: false,
          currentPlan: "Starter",
          billingCycle: "yearly",
        });
      } else {
        let hasChanges = false;

        if (appUser.clerkId !== auth.userId) {
          (appUser as any).clerkId = auth.userId;
          hasChanges = true;
        }

        if (appUser.email !== email) {
          appUser.email = email;
          hasChanges = true;
        }

        if (!appUser.username) {
          appUser.username = await buildUniqueUsername(preferredUsername, auth.userId);
          hasChanges = true;
        }

        if (hasChanges) {
          await appUser.save();
        }
      }

      req.userId = appUser._id.toString();
      req.clerkUserId = auth.userId;

      return next();
    } catch (err) {
      console.error("Clerk auth failed:", err);
      return res.status(403).json({ message: "Invalid or expired token" });
    }
  })();
};
