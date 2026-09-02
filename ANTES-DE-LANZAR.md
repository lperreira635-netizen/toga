# Antes de lanzar Toga

La app está lista y funcionando. Solo faltan datos tuyos reales — todo está marcado con `TU-` o `tu-` para que sea fácil de encontrar. Reemplaza cada uno en los archivos indicados.

## 1. Gumroad (para que el cobro funcione de verdad)

Archivo: `app.js`, busca el bloque `const PAGOS = {`

1. Crea una cuenta gratis en [gumroad.com](https://gumroad.com) con tus datos bancarios.
2. Crea el producto **"Toga — Nivel Experto"** a **$1 USD**.
3. Crea el producto **"Toga — Nivel Extra"** a **$3 USD**.
4. En cada producto, activa **"Generate a unique license key per sale"** (sección Content).
5. Reemplaza:
   - `TU-PERMALINK-EXPERTO` → el permalink del primer producto
   - `TU-PERMALINK-EXTRA` → el permalink del segundo producto
   - Las dos líneas `checkoutUrl` → la URL completa de cada producto

## 1.0. Para que el dinero te llegue a ti

Esto es lo único que Gumroad no adivina solo — hay que decirle a dónde depositar:

1. En Gumroad ve a **Settings → Payouts**.
2. Conecta tu cuenta de cobro: normalmente **PayPal** (la más simple) o **Payoneer/banco**, según lo que Gumroad ofrezca para Colombia en ese momento.
3. Verifica tu identidad si te lo pide (cédula y a veces info fiscal) — sin esto no suelta ningún pago.
4. Gumroad no paga venta por venta: acumula y te hace un **payout periódico** (normalmente semanal) a la cuenta conectada. La primera puede tardar más mientras revisan la cuenta nueva.
5. Gumroad cobra su comisión (% + tarifa fija) **antes** de depositarte — revisa el número actual en su página de precios. Con productos de $1–$3 USD esa tarifa fija se come una parte grande de la venta, así que vale la pena confirmar que el margen que te queda tiene sentido antes de lanzar.

## 1.1. Desbloqueo automático al pagar (importante)

Para que la app se desbloquee sola apenas alguien termina de pagar —sin que tengan que copiar ningún código— configura esto en **cada** producto de Gumroad:

1. Ve al producto → pestaña **Content**.
2. Busca **"Redirect to URL after successful purchase"**.
3. Pon esta URL (cambia el dominio cuando ya lo tengas):
   - Producto Experto: `https://TU-DOMINIO.com/?nivel=experto&license_key={{license_key}}`
   - Producto Extra: `https://TU-DOMINIO.com/?nivel=extra&license_key={{license_key}}`

Con esto, en cuanto alguien paga, Gumroad lo manda de vuelta a tu app con su código ya incluido en el enlace, y la app lo detecta y desbloquea automáticamente. Si por alguna razón esto falla (cerró la pestaña muy rápido, etc.), la app también deja pegar el código a mano como respaldo — así que el correo de licencia que Gumroad manda automáticamente sigue siendo útil como plan B, no hay que desactivarlo.

## 1.2. Desbloqueo gratis por anuncio (opcional, pero ya está armado)

Quien no pueda pagar puede ver **un anuncio corto y leer ese capítulo gratis**, uno a la vez — no desbloquea el nivel completo, solo ese capítulo. Ya funciona en "modo de prueba" ahora mismo (el botón avisa que es una simulación y desbloquea igual, para que puedas probar el flujo). Para que muestre anuncios reales y te paguen por ellos:

1. Crea una cuenta gratis en [google.com/adsense](https://www.google.com/adsense) (pide aprobación, puede tardar unos días).
2. Cuando te den tu ID (`ca-pub-XXXXXXXXXXXXXXXX`), reemplaza `TU-ADSENSE-CLIENT-ID` en dos lugares:
   - `index.html` → en la etiqueta `<script>` de `adsbygoogle.js`
   - `app.js` → en la constante `ADSENSE_CLIENT_ID`
3. Listo — en cuanto ambos tengan tu ID real, el botón deja el modo de prueba y muestra anuncios reales.

## 2. Correo de soporte

Archivo: `app.js`, busca `CORREO_SOPORTE`

Reemplaza `tu-correo@ejemplo.com` por el correo donde quieras recibir mensajes de gente con problemas de pago o licencia.

## 3. Dominio de la app

Una vez subas la app a un hosting (Netlify, Vercel, GitHub Pages, o el que prefieras):

- `app.js` → reemplaza `URL_APP` (`https://TU-DOMINIO.com`) por tu URL real. Se usa en el botón "Invita a un amigo".
- `index.html` → reemplaza las 2 apariciones de `TU-DOMINIO.com` (en las etiquetas `og:url` y `og:image`) por tu dominio real, para que el enlace se vea bien al compartirlo en WhatsApp o redes.

## 4. Opcional: revisa el texto de "Acerca de"

Archivo: `app.js`, función `screenAcerca()`

Hay una línea que dice *"Este texto es de ejemplo — reemplázalo con la información real de tu proyecto"*. Puedes dejarla, quitarla, o poner tu nombre/marca real ahí.

## 5. Publicar

Cualquiera de estos hostings gratuitos sirve (solo arrastras la carpeta):

- [Netlify Drop](https://app.netlify.com/drop)
- [Vercel](https://vercel.com)
- [GitHub Pages](https://pages.github.com)

Una vez publicada, el manifest y el ícono ya están listos para que cualquiera la instale como app real desde su navegador ("Agregar a inicio").

---

**Nada de esto requiere que me pases contraseñas ni datos bancarios** — todo lo haces tú directamente en Gumroad/tu hosting, y solo me compartes las URLs/permalinks resultantes para que yo los ponga en el código.
