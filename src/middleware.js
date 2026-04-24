// src/middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
    // 1. Ambil token/session user dari cookies
    const token = request.cookies.get('token')?.value;

    // Asumsi: Kamu punya cara untuk decode token atau cek role.
    // Misalnya user disimpan di cookie, atau kamu panggil fungsi ringan
    const userRole = token ? JSON.parse(atob(token.split('.')[1])).role : 'GUEST';

    const url = request.nextUrl.pathname;

    // 2. Proteksi rute /admin/* hanya untuk ADMIN
    if (url.startsWith('/admin') && userRole !== 'ADMIN') {
        // Langsung tendang ke halaman utama
        return NextResponse.redirect(new URL('/', request.url));
    }

    // 3. Proteksi rute kasir untuk KASIR/ADMIN
    if (url.startsWith('/penjaga') && userRole !== 'PENJAGA') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

// Tentukan route mana saja yang mau diawasi middleware ini
export const config = {
    matcher: ['/admin/:path*', '/penjaga/:path*'],
};