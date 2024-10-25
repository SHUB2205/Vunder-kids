import React from 'react';
import { SportTag } from './SportTag';
import { VenueCard } from './VenueCard';
import styles from './Facilities.module.css';

const sports = ['Volleyball', 'Tennis', 'Tennis', 'Tennis', 'Tennis', 'Tennis'];
const timeSlots = ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM'];
const venue = {
  name: 'Volley Central',
  price: '10',
  imageUrl: 'https://s3-alpha-sig.figma.com/img/ec19/8f99/94dc548bc24d485a79caaa637a4c7a7c?Expires=1730678400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=IVTW2sVv2oqimyqTzGVJlj0~yKWDmPY1POlRUoIbdD6yvWJLGXYtiuwN2G1hWUplSzBFe5W1CfE-mJ6Z8~vLJr0XVZjff1Txsj4HBIJ2sWpAZBNkqInZGQ0aF562-OBdTAjKKSJZpvGUH6umYbgn1LWTeHZNxQHFK4JKt~KOTTL7g6M4nQVb-aUt1heKmwQJhiS0IX4YrCz2BzJQQiimppBsJjZTGkSFOGcFsAiaXBoFUz0rdbedNWatS7etd6c5EOsV03BZBRy0J4jUj0NCsqoldeLvD5RDQBjDfT8Ra1c0I9GO8pThWYXVYIET0f1ekCW3O1b~GKZzMKnsmLAgGw__'
};
  
export const FacilitiesLayout = () => {
  return (
    <main className={styles.facilities}>
      <div className={styles.searchContainer}>
        <div className={styles.searchBar}>
          <div className={styles.searchInputWrapper}>
            <img 
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/08978e937db1f373693796907e8ef51a6bb47d96a0edb1c297bdddcb3682421d?placeholderIfAbsent=true&apiKey=b883bcf213724f38a6f53982628f709c" 
              alt="Search icon" 
              className={styles.icon} 
            />
            <input placeholder='Search'></input>
          </div>
          <img 
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/f1d65db84e78f223849f2aa378ff6ecc47f670c0bba2629f7c57bfceee789fe4?placeholderIfAbsent=true&apiKey=b883bcf213724f38a6f53982628f709c" 
            alt="Filter icon" 
            className={styles.filterIcon} 
          />
        </div>
        
        <section className={styles.filterSection}>
          <nav className={styles.locationNav}>
            <img 
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/7ea445b3fb70732f780edca26d37d8acdd146e9761b0c92fc9bcf170eabd0962?placeholderIfAbsent=true&apiKey=b883bcf213724f38a6f53982628f709c" 
              alt="Location icon" 
              className={styles.locationIcon} 
            />
            <span>Jacksonville, USA</span>
          </nav>
          
          <time className={styles.dateTime}>
            13 Sep | 10 AM - 12 PM
          </time>
          
          <div className={styles.sportsList}>
            {sports.map((sport, index) => (
              <SportTag 
                key={index}
                name={sport}
                isActive={index === 0}
              />
            ))}
          </div>
        </section>
        
        <section className={styles.venueContainer}>
          <VenueCard 
            venue={venue}
            timeSlots={timeSlots}
          />
          <VenueCard 
            venue={venue}
            timeSlots={timeSlots}
          />
          <VenueCard 
            venue={venue}
            timeSlots={timeSlots}
          />
        </section>
      </div>
    </main>
  );
};
