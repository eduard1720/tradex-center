# Design

Sistema visual de TradeX Center. Registro: **product** (ver PRODUCT.md).
Dirección: fintech oscuro premium. El naranja es señal, no decoración.

## Theme

Tema único oscuro (sin modo claro). Video de marca de fondo en toda la app,
muy atenuado (velo 82–92% + `saturate(0.75) brightness(0.85)`): textura, no
protagonista. En el login el video sí es protagonista (velos suaves propios).

## Color

Definidos en `tailwind.config.ts`:

| Token        | Valor                  | Uso                                    |
| ------------ | ---------------------- | -------------------------------------- |
| `bg`         | `#0A0B0D`              | Fondo base                             |
| `bg-soft`    | `#0E0F12`              | Sidebar, panel del login               |
| `card`       | `#131418`              | Superficie de tarjetas                 |
| `card-soft`  | `#17181D`              | Inputs, chips, superficies secundarias |
| `card-hover` | `#1C1E24`              | Hover de superficies                   |
| `line`       | `rgba(255,255,255,.06)`| Bordes y divisores                     |
| `brand`      | `#F7931A`              | SOLO: CTA primaria, ítem activo, foco  |
| `pos` / `neg`| `#16C784` / `#F6465D`  | SOLO dirección de mercado y errores    |
| `muted`      | `#8A8F98`              | Texto secundario                       |

Reglas:
- Estados activos de navegación: `bg-white/[0.06]` + icono naranja + barra
  de 3px. Nunca lavado naranja de fondo.
- Avatares/monogramas de activos de mercado: neutros (`bg-white/[0.06]`),
  no naranjas.
- Sin glows decorativos (`blur-3xl` de marca) ni gradientes de texto.

## Typography

- **Sans**: Geist (`--font-sans`, next/font). Todo el UI.
- **Mono**: Geist Mono (`--font-mono`). Obligatoria con `tabular-nums` para:
  precios, porcentajes, volúmenes, contadores, códigos de acceso.
- Títulos de página: `text-2xl md:text-3xl font-semibold tracking-tight`.
- Sin eyebrows sobre los h1. Si hace falta contexto, una línea muted DEBAJO
  del título.

## Components (utilidades en globals.css)

- `.card` – superficie base con borde `line` y sombra suave.
- `.btn-primary` – naranja, texto negro, `active:scale-[0.99]`, 150ms.
- `.btn-ghost` – borde `line`, hover `border-white/15`.
- `.input` – foco: `border-brand/50` + `ring-brand/15`.
- `.label` – etiqueta de formulario (arriba del input, nunca placeholder).
- Foco global accesible: `:focus-visible` con anillo naranja.
- Selección de texto: naranja 28%.

## Motion

- Entrada de página: `animate-fade-up` (0.4s, una vez). Desactivada bajo
  `prefers-reduced-motion` (regla en globals.css).
- Transiciones de estado: 150ms. Nada de coreografías de carga.
- Video de fondo: pasa a póster estático con reduced motion.

## Layout

- Contenido: `max-w-[1400px]`; páginas de lectura `max-w-3xl`.
- Sidebar 244px (76px colapsado), topbar 64px.
- Footer: una línea `text-[11px] text-muted/80`.
