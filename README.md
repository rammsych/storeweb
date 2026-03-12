# Verdulería Prototype

Prototipo full-stack con:
- Next.js 14
- NextAuth (login con email y contraseña)
- Prisma + SQLite
- Nodemailer para enviar la solicitud de compra al correo del vendedor
- Tailwind CSS

## Funcionalidades incluidas
- Registro de usuarios
- Login
- Catálogo de productos
- Carrito simple
- Envío de solicitud de compra
- Guardado del pedido en base de datos
- Envío de email al vendedor

## Usuario demo
- Email: `cliente@demo.cl`
- Password: `123456`

---

## 1) Requisitos
Instala en tu PC:
- Node.js 20 o superior
- npm

Verifica:
```bash
node -v
npm -v
```

---

## 2) Abrir el proyecto
Descomprime el proyecto y entra a la carpeta:
```bash
cd verduleria-prototype
```

---

## 3) Instalar dependencias
```bash
npm install
```

---

## 4) Crear variables de entorno
Copia el archivo de ejemplo:

### En Windows PowerShell
```powershell
Copy-Item .env.example .env
```

### En CMD
```cmd
copy .env.example .env
```

### En Git Bash / Linux / macOS
```bash
cp .env.example .env
```

Después edita `.env`.

Ejemplo:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="un-secreto-largo-y-seguro"
VENDOR_EMAIL="vendedor@ejemplo.com"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="tu_correo@gmail.com"
SMTP_PASS="tu_app_password"
SMTP_FROM="Verdulería <tu_correo@gmail.com>"
```

### Nota importante sobre el correo
Para Gmail normalmente debes usar una **App Password**, no tu contraseña normal.

Si todavía no quieres enviar correos reales, puedes dejar configurado tu propio correo para hacer pruebas.

---

## 5) Crear base de datos con Prisma
```bash
npx prisma generate
npx prisma db push
```

---

## 6) Cargar datos de prueba
```bash
npm run prisma:seed
```

Esto crea:
- el usuario demo
- 5 productos de ejemplo

---

## 7) Levantar el proyecto en local
```bash
npm run dev
```

Luego abre:
```text
http://localhost:3000
```

---

## 8) Probar el flujo completo
1. Entra a `/login`
2. Usa el usuario demo o crea una cuenta nueva
3. Ve al catálogo
4. Agrega productos
5. Escribe un comentario
6. Presiona **Enviar solicitud de compra**
7. Revisa:
   - el correo del vendedor
   - la base de datos SQLite

---

## 9) Ver la base de datos visualmente
Puedes abrir Prisma Studio:
```bash
npx prisma studio
```

Ahí verás:
- `User`
- `Product`
- `Order`
- `OrderItem`

---

## 10) Estructura del proyecto
```text
app/
  api/
    auth/[...nextauth]/route.js
    orders/route.js
    register/route.js
  catalog/page.js
  login/page.js
  register/page.js
  layout.js
  page.js
  globals.css
components/
  CatalogClient.js
  LoginForm.js
  SignOutButton.js
lib/
  auth.js
  format.js
  mailer.js
  prisma.js
prisma/
  schema.prisma
  seed.js
```

---

## 11) Qué mejorar después
Ideas para la siguiente etapa:
- panel admin para crear productos
- editar productos
- categorías
- stock
- historial de pedidos del cliente
- estados del pedido
- imagen subida local/cloudinary
- WhatsApp del vendedor
- pago online
- dashboard admin

---

## 12) Problemas comunes

### Error con Prisma
Ejecuta otra vez:
```bash
npx prisma generate
npx prisma db push
```

### El correo no llega
Revisa:
- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASS
- VENDOR_EMAIL

### Error de autenticación
Revisa que `NEXTAUTH_SECRET` tenga valor y que `NEXTAUTH_URL` sea:
```env
NEXTAUTH_URL="http://localhost:3000"
```

---

## 13) Siguiente evolución recomendada
Para producción yo te recomendaría después migrar desde SQLite a PostgreSQL y desplegar en Vercel o Railway.
