import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Mail } from "lucide-react";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import styles from "./Newsletter.module.css";
import { websiteApi } from "../../services/websiteApi.js";

export default function Newsletter({ title }) {
  const submissionsEnabled = import.meta.env?.VITE_CMS_SUBMISSIONS_ENABLED === "true";
  const {locale, t } = useLocale();

  const [state, setState] = useState("idle");
  const [notice, setNotice] = useState("");
  const lock = useRef(false);
  const { mutateAsync: subscribe } = useMutation({
    mutationFn: async (email) => {
      const response = await websiteApi.newsletter({ email, origin: "footer", locale, website: "" });
      if (!response.data.accepted) throw new Error("Newsletter request was not accepted.");
      return { ...response.data, message: response.message };
    },
    retry: false,
    gcTime: 0,
  });
  const submit = async (event) => {
    event.preventDefault();
    if (!submissionsEnabled || lock.current) return;
    const form = event.currentTarget;
    const email = new FormData(form).get("email")?.toString().trim() ?? "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setState("invalid"); return; }
    lock.current = true;
    setState("sending");
    try {
      const result = await subscribe(email);
      setNotice(result.message || "");
      setState(result.already_subscribed ? "already-subscribed" : "done");
      form.reset();
    } catch (error) {
      setState(error.status === 429 ? "rate-limited" : "error");
    } finally {
      lock.current = false;
    }
  };
  return (
    <div className={styles.newsletter} data-reveal="card">
      <Mail size={44} strokeWidth={1} aria-hidden="true" />
      <div>
        <h2>{title ?? (t("components.insight.newsletter.stay-informed-stay-ahead-606b2d"))}</h2>
        <p>
          {t("components.insight.newsletter.curated-insights-on-erp-netsuite-and-enterprise-eb7688")}
        </p>
      </div>
      <form onSubmit={submit} noValidate className={styles.form}>
        <label htmlFor="newsletter-email" className="visuallyHidden">
          {t("components.insight.newsletter.work-email-67fe32")}
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={t("components.insight.newsletter.enter-your-work-email-357a52")}
          aria-invalid={state === "invalid"}
          aria-describedby="newsletter-status"
          onChange={() => state !== "idle" && setState("idle")}
          disabled={!submissionsEnabled}
        />
        <button type="submit" disabled={!submissionsEnabled || state === "sending"}>
          {state === "sending" ? (t("components.insight.newsletter.sending-b7af8e")) : (t("components.insight.newsletter.subscribe-5e59be"))}
          <ArrowRight size={16} strokeWidth={1.6} aria-hidden="true" />
        </button>
        <p id="newsletter-status" role="status" className={styles.status} data-state={state}>
          {state === "already-subscribed"
            ? notice
            : state === "done"
            ? t("components.insight.newsletter.thank-you-your-subscription-was-received-b81230")
            : state === "invalid"
              ? t("components.insight.newsletter.enter-a-valid-email-address-e89bf5")
              : state === "rate-limited"
                ? t("components.insight.newsletter.too-many-requests-please-wait-before-trying-a64b07")
              : state === "error"
                ? t("components.insight.newsletter.subscription-failed-check-your-connection-and-try-d1895b")
              : !submissionsEnabled
                ? t("components.insight.newsletter.newsletter-signup-is-temporarily-unavailable-f93d44")
                : t("components.insight.newsletter.no-spam-unsubscribe-anytime-a93953")}
        </p>
      </form>
    </div>
  );
}
