import { t } from "../lib/strings";
import { useApiHealth, useShouldPingApi } from "../hooks/useApiHealth.ts";

export function BetaApiStatus() {
  const ping = useShouldPingApi();
  const health = useApiHealth(ping);

  if (!ping) return null;

  let label: string = t.apiStatusChecking;
  if (health.status === "ok") label = t.apiStatusOk;
  else if (health.status === "offline") label = t.apiStatusOffline;

  return (
    <div className="beta-api-status" role="status" aria-live="polite">
      <span
        className={
          health.status === "ok"
            ? "beta-api-status__dot beta-api-status__dot--ok"
            : health.status === "offline"
              ? "beta-api-status__dot beta-api-status__dot--bad"
              : "beta-api-status__dot beta-api-status__dot--pending"
        }
      />
      <span className="beta-api-status__text">{label}</span>
    </div>
  );
}