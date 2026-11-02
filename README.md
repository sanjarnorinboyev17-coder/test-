# BilimArena

Kahoot uslubidagi test-bellashuv platformasi. MVP Next.js App Router, TypeScript, Tailwind, Prisma va PostgreSQL asosida boshlanadi.

## 1. Papkalar tuzilmasi

```text
bilim-arena/
├── app/                         # Next.js App Router sahifalari va API route'lar
│   ├── (auth)/                  # Kirish va ro‘yxatdan o‘tish
│   ├── (teacher)/               # Ustoz paneli, testlar, bellashuvlar
│   ├── (student)/               # O‘quvchi kabineti va reyting
│   ├── admin/                   # Admin paneli
│   ├── join/[code]/             # Kod orqali bellashuvga qo‘shilish
│   └── api/                     # REST API: auth, tests, contests, admin
├── components/                  # Umumiy UI va forma komponentlari
├── features/                    # Auth, tests, contests, game, leaderboard modullari
├── lib/                         # Prisma client, auth, validatsiya, yordamchilar
├── prisma/                      # Schema, migratsiyalar va seed
├── server/                      # Next.js bilan birga ishlaydigan Socket.io server
├── bot/                         # grammY bot va webhook
├── public/                      # PWA manifest, ikonlar va statik fayllar
├── capacitor/                   # Android wrapper sozlamalari
├── docs/                        # Arxitektura, xavfsizlik va deploy hujjatlari
└── tests/                       # Parser, API va o‘yin oqimi testlari
```

## 2. Modullar

- **Auth va rollar:** username/parol, ADMIN/TEACHER/STUDENT, httpOnly sessiya cookie; admin rolini faqat admin beradi.
- **Test kutubxonasi:** `.txt`, `.docx`, `.xlsx` parseri, xato qator ko‘rsatish, preview/tahrirlash, qo‘lda savol kiritish va testlarni nusxalash.
- **Bellashuv boshqaruvi:** test tanlash, sozlamalar, noyob 6 xonali kod, havola va QR, lobby.
- **O‘yin dvigateli:** server boshqaradigan vaqt, savol tarqatish, javob qabul qilish, natija va Socket.io qayta ulanishi.
- **XP va reyting:** ball yozuvi, global/haftalik/oylik jadval, titul chegaralari va profil tarixi.
- **Admin:** foydalanuvchi/rol/bloklash, parolni almashtirish, titul va kontent boshqaruvi, audit log.
- **Telegram:** ustoz hisobini bog‘lash, test yuklash, bellashuv yaratish va holatni boshqarish.
- **Mobil/PWA:** responsive web, PWA, Capacitor Android, deep link va QR skaner.

## 3. Real-time o‘yin oqimi

1. Ustoz test va sozlamalarni tanlab bellashuv yaratadi. Server `Contest` hamda tasodifiy, takrorlanmaydigan kodni saqlaydi.
2. Ustoz lobbyda QR/havola/kodni ulashadi. O‘quvchi kod bilan kiradi, nik tanlaydi; server shu bellashuv ichida nik takrorlanmasligini tekshiradi.
3. Ustoz boshlaganda Socket.io serveri bellashuvni `RUNNING` qiladi va savolni jo‘natadi. Savol yuboriladigan payload'da `correctIndex` bo‘lmaydi.
4. Taymer serverda ishlaydi. `answer:submit` foydalanuvchi/bellashuv holati, savol tartibi va takroriy javobni tekshiradi; vaqt va XP server tomonidan hisoblanadi.
5. Vaqt tugaganda server javobni yopadi, to‘g‘ri javobni va yangilangan reytingni tarqatadi, keyingi savolga o‘tadi.
6. Oxirgi savoldan so‘ng natijalar tranzaksiya bilan saqlanadi, login qilgan o‘quvchilarning XPsi yangilanadi va bellashuv `FINISHED` bo‘ladi.

## 4. Asosiy xavfsizlik risklari va himoya

- **Parol o‘g‘irlanishi:** bcrypt hash, parolni loglamaslik, TLS, admin uchun audit log va kuchli sessiya cookie sozlamalari.
- **Brute force va kodni taxmin qilish:** login/join endpointlariga IP va username bo‘yicha rate limit; kod uchun urinish chegarasi va vaqtinchalik blok.
- **Ruxsatsiz rol yoki obyektga kirish:** serverdagi har bir endpointda sessiya, rol va resurs egaligini tekshirish; klient yuborgan rolga ishonmaslik.
- **Javob kalitining sizib chiqishi:** `correctIndex` faqat serverda saqlanadi; savol yakunlanmaguncha klient eventlari va API javoblariga kiritilmaydi.
- **Socket eventlarini soxtalashtirish:** har eventda sessiya, contest holati, ishtirokchi/ustoz vakolati, schema va rate limit tekshiruvi.
- **Test fayllari orqali hujum:** faqat ruxsatli kengaytmalar, MIME va hajm tekshiruvi, parserni xavfsiz ishlatish, formula va makroslarni bajarilmasligi.
- **XSS/SQL injection/CSRF:** React escaping, Zod validatsiya, Prisma parametrli so‘rovlari, CSRF himoyasi va xavfsizlik headerlari.
- **XPni soxtalashtirish yoki ikki marta yozish:** ballni faqat server hisoblaydi; javoblar va XP yangilanishi DB tranzaksiyasi hamda unique cheklovlar bilan himoyalanadi.
- **Telegram maxfiyligi:** webhook secret tekshiruvi, tokenlarni faqat env'da saqlash, parol xabarini o‘chirish va bot sessiyasini qisqa muddatda bog‘lash.

