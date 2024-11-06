import React from 'react';
import styles from './SearchItem.module.css';
import labelSearchIcon from '../images/labelSearchIcon.png';

const SearchItem = ({ src, label }) => {
    return (
        <div className={styles.imageCard}>
            <img src={src} alt={label} className={styles.image} />
            <div className={styles.label}>
                {label}
                <img src={labelSearchIcon} alt="icon" className={styles.icon} />
            </div>
        </div>
    );
};

export default SearchItem;



// import React from 'react';
// import styles from './SearchItem.module.css';
// import labelSearchIcon from '../images/labelSearchIcon.png';

// const SearchItem = ({ src, label }) => {
//     return (
//         <div className={styles.imageCard}>
//             <img src={src} alt={label} className={styles.image} />
//             <div className={styles.labelContainer}>
//                 {label} <img src={labelSearchIcon} alt="icon" className={styles.icon} />
//             </div>
//         </div>
//     );
// };

// export default SearchItem;

