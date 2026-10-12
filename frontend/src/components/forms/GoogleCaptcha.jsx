import { useEffect, useRef, useState } from "react";
import Skeleton from "../feedback/Skeleton.jsx";

let apiPromise;
function loadApi() {
  if (window.grecaptcha?.render) return Promise.resolve(window.grecaptcha);
  if (!apiPromise) {
    apiPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      const timeout = window.setTimeout(() => fail(), 15000);
      const fail = () => {
        window.clearTimeout(timeout);
        script.remove();
        delete window.prosperyaRecaptchaReady;
        apiPromise = undefined;
        reject(new Error("CAPTCHA could not be loaded."));
      };
      window.prosperyaRecaptchaReady = () => {
        window.clearTimeout(timeout);
        delete window.prosperyaRecaptchaReady;
        resolve(window.grecaptcha);
      };
      script.src = "https://www.google.com/recaptcha/api.js?onload=prosperyaRecaptchaReady&render=explicit";
      script.async = true;
      script.defer = true;
      script.onerror = fail;
      document.head.append(script);
    });
  }
  return apiPromise;
}

export default function GoogleCaptcha({ siteKey, onChange, resetKey, errorText, retryText }) {
  const container = useRef(null);
  const widget = useRef(null);
  const change = useRef(onChange);
  const [state, setState] = useState("loading");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => { change.current = onChange; }, [onChange]);
  useEffect(() => {
    let active = true;
    const target = document.createElement("div");
    container.current.append(target);
    loadApi().then(api => {
      if (!active) return;
      widget.current = api.render(target, {
        sitekey: siteKey,
        size: "compact",
        callback: token => { if (active) { setState("ready"); change.current(token); } },
        "expired-callback": () => { if (active) change.current(""); },
        "error-callback": () => { if (active) { change.current(""); setState("error"); } },
      });
      setState("ready");
    }).catch(() => { if (active) { change.current(""); setState("error"); } });
    return () => {
      active = false;
      if (widget.current !== null && window.grecaptcha?.reset) window.grecaptcha.reset(widget.current);
      widget.current = null;
      target.remove();
    };
  }, [siteKey, attempt]);
  useEffect(() => {
    if (widget.current !== null && window.grecaptcha?.reset) {
      window.grecaptcha.reset(widget.current);
      change.current("");
    }
  }, [resetKey]);
  return <div>
    {state === "loading" && <Skeleton width={164} height={144} />}
    <div ref={container} />
    {state === "error" && <div role="alert"><p>{errorText}</p><button type="button" onClick={() => { setState("loading"); setAttempt(value => value + 1); }}>{retryText}</button></div>}
  </div>;
}
