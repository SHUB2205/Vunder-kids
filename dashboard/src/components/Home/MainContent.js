import React from 'react';
import Post from './Post';
import styles from './MainContent.module.css';
import Header from './Header.js'
import MobileHeader from './MobileHeader.js'
const posts = [
  {
    id: 1,
    author: 'James',
    avatar: 'https://cdn.builder.io/api/v1/image/assets/TEMP/adeae94edd7ef84d923f8851b3b901f1932a7db3e730b894a133df1e869e9893?placeholderIfAbsent=true&apiKey=e09fb5b08d9f4994b2eb3fe94389b65e',
    time: '12 hours ago',
    content: 'Where champions are made and legends are born',
    image: 'https://cdn.builder.io/api/v1/image/assets/TEMP/b05e23be245b6164249d9042c362bc3f5577c052b0c0970cc2cc8c43e460e33f?placeholderIfAbsent=true&apiKey=e09fb5b08d9f4994b2eb3fe94389b65e',
    likes: 223
  },
];

function MainContent() {
  return (
    <>
    {/* <div className='seprater'> */}
    <main className={`${styles.mainContent}`}>
    <MobileHeader/>
    <Header/>
      {posts.map(post => (
        <Post key={post.id} {...post} />
      ))}
    </main>
      {/* </div> */}
      </>
  );
}

export default MainContent;