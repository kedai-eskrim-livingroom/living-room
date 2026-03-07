const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Matikan PWA saat dev agar tidak mengganggu proses ngoding
  register: true,
  skipWaiting: true,
});
/** @type {import('next').NextConfig} */

const nextConfig = {
  /* config options here */
};

export default withPWA(nextConfig);
