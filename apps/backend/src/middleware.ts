import { NextFunction, Request, Response } from "express";
import { clerkClient, getAuth } from "@clerk/express";
import { verifyToken } from "@clerk/backend";
import { UserModel } from "@mysecondbrain/db";

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
      let clerkUserId = auth.userId ?? null;

      if (!clerkUserId) {
        const authorizationHeader = req.header("authorization") || req.header("Authorization");
        const bearerToken = authorizationHeader?.startsWith("Bearer ")
          ? authorizationHeader.slice("Bearer ".length).trim()
          : null;

        if (!bearerToken) {
          return res.status(401).json({ message: "Missing or invalid Clerk session" });
        }

        const verifiedToken = await verifyToken(bearerToken, {
          secretKey: process.env.CLERK_SECRET_KEY,
          jwtKey: process.env.CLERK_JWT_KEY,
          clockSkewInMs: 15000,
        });

        clerkUserId = typeof verifiedToken.sub === "string" ? verifiedToken.sub : null;
      }

      if (!clerkUserId) {
        return res.status(401).json({ message: "Missing or invalid Clerk session" });
      }

      const clerkUser = await clerkClient.users.getUser(clerkUserId);
      const email = getPrimaryEmail(clerkUser);

      if (!email) {
        return res.status(400).json({ message: "No email found for Clerk user" });
      }

      const preferredUsername =
        getPreferredUsername(clerkUser) ||
        email.split("@")[0] ||
        `user${clerkUserId.slice(-6)}`;

      let appUser =
        await UserModel.findOne({ clerkId: clerkUserId }) ||
        await UserModel.findOne({ email });

      if (!appUser) {
        const username = await buildUniqueUsername(preferredUsername, clerkUserId);
        appUser = await UserModel.create({
          clerkId: clerkUserId,
          username,
          email,
          password: undefined,
          isUpgraded: false,
          currentPlan: "Starter",
          billingCycle: "yearly",
        });
      } else {
        let hasChanges = false;

        if (appUser.clerkId !== clerkUserId) {
          (appUser as any).clerkId = clerkUserId;
          hasChanges = true;
        }

        if (appUser.email !== email) {
          appUser.email = email;
          hasChanges = true;
        }

        if (!appUser.username) {
          appUser.username = await buildUniqueUsername(preferredUsername, clerkUserId);
          hasChanges = true;
        }

        if (hasChanges) {
          await appUser.save();
        }
      }

      req.userId = appUser._id.toString();
      req.clerkUserId = clerkUserId;

      return next();
    } catch (err) {
      console.error("Clerk auth failed:", err);
      return res.status(403).json({ message: "Invalid or expired token" });
    }
  })();
};