## Texnologik qarorlar

Next.js App Router + TypeScript + Tailwind, PostgreSQL + Prisma, Socket.io, grammY va Capacitor. HTTP API Next.js route handlerlarda, real-time o‘yin alohida `server/` jarayonida ishlaydi. Deploy: Ubuntu, nginx, PM2 va certbot.

## Keyingi bosqichlar

1. Loyiha skeleti va Prisma schema.
2. Auth va rollar.
3. Test parseri va kutubxonasi.
4. Bellashuv, QR va join oqimi.
5. Socket.io o‘yin mexanikasi.
6. XP, admin, Telegram, mobil ilova va deploy.

## Ishga tushirish

Talablar: Node.js 20+ va PostgreSQL 14+.

```bash
npm install
cp .env.example .env
# DATABASE_URL, AUTH_SECRET va seed admin parolini .env ichida sozlang
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
npm run dev
```

Ilova `http://localhost:3000` manzilda ochiladi. `AUTH_SECRET` uchun `openssl rand -base64 48` ishlating. `db:migrate` development migratsiyasini yaratadi; production deploy paytida `npm run db:deploy` ishlating.

## Ma'lumotlar bazasi

`prisma/schema.prisma` da foydalanuvchi, test, savol, bellashuv, ishtirokchi, javob va titul modellari, indekslar va cascade qoidalari bor. `prisma/seed.ts` boshlang‘ich admin hamda `Yangi`, `Bilimdon`, `Usta`, `Grandmaster` titullarini yaratadi. Seed admini uchun `SEED_ADMIN_USERNAME` va `SEED_ADMIN_PASSWORD` ni `.env` orqali bering; parol hash holida saqlanadi.

## Auth va REST API

- `POST /api/auth/register`: faqat `TEACHER` yoki `STUDENT` hisobi; username 3–32 ta lotin harfi/raqam/`_`, parol kamida 12 belgi.
- `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`.
- `PATCH /api/admin/users/:id/password`: faqat ADMIN; parolni yangilaganda foydalanuvchining avvalgi sessiyalari bekor qilinadi.
- Sessiya HS256 JWT ko‘rinishida httpOnly, SameSite=Lax cookie’da saqlanadi; API role’ni va sessiya versiyasini DB’dan qayta tekshiradi. Admin hisobini faqat seed orqali yarating; ochiq register endpointi ADMIN rolini qabul qilmaydi.
- Auth endpointlari Zod validatsiyasi, 8 KB body chegarasi, origin tekshiruvi va oddiy rate limit bilan himoyalangan. Rate limit xotirada saqlanadi; bir nechta server instance’li production deployda Redis kabi umumiy store bilan almashtiring. Reverse proxy `X-Real-IP` sarlavhasini o‘zi belgilashi kerak.

## Ustoz test kutubxonasi

`/teacher` sahifasida ustoz o‘z testlarini yaratishi, tanlashi, savol va to‘rtta javob variantini kiritishi hamda savolni o‘chirishi mumkin. To‘g‘ri javob belgisi serverga `correctIndex` sifatida saqlanadi; test API’lari sessiyadagi ustoz rolini hamda test egaligini tekshiradi.

- `GET/POST /api/tests`: faqat joriy ustozning testlarini ko‘rish va yangi test yaratish.
- `GET/POST/DELETE /api/tests/:id`: egasi bo‘lgan test savollarini olish, qo‘shish va o‘chirish.
- Test va savollar Prisma’dagi `Test` va `Question` modellari bilan saqlanadi.
- Keyingi mantiqiy bosqichlar: TXT/DOCX/XLSX import, preview/tahrirlash, keyin esa testdan bellashuv ochish.

Kichik tekshiruv rejasi: ustoz bo‘lib kirib test yarating; unga 4 variantli savol qo‘shib to‘g‘ri variantni belgilang; sahifani yangilab ma’lumotlar saqlanganini ko‘ring; o‘quvchi/admin tokeni bilan `/api/tests` so‘rovi ruxsat etilmasligini va boshqa ustozning test ID’si orqali savollarga kira olmasligini tekshiring.

`.env.example` ni nusxalab sozlang. Sessiya kalitini `openssl rand -base64 48` bilan yarating va `AUTH_SECRET` ga qo‘ying; `DATABASE_URL`, `AUTH_SECRET` va seed parolini production’da hosting secret manager’da saqlang. `.env` faylini repoga qo‘shmang.
