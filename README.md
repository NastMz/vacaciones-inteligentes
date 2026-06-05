# Vacaciones Inteligentes Colombia

Optimizador de vacaciones para Colombia. Encuentra las mejores fechas para maximizar el descanso usando festivos nacionales y puentes.

## Stack

- **Next.js 15** + App Router
- **TypeScript** (modo estricto)
- **Tailwind CSS**
- Sin backend — corre completamente client-side

## Estructura

```
src/
├── app/               # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── VacationForm.tsx
│   ├── RecommendationCard.tsx
│   └── RecommendationTable.tsx
├── domain/            # Lógica de negocio pura
│   ├── colombian-holidays.ts
│   ├── business-day.ts
│   └── vacation-optimizer.ts
├── lib/
│   └── formatters.ts
└── types/
    └── index.ts
```

## Dev local

```bash
pnpm install
pnpm dev
```

## Deploy en Vercel

```bash
npx vercel
```

O conectar el repositorio en vercel.com — detecta Next.js automáticamente.

## Festivos incluidos

**Fijos:** Año Nuevo, Día del Trabajo, Independencia, Batalla de Boyacá, Inmaculada Concepción, Navidad

**Ley Emiliani** (se mueven al lunes siguiente): Reyes Magos, San José, San Pedro y San Pablo, Nuestra Señora del Rosario de Chiquinquirá, Asunción de la Virgen, Día de la Raza, Todos los Santos, Independencia de Cartagena

**Semana Santa:** Jueves Santo, Viernes Santo

**Easter-relative Emiliani:** Ascensión del Señor, Corpus Christi, Sagrado Corazón de Jesús

## Algoritmo

Fuerza bruta sobre los 365 días del año. Para cada día hábil como posible inicio, consume exactamente N días hábiles y extiende el bloque real con fines de semana y festivos adyacentes. Deduplicación por ventana de descanso real. Complejidad: O(365 * N).

## Roadmap

- v1.1: Exportar mensaje para RRHH, comparar varios bloques
- v1.2: Dividir vacaciones en múltiples salidas, excluir temporadas
- v2: Google Calendar, múltiples países, API pública
