import { PrismaClient } from "@prisma/client";

// PrismaClientのグローバルインスタンスを管理
// 開発環境での複数インスタンス生成防止のため
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

// 既存のインスタンスを使用するか、新しいインスタンスを作成
export const db = globalForPrisma.prisma ?? new PrismaClient();

// 開発環境（非本番環境）ではグローバル変数にインスタンスを保存
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
} 