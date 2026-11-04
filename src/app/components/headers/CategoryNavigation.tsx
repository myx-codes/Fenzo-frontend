import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import AppsOutlinedIcon from "@mui/icons-material/AppsOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import { useGlobals } from "../../hooks/useGlobals";
import { categoryGroups, quickCategories } from "./categoryCatalog";

export function CategoryNavigation({ compact = false }: { compact?: boolean }) {
  const { t, authUser } = useGlobals();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [availableHeight, setAvailableHeight] = useState(480);
  const rootRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const focusOnOpen = useRef<"first" | "last" | null>(null);
  const panelId = compact ? "mobile-category-panel" : "desktop-category-panel";

  const close = (restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  };

  useEffect(() => { setOpen(false); }, [location.pathname, location.search]);

  useLayoutEffect(() => {
    if (!open) return;
    const measure = () => {
      const bottom = rootRef.current?.getBoundingClientRect().bottom || 0;
      // The mobile bottom navigation remains reachable beneath this disclosure.
      const reservedBottom = compact ? 92 : 24;
      setAvailableHeight(Math.max(80, window.innerHeight - bottom - reservedBottom));
    };
    measure();
    const viewport = window.visualViewport;
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    viewport?.addEventListener("resize", measure);
    if (focusOnOpen.current) {
      const links = panelRef.current?.querySelectorAll<HTMLAnchorElement>("[data-category-link]");
      const link = focusOnOpen.current === "last" ? links?.[links.length - 1] : links?.[0];
      link?.focus();
      focusOnOpen.current = null;
    }
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
      viewport?.removeEventListener("resize", measure);
    };
  }, [open, compact]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  const navigateLinks = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const links = Array.from(panelRef.current?.querySelectorAll<HTMLAnchorElement>("[data-category-link]") || []);
    const index = links.indexOf(event.target as HTMLAnchorElement);
    if (index < 0) return;
    let next: HTMLAnchorElement | undefined;
    if (event.key === "ArrowDown") next = links[(index + 1) % links.length];
    if (event.key === "ArrowUp") next = links[(index - 1 + links.length) % links.length];
    if (event.key === "Home") next = links[0];
    if (event.key === "End") next = links[links.length - 1];
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      const group = Number(links[index].dataset.group);
      const row = Number(links[index].dataset.row);
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const nextGroup = (group + direction + categoryGroups.length) % categoryGroups.length;
      const column = links.filter(link => Number(link.dataset.group) === nextGroup);
      next = column[Math.min(row, column.length - 1)];
    }
    if (next) {
      event.preventDefault();
      next.focus();
      next.scrollIntoView({ block: "nearest" });
    }
  };

  return (
    <nav
      ref={rootRef}
      className={`fz-navigation ${compact ? "fz-navigation--compact" : ""}`}
      aria-label={compact ? "Shop navigation" : "Primary navigation"}
      onBlur={event => {
        if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <div className="fz-nav-leading">
        <button
          ref={triggerRef}
          type="button"
          className={`fz-category-trigger ${open ? "is-open" : ""}`}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen(current => !current)}
          onKeyDown={event => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              if (open) {
                const links = panelRef.current?.querySelectorAll<HTMLAnchorElement>("[data-category-link]");
                (event.key === "ArrowDown" ? links?.[0] : links?.[links.length - 1])?.focus();
              } else {
                focusOnOpen.current = event.key === "ArrowDown" ? "first" : "last";
                setOpen(true);
              }
            }
          }}
        >
          <AppsOutlinedIcon aria-hidden="true" />
          <span>All categories</span>
          <ExpandMoreRoundedIcon className="fz-category-chevron" aria-hidden="true" />
        </button>
        {!compact && <div className="fz-nav-pages">
          <NavLink exact to="/" className="fz-nav-link" activeClassName="is-active">{t("home")}</NavLink>
          <NavLink exact to="/products" className="fz-nav-link" activeClassName="is-active">{t("products")}</NavLink>
        </div>}
      </div>

      <div className="fz-nav-discovery" aria-label="Featured categories">
        {quickCategories.map(item => (
          <NavLink key={item.collection} to={`/products/${item.collection}`} className="fz-nav-link" activeClassName="is-active">
            {item.label}
          </NavLink>
        ))}
      </div>
      {!compact && <NavLink to="/help" className="fz-nav-link fz-nav-help" activeClassName="is-active">
        <HelpOutlineRoundedIcon aria-hidden="true" />{t("help")}
      </NavLink>}

      {open && <div
        id={panelId}
        ref={panelRef}
        className={`fz-mega-menu ${availableHeight < 220 ? "fz-mega-menu--short" : ""}`}
        role="region"
        aria-labelledby={`${panelId}-title`}
        style={{ maxHeight: Math.min(600, availableHeight) }}
        onKeyDown={navigateLinks}
      >
        <div className="fz-mega-heading">
          <div><span className="fz-mega-eyebrow">FIND YOUR EVERYDAY</span><h2 id={`${panelId}-title`}>Browse categories</h2></div>
          <NavLink exact to="/products" className="fz-mega-all" onClick={() => close()}>All products <ArrowForwardRoundedIcon aria-hidden="true" /></NavLink>
          <button type="button" className="fz-mega-close" aria-label="Close categories" onClick={() => close(true)}><CloseRoundedIcon /></button>
        </div>
        <div className="fz-mega-body">
          {categoryGroups.map((group, groupIndex) => (
            <section key={group.id} className="fz-mega-group" aria-labelledby={`${panelId}-${group.id}`}>
              <h3 id={`${panelId}-${group.id}`}><group.Icon aria-hidden="true" /><span>{group.label}</span></h3>
              <ul>
                {group.items.map((item, rowIndex) => <li key={item.collection}>
                  <NavLink
                    exact to={`/products/${item.collection}`}
                    className="fz-mega-link" activeClassName="is-active"
                    data-category-link data-group={groupIndex} data-row={rowIndex}
                    onClick={() => close()}
                  >{item.label}</NavLink>
                </li>)}
              </ul>
            </section>
          ))}
        </div>
        <div className="fz-mega-footer">
          <NavLink to="/products" onClick={() => close()}>Browse all products <ArrowForwardRoundedIcon aria-hidden="true" /></NavLink>
          {compact && !authUser
            ? <NavLink to="/signup" onClick={() => close()}>{t("signUp")} <ArrowForwardRoundedIcon aria-hidden="true" /></NavLink>
            : <span>Something for every part of your day.</span>}
        </div>
      </div>}
    </nav>
  );
}
