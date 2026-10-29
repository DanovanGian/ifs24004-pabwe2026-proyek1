import { describe, it, expect, beforeAll } from "bun:test";
import { TicketService } from "../services/ticket.service.ts";
import { prisma } from "../data/db.ts";

describe("2. Pengujian Transaksi Tiket & QR Check-In", () => {
  let testUser: any;
  let testEvent: any;
  let testTicketType: any;
  let issuedQrToken: string;

  beforeAll(async () => {
    // Ambil data referensi dari database SQLite
    testUser = await prisma.user.findFirst({ where: { role: "PARTICIPANT" } });
    testEvent = await prisma.event.findFirst({ include: { ticketTypes: true } });
    testTicketType = testEvent.ticketTypes[0];
  });

  it("harus berhasil memesan tiket dan membuat registrasi PENDING", async () => {
    const result = await TicketService.createRegistration(
      testUser.id,
      testEvent.id,
      testTicketType.id,
      1
    );

    expect(result.registration.status).toBe("PENDING");
    expect(result.registration.totalPrice).toBe(testTicketType.price);
  });

  it("harus memotong kuota dan menerbitkan QR token saat pembayaran sukses", async () => {
    // 1. Buat registrasi
    const regRes = await TicketService.createRegistration(
      testUser.id,
      testEvent.id,
      testTicketType.id,
      1
    );

    // 2. Simulasi bayar
    const payRes = await TicketService.simulatePayment(regRes.registration.id, testUser.id);
    expect(payRes.registration.status).toBe("PAID");
    expect(payRes.tickets.length).toBe(1);

    // Simpan QR token untuk tes check-in
    issuedQrToken = payRes.tickets[0].qrToken;
    expect(issuedQrToken).toStartWith("tkn_");
  });

  it("harus berhasil melakukan Check-in pertama kali", async () => {
    const checkInResult = await TicketService.checkIn(issuedQrToken);
    expect(checkInResult.message).toContain("Check-in berhasil");
  });

  it("HARUS MENOLAK jika tiket yang sama di-check-in untuk KEDUA KALINYA", async () => {
    // Check-in ulang dengan token yang sama persis
    expect(TicketService.checkIn(issuedQrToken)).rejects.toThrow("TIKET SUDAH DIGUNAKAN");
  });
});
