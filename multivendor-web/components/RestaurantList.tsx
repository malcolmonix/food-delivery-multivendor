import React from 'react';
import styles from '../styles/RestaurantList.module.css';

export default function RestaurantList() {
  return (
    <div className={styles.restaurantList}>
      <h2>All Restaurants</h2>
      <div className={styles.list}>
        <div className={styles.card}>Restaurant 1</div>
        <div className={styles.card}>Restaurant 2</div>
        <div className={styles.card}>Restaurant 3</div>
      </div>
    </div>
  );
}
