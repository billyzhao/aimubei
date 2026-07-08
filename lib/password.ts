import bcrypt from "bcryptjs";

// 纪念馆访问密码哈希（bcrypt，与用户登录密码同源）
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
