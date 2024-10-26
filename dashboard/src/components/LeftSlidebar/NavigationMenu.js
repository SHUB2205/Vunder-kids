import React from "react";
import styles from "./NavigationMenu.module.css";
import { NavLink } from "react-router-dom";

const menuItems = [
  { icon: "🏠", label: "Home", ariaLabel: "Home", routePath: "" },
  { icon: "🔍", label: "Search", ariaLabel: "Search", routePath: "Search" },
  {
    icon: "🔔",
    label: "Notification",
    ariaLabel: "Notifications",
<<<<<<< HEAD
    routePath: "notification",
=======
    routePath: "notifications",
    mode: "mobile",
>>>>>>> f3954ae27701b905c72f4dd8505348a95f65cedc
  },
  {
    icon: "💬",
    label: "Messages",
    ariaLabel: "Messages",
    routePath: "messages",
  },
  { icon: "🏀", label: "Matches", ariaLabel: "Matches", routePath: "matches" },
  {
    icon: "🥅",
    label: "Facilities",
    ariaLabel: "Facilities",
    routePath: "facilities",
  },
  { icon: "👤", label: "Profile", ariaLabel: "Profile", routePath: "profile" },
];

function NavigationMenu() {
  return (
    <nav className={styles.navigationMenu}>
<<<<<<< HEAD
      {menuItems.map((item, index) => (
        <NavLink
          to={`/${item.routePath}`}
          className={({ isActive }) =>
            `${styles.menuItem} ${isActive ? styles.activeMenuItem : ""}`
          }
          style={{ textDecoration: "none", color: "inherit" }}
          key={index}
          aria-label={item.ariaLabel}
        >
          <span className={styles.menuIcon} role="img" aria-hidden="true">
            {item.icon}
          </span>
          <span className={styles.menuLabel}>{item.label}</span>
        </NavLink>
      ))}
=======
      {menuItems.map(
        (item, index) =>
          item.mode !== "mobile" && (
            <NavLink
              to={`/${item.routePath}`}
              className={({ isActive }) =>
                `${styles.menuItem} ${isActive ? styles.activeMenuItem : ""}`
              }
              style={{ textDecoration: "none", color: "inherit" }}
              key={index}
              aria-label={item.ariaLabel}
            >
              <span className={styles.menuIcon} role="img" aria-hidden="true">
                {item.icon}
              </span>
              <span className={styles.menuLabel}>{item.label}</span>
            </NavLink>
          )
      )}
>>>>>>> f3954ae27701b905c72f4dd8505348a95f65cedc
    </nav>
  );
}

export default NavigationMenu;
