/**
 * Calendario económico de Investing.com (widget embebible).
 * Filtrado a Estados Unidos (countries=5), que es lo que mueve al dólar:
 * NFP, FOMC, IPC, tasas de la Fed, etc. En español (lang=12).
 * El widget de Investing.com se sirve con fondo claro; lo enmarcamos en
 * blanco para que se vea intencional dentro del tema oscuro.
 */
const SRC =
  "https://sslecal2.investing.com/?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&features=datepicker,timezone&countries=5&calType=week&timeZone=46&lang=4";

export function EconomicCalendar() {
  return (
    <div className="overflow-hidden rounded-xl bg-white">
      <iframe
        src={SRC}
        title="Calendario económico de Estados Unidos (Investing.com)"
        className="w-full"
        style={{ height: 660, border: 0 }}
        loading="lazy"
      />
    </div>
  );
}
