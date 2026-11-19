CREATE TABLE "Session" (
  "id" TEXT NOT NULL,
  "shop" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "isOnline" BOOLEAN NOT NULL DEFAULT false,
  "scope" TEXT,
  "expires" TIMESTAMP(3),
  "accessToken" TEXT NOT NULL,
  "userId" BIGINT,
  "firstName" TEXT,
  "lastName" TEXT,
  "email" TEXT,
  "accountOwner" BOOLEAN NOT NULL DEFAULT false,
  "locale" TEXT,
  "collaborator" BOOLEAN DEFAULT false,
  "emailVerified" BOOLEAN DEFAULT false,
  "refreshToken" TEXT,
  "refreshTokenExpires" TIMESTAMP(3),
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Session_expires_idx" ON "Session"("expires");
CREATE INDEX "Session_refreshTokenExpires_idx" ON "Session"("refreshTokenExpires");

CREATE TABLE "StoreConnectionCheck" (
  "shop" TEXT NOT NULL,
  "storeName" TEXT NOT NULL,
  "myshopifyDomain" TEXT NOT NULL,
  "apiVersion" TEXT NOT NULL,
  "lastAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSuccessfulAt" TIMESTAMP(3),
  "lastError" TEXT,
  CONSTRAINT "StoreConnectionCheck_pkey" PRIMARY KEY ("shop")
);

CREATE TABLE "RateLimitBucket" (
  "shop" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "windowStartedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "requestCount" INTEGER NOT NULL DEFAULT 0,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("shop", "action")
);

CREATE INDEX "RateLimitBucket_expiresAt_idx" ON "RateLimitBucket"("expiresAt");
