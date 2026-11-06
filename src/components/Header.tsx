import { useEffect, useLayoutEffect, useRef, useState } from "react";
import logoBlack from "../assets/integrito-logo-black.svg";
import logoWhite from "../assets/integrito-logo-white.svg";
import {
  applyTheme,
  getCurrentTheme,
  getPreferredTheme,
  type Theme,
} from "../theme";
import ThemeSwitcher from "./ThemeSwitcher";
import "./Header.css";

const NAV_ITEMS = [
  { id: "ai-text", label: "AI Text Detector", active: true },
  { id: "ai-image", label: "AI Image Detector", active: false },
  { id: "plagiarism", label: "Plagiarism Checker", active: false },
] as const;

/**
 * Header — theme switcher transferred from integrito.app (Step 2.5).
 * App-wide theme via document.documentElement.dataset.theme.
 */
function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const [theme, setTheme] = useState<Theme>(() => getPreferredTheme());

  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const sync = (event: Event) => {
      setTheme((event as CustomEvent<Theme>).detail);
    };
    window.addEventListener("integrito-theme", sync);
    setTheme(getCurrentTheme());
    return () => window.removeEventListener("integrito-theme", sync);
  }, []);

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const publishHeight = () => {
      document.documentElement.style.setProperty(
        "--header-height",
        `${el.offsetHeight}px`
      );
    };

    publishHeight();
    const observer = new ResizeObserver(publishHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isDark = theme === "dark";
  const logoSrc = isDark ? logoWhite : logoBlack;

  return (
    <header className="site-header" ref={headerRef}>
      <div className="site-header__inner">
        <div className="site-header__left">
          <a className="site-header__brand" href="/" aria-label="Integrito home">
            <img
              className="site-header__logo"
              src={logoSrc}
              alt="integrito"
              width={185}
              height={42}
            />
          </a>

          <nav className="site-header__nav" aria-label="Product">
            {NAV_ITEMS.map((item) =>
              item.active ? (
                <a
                  key={item.id}
                  className="site-header__link site-header__link--active"
                  href="#ai-text-detector"
                  aria-current="page"
                >
                  {item.label}
                </a>
              ) : (
                <button
                  key={item.id}
                  type="button"
                  className="site-header__link site-header__link--inactive"
                >
                  {item.label}
                </button>
              )
            )}
          </nav>
        </div>

        <div className="site-header__actions">
          <button type="button" className="site-header__login">
            Log in
          </button>
          <button type="button" className="site-header__signup">
            Sign up
          </button>
          <ThemeSwitcher
            theme={theme}
            onChange={(next) => {
              applyTheme(next);
              setTheme(next);
            }}
          />
        </div>
      </div>
    </header>
  );
}

export default Header;
