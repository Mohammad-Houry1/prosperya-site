import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Mail } from "lucide-react";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import styles from "./Newsletter.module.css";
import { stagingContent } from "../../services/stagingContent.js";

export default function Newsletter({ title }) {
  const submissionsEnabled = false;
  const { locale } = useLocale();
  const fr = locale === "fr";
  const [state, setState] = useState("idle");
  const lock = useRef(false);
  const { mutateAsync: subscribe } = useMutation({
    mutationFn: async (email) => {
      const response = await stagingContent.newsletter({ email, origin: "footer", locale, website: "" });
      if (!response.data.accepted) throw new Error("Newsletter request was not accepted.");
      return response.data;
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
      await subscribe(email);
      setState("done");
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
        <h2>{title ?? (fr ? "Restez informé. Gardez une longueur d’avance." : "Stay informed. Stay ahead.")}</h2>
        <p>
          {fr
            ? "Des analyses choisies sur l’ERP, NetSuite et la transformation, directement dans votre boîte."
            : "Curated insights on ERP, NetSuite and enterprise transformation, delivered to your inbox."}
        </p>
      </div>
      <form onSubmit={submit} noValidate className={styles.form}>
        <label htmlFor="newsletter-email" className="visuallyHidden">
          {fr ? "Email professionnel" : "Work email"}
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={fr ? "Votre email professionnel" : "Enter your work email"}
          aria-invalid={state === "invalid"}
          aria-describedby="newsletter-status"
          onChange={() => state !== "idle" && setState("idle")}
          disabled={!submissionsEnabled}
        />
        <button type="submit" disabled={!submissionsEnabled || state === "sending"}>
          {state === "sending" ? (fr ? "Envoi…" : "Sending…") : (fr ? "S’abonner" : "Subscribe")}
          <ArrowRight size={16} strokeWidth={1.6} aria-hidden="true" />
        </button>
        <p id="newsletter-status" role="status" className={styles.status} data-state={state}>
          {state === "done"
            ? fr
              ? "Merci. Votre inscription a été reçue."
              : "Thank you. Your subscription was received."
            : state === "invalid"
              ? fr
                ? "Saisissez une adresse email valide."
                : "Enter a valid email address."
              : state === "rate-limited"
                ? fr ? "Trop de demandes. Réessayez dans un moment." : "Too many requests. Please wait before trying again."
              : state === "error"
                ? fr ? "L’inscription a échoué. Vérifiez votre connexion et réessayez." : "Subscription failed. Check your connection and try again."
              : !submissionsEnabled
                ? fr ? "Référence staging — les inscriptions ne sont pas envoyées." : "Staging reference — subscriptions are not sent."
                : fr
                  ? "Pas de spam. Désinscription à tout moment."
                  : "No spam. Unsubscribe anytime."}
        </p>
      </form>
    </div>
  );
}
