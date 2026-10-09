import { useEffect, useRef } from "react";
import { Burger, Drawer } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { NavLink } from "react-router-dom";
import BrandMark from "./BrandMark.jsx";
import ThemeSwitcher from "./ThemeSwitcher.jsx";
import LocaleSwitcher from "./LocaleSwitcher.jsx";
import PrimaryLink from "../common/PrimaryLink.jsx";
import { useLocale } from "../../i18n/LocaleContext.jsx";
import styles from "./SiteHeader.module.css";
const links = [
  "expertise",
  "solutions",
  "work",
  "approach",
  "insights",
  "about",
];
export default function SiteHeader() {
  const [opened, { open, close }] = useDisclosure(false);
  const { locale, t } = useLocale();
  const header = useRef(null);
  const fr = locale === "fr";
  useEffect(() => {
    const update = () =>
      header.current?.toggleAttribute("data-scrolled", window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <header ref={header} className={styles.header}>
      <div className={styles.inner}>
        <BrandMark />
        <nav
          className={styles.desktopNav}
          aria-label={fr ? "Navigation principale" : "Primary navigation"}
        >
          {links.map((key) => (
            <NavLink
              key={key}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
              to={`/${locale}/${key}`}
            >
              {t(`nav.${key}`)}
            </NavLink>
          ))}
        </nav>
        <div className={styles.actions}>
          <div className={styles.desktopActions}>
            <LocaleSwitcher />
            <ThemeSwitcher />
            <PrimaryLink to={`/${locale}/contact`} className={styles.cta}>
              {t("nav.contact")}
            </PrimaryLink>
          </div>
          <Burger
            className={styles.burger}
            opened={opened}
            onClick={open}
            aria-label={fr ? "Ouvrir la navigation" : "Open navigation"}
            size="sm"
          />
        </div>
      </div>
      <Drawer
        opened={opened}
        onClose={close}
        position="right"
        title={<BrandMark />}
        size="100%"
        padding="lg"
        transitionProps={{
          transition: "fade",
          duration: 260,
          timingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
        }}
        classNames={{
          content: styles.drawerSurface,
          header: styles.drawerSurface,
          body: styles.drawerBody,
        }}
        closeButtonProps={{
          "aria-label": fr ? "Fermer la navigation" : "Close navigation",
        }}
      >
        <nav
          className={styles.mobileNav}
          aria-label={fr ? "Navigation principale" : "Primary navigation"}
        >
          {links.map((key, index) => (
            <NavLink
              key={key}
              onClick={close}
              to={`/${locale}/${key}`}
              style={{ "--i": index }}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {t(`nav.${key}`)}
            </NavLink>
          ))}
        </nav>
        <PrimaryLink
          to={`/${locale}/contact`}
          onClick={close}
          className={styles.mobileCta}
        >
          {t("nav.contact")}
        </PrimaryLink>
        <div className={styles.mobileControls}>
          <LocaleSwitcher onNavigate={close} />
          <ThemeSwitcher />
        </div>
      </Drawer>
    </header>
  );
}
