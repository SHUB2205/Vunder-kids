import React, { useRef } from 'react';
import Logo from './Logo';
import NavigationMenu from './NavigationMenu';
import UserStats from './UserStats';
import styles from './LeftSidebar.module.css';

function Sidebar() {
  const sidebarRef = useRef(null);

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

  return (
    <>


    <aside
      className={styles.sidebar}
      ref={sidebarRef}
      onWheel={handleScroll} /* Detect wheel scroll event */
    >
      <Logo />
      <NavigationMenu />
      <UserStats />
    </aside>


    </>

  );
}

export default Sidebar;
