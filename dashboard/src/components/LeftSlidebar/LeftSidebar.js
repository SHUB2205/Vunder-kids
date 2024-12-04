import React, { useEffect, useRef } from "react";
import { useMediaQuery } from "react-responsive";
import Logo from "./Logo";
import NavigationMenu from "./NavigationMenu";
import UserStats from "./UserStats";
import styles from "./LeftSidebar.module.css";
import { useLocation } from "react-router-dom";

function Sidebar() {
  const sidebarRef = useRef(null);
  const location = useLocation();

  // Media query to detect max-width: 991px
  const isMobileView = useMediaQuery({ query: "(max-width: 991px)" });

  const handleScroll = (e) => {
    if (sidebarRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = sidebarRef.current;

      // Prevent default scroll behavior when scroll reaches end or start
      if (
        (scrollTop === 0 && e.deltaY < 0) ||
        (scrollTop + clientHeight >= scrollHeight && e.deltaY > 0)
      ) {
        e.preventDefault();
      }
    }
  };

  useEffect(() => {
    const sidebarElement = sidebarRef.current;

    if (sidebarElement) {
      // Attach the wheel event listener with { passive: false }
      sidebarElement.addEventListener("wheel", handleScroll, { passive: false });

      // Cleanup the listener on component unmount
      return () => {
        sidebarElement.removeEventListener("wheel", handleScroll);
      };
    }
  }, []);

  // Check if the current route is `/home/comment`
  const isCommentRoute = location.pathname === "/home/comment";

  return (
    <aside className={styles.sidebar} ref={sidebarRef}>
      <Logo />
      {/* Conditionally hide navigation menu and user stats */}
      {!(isCommentRoute && isMobileView) && (
        <>
          <NavigationMenu />
          <UserStats />
        </>
      )}
    </aside>
  );
}

export default Sidebar;
