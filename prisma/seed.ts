import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // --- Admin user (seeded from .env, bcrypt-hashed) ---------------------
  const username = process.env.ADMIN_USERNAME ?? "annvea";
  const password = process.env.ADMIN_PASSWORD ?? "changeme123";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash },
  });
  console.log(`✓ Admin user "${username}" ready`);

  // --- Site settings (singleton id=1) ----------------------------------
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  // --- Reset content tables so seeding is idempotent -------------------
  await prisma.navLink.deleteMany();
  await prisma.socialLink.deleteMany();
  await prisma.greeting.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.education.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.visitedCountry.deleteMany();
  await prisma.galleryImage.deleteMany();

  // --- Nav links --------------------------------------------------------
  await prisma.navLink.createMany({
    data: [
      { label: "Experience", href: "#experience", order: 0 },
      { label: "Skills", href: "#skills", order: 1 },
      { label: "Status", href: "#status", order: 2 },
      { label: "Nodes", href: "#nodes", order: 3 },
      { label: "Logs", href: "#logs", order: 4 },
    ],
  });

  // --- Social links -----------------------------------------------------
  await prisma.socialLink.createMany({
    data: [
      { label: "LinkedIn", href: "#", order: 0 },
      { label: "Dribbble", href: "#", order: 1 },
      { label: "Read.cv", href: "#", order: 2 },
      { label: "Email", href: "mailto:annvea@example.com", order: 3 },
    ],
  });

  // --- Greetings (language marquee, native scripts) --------------------
  await prisma.greeting.createMany({
    data: [
      "Hello", // English
      "你好", // Chinese
      "こんにちは", // Japanese
      "안녕하세요", // Korean
      "สวัสดี", // Thai
      "नमस्ते", // Hindi
      "নমস্কার", // Bengali
      "வணக்கம்", // Tamil
      "Bonjour", // French
      "Hola", // Spanish
      "Ciao", // Italian
      "Olá", // Portuguese
      "Hallo", // German
      "Hej", // Swedish
      "Cześć", // Polish
      "Здравствуйте", // Russian
      "Привіт", // Ukrainian
      "Γειά σου", // Greek
      "مرحبا", // Arabic
      "سلام", // Persian
      "שלום", // Hebrew
      "Merhaba", // Turkish
      "Xin chào", // Vietnamese
      "Halo", // Indonesian
      "Kumusta", // Filipino
      "Jambo", // Swahili
      "გამარჯობა", // Georgian
      "Բարև", // Armenian
    ].map((text, order) => ({ text, order })),
  });

  // --- Experience (Core Modules) ---------------------------------------
  await prisma.experience.createMany({
    data: [
      {
        icon: "terminal",
        badge: "Ongoing Research",
        title: "Global Tech Academy",
        description:
          "Advanced systems architecture and front-end optimization. Scaling nocturnal workspaces for a global, decentralized creative collective.",
        tags: ["Engineering", "Systems"],
        order: 0,
      },
    ],
  });

  // --- Education --------------------------------------------------------
  await prisma.education.createMany({
    data: [
      {
        icon: "compost",
        badge: "Class of 2022",
        title: "University of Coastal Magic",
        description:
          "Specializing in ethereal interface systems and fluid motion theories. My research focused on the emotional resonance of digital depth.",
        tags: ["UX Theory", "Fluidity"],
        order: 0,
      },
    ],
  });

  // --- Skills (Skill Architecture) -------------------------------------
  await prisma.skill.createMany({
    data: [
      { icon: "design_services", label: "UI/UX Design", order: 0 },
      { icon: "code", label: "Front-End", order: 1 },
      { icon: "hub", label: "Systems", order: 2 },
      { icon: "auto_videocam", label: "Motion", order: 3 },
    ],
  });

  // --- Visited countries (visited.json world map) ----------------------
  // `code` = world-atlas (countries-110m) numeric ISO 3166-1 feature id.
  await prisma.visitedCountry.createMany({
    data: [
      { code: "392", name: "Japan", order: 0 },
      { code: "764", name: "Thailand", order: 1 },
      { code: "156", name: "China", order: 2 },
      { code: "410", name: "South Korea", order: 3 },
      { code: "826", name: "United Kingdom", order: 4 },
      { code: "250", name: "France", order: 5 },
      { code: "380", name: "Italy", order: 6 },
      { code: "724", name: "Spain", order: 7 },
      { code: "840", name: "United States of America", order: 8 },
      { code: "036", name: "Australia", order: 9 },
    ],
  });

  // --- Gallery images (Visual Logs) ------------------------------------
  await prisma.galleryImage.createMany({
    data: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA-uaJ86kd0vpOwZ5Wu5nL4-76TvWmdiQdJTkbVAcPDk4pxloxpHuo495JvbW35G-7RtiTu5l9pHqIcGjWoBhGOOecn5tvvuvHCIeuxcJGuw1tEOjQhxq_2ZnCyKYVp3TqhMOE8tqHjn9wAcMqOQSthZh6UUq_sbTfksAf6UpGvTZ_0-Mfz2fKH1VMfyuFbIwEFo9DmqNDjsZDzxVDXogdcAP_KB6-yAIgPAUP4I3yZdflKhL2soYRY6vxL-zRiHGNKLCIY_n17NrkS",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAyVGkWYbTlGOR8YfxEF7wDzgW2jkYsHOYpoq2xjFlaku8zfRYpU9PyRUA2_oHGqalV4gcFR60JtHmTC2VueRd_oLzP7Yqd0mp2bIBtxlsocZRsAW_vRMzOYWG0yx-ABZcVnwvYlKDS7jMQ2NziAPBgT2npYqwpJge0Lsd8XhKHL76hkBXpOIwvVamqsPIw9hFduxQkagMBEgRVJr5qrQDivstbpeEaRQlCSh58p--firXivA5w6UIquSg8JGrj7TSh4dM3FLW_gL-2",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDPAKKKkLWFO-iiJ7lczugF19tIzYGGU0vXCFK5eA5PJMItR6kAn01tcdlgVCpUzAbxqiqMi82adGreXAJYt4yUWftfoT37VXcBgJdlnBmcqxq_hVJwpcxVJLsCRnSzQ_WkXnA7p8Z1oyPXXsmba5_39D4rMz82TEfckopjJQG1NowAzlzaUeBh1YAKtrPafuZm5s_fB6dkg3g2NbGZpzhJHzyp6cfaCZilDo4uJbjdeRCwWGb1tQFTjrODs9kMDp2Qq2VDcC11iBL7",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA0Yopuy5zxX5_zDYh9QL-y1L0ZX-ON4NnVQNypBKcO0Cz6RZsRR9LjZQaGbLr6JfrU5K_eFMzlC1gWFsBAH5Mno666lZpCSSemUQ707cyHTrcM9W0Y3Nk9hbefZB9dGJeu4asORHHNvbCkGzCVVPNPy1ejGgy7ZEGeDr0AY0WRpcHaa4rxdxbT5LdKMpC6wudstc8E-voxLhmPukaIRtMfHuSXPQWdFac965S5zx0yHJqbx2ycg6sQjCECNBl3lUjoCg0uQLsYVV7i",
    ].map((url, order) => ({ url, caption: `Visual Log ${order + 1}`, order })),
  });

  console.log("✓ Seeded all content sections");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
