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
import ShellLabel from "./ShellLabel.jsx";
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
          aria-label={t("components.layout.site-header.primary-navigation-8e5635")}
        >
          {links.map((key) => (
            <NavLink
              key={key}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
              to={`/${locale}/${key}`}
            >
              <ShellLabel name={`nav.${key}`} />
            </NavLink>
          ))}
        </nav>
        <div className={styles.actions}>
          <div className={styles.desktopActions}>
            <LocaleSwitcher />
            <ThemeSwitcher />
            <PrimaryLink to={`/${locale}/contact`} className={styles.cta}>
              <ShellLabel name="nav.contact" width={96} />
            </PrimaryLink>
          </div>
          <Burger
            className={styles.burger}
            opened={opened}
            onClick={open}
            aria-label={t("components.layout.site-header.open-navigation-147140")}
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
          "aria-label": t("components.layout.site-header.close-navigation-6fc864"),
        }}
      >
        <nav
          className={styles.mobileNav}
          aria-label={t("components.layout.site-header.primary-navigation-8e5635")}
        >
          {links.map((key, index) => (
            <NavLink
              key={key}
              onClick={close}
              to={`/${locale}/${key}`}
              style={{ "--i": index }}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <ShellLabel name={`nav.${key}`} />
            </NavLink>
          ))}
        </nav>
        <PrimaryLink
          to={`/${locale}/contact`}
          onClick={close}
          className={styles.mobileCta}
        >
          <ShellLabel name="nav.contact" width={96} />
        </PrimaryLink>
        <div className={styles.mobileControls}>
          <LocaleSwitcher onNavigate={close} />
          <ThemeSwitcher />
        </div>
      </Drawer>
    </header>
  );
}
