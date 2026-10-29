import { describe, it, expect } from "bun:test";
import { hashPassword, verifyPassword } from "../utils/hash.ts";
import { AuthService } from "../services/auth.service.ts";

describe("1. Pengujian Autentikasi & Keamanan", () => {
  it("harus berhasil meng-hash password dan memverifikasinya", async () => {
    const rawPassword = "rahasiaNegara123";
    const hash = await hashPassword(rawPassword);

    expect(hash).not.toBe(rawPassword);
    const isValid = await verifyPassword(rawPassword, hash);
    expect(isValid).toBe(true);

    const isWrongValid = await verifyPassword("salahPassword", hash);
    expect(isWrongValid).toBe(false);
  });

  it("harus menolak login jika email tidak terdaftar", async () => {
    expect(
      AuthService.login("email_ngawur_tidak_ada@gmail.com", "password123")
    ).rejects.toThrow("Email atau password salah");
  });

  it("harus berhasil login menggunakan akun demo", async () => {
    const result = await AuthService.login("admin@eventify.com", "password123");
    expect(result.user).toBeDefined();
    expect(result.user.role).toBe("ADMIN");
    expect(result.token).toBeDefined();
  });
});
