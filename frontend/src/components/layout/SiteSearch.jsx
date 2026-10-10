import { useId, useState } from "react";
import { Modal } from "@mantine/core";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { websiteApi } from "../../services/websiteApi.js";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import ErrorState from "../feedback/ErrorState.jsx";
import styles from "./SiteSearch.module.css";

function SearchPanel({ opened, close }) {
  const { locale, t } = useLocale();
  const id = useId();
  const [draft, setDraft] = useState("");
  const [term, setTerm] = useState("");
  const [page, setPage] = useState(1);
  const [invalid, setInvalid] = useState(false);
  const query = useQuery({ queryKey: ["search", locale, term, page],
    queryFn: ({ signal }) => websiteApi.search({ q: term, locale, page, per_page: 20 }, signal),
    enabled: opened && term.length >= 2, retry: false });
  const results = query.data?.data || [];
  const meta = query.data?.meta;
  function submit(event) {
    event.preventDefault();
    const value = draft.trim();
    setInvalid(value.length < 2);
    if (value.length < 2) return;
    setTerm(value);
    setPage(1);
  }
  return <Modal opened={opened} onClose={close} title={t("search.title")} size="lg" centered
    closeButtonProps={{ "aria-label": t("search.close") }} classNames={{ content: styles.surface, header: styles.surface, title: styles.title }}>
    <form role="search" onSubmit={submit} className={styles.form}>
      <label htmlFor={id}>{t("search.label")}</label>
      <div className={styles.controls}>
        <input id={id} type="search" data-autofocus value={draft} maxLength={100} aria-invalid={invalid} aria-describedby={`${id}-hint`}
          onChange={event => { setDraft(event.target.value); setInvalid(false); }} />
        <button type="submit">{t("search.title")}</button>
      </div>
      <p id={`${id}-hint`} className={styles.hint} role={invalid ? "alert" : undefined}>{t(invalid ? "search.minimum" : "search.initial")}</p>
    </form>
    {term && <div className={styles.results}>
      {query.isLoading ? <p role="status" aria-busy="true">{t("components.feedback.page-loader.loading-page-59ae89")}</p>
        : query.isError ? <ErrorState onRetry={query.refetch} />
        : <>
          <p role="status" className={styles.count}>{t(results.length ? "search.results" : "search.empty", { count: meta?.total || 0 })}</p>
          <ul>{results.map(result => <li key={`${result.type}-${result.id}`}>
            <Link to={result.href} onClick={close}>
              <span className={styles.kind}>{t(`nav.${result.type}`)}</span>
              <strong>{result.title}</strong>
              {result.summary && <p>{result.summary}</p>}
            </Link>
          </li>)}</ul>
          {meta?.last_page > 1 && <div className={styles.paging}>
            <button type="button" disabled={page <= 1 || query.isFetching} onClick={() => setPage(value => value - 1)}>{t("search.previous")}</button>
            <span>{page} / {meta.last_page}</span>
            <button type="button" disabled={page >= meta.last_page || query.isFetching} onClick={() => setPage(value => value + 1)}>{t("search.next")}</button>
          </div>}
        </>}
    </div>}
  </Modal>;
}

export default function SiteSearch() {
  const { locale, t } = useLocale();
  const [opened, setOpened] = useState(false);
  return <>
    <button type="button" className={styles.trigger} onClick={() => setOpened(true)} aria-label={t("search.title")} aria-haspopup="dialog">
      <Search size={18} strokeWidth={1.6} aria-hidden="true" />
    </button>
    <SearchPanel key={locale} opened={opened} close={() => setOpened(false)} />
  </>;
}
