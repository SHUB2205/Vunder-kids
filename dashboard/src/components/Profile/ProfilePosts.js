import React from 'react';
import Post from '../Home/Post';
import './ProfilePosts.css';

function ProfilePosts() {
    const photo_url = "https://s3-alpha-sig.figma.com/img/ba6b/ae19/01d54ee30a92d542fa96c191010906c1?Expires=1730678400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=EU41ZHvv5kIVOAASwJeDg6iXBtTxJA2YLxjoIGHcPLBM8~L74pQkFwC~7Pldql-Tg7SODQXF4U73hMM3XYf2oc9mnPVi8NHbMg9VnRSaASwbic-PRz3VUWHSE8MCiB3vU2rmcfgjljk-So0RWuRYUM-odklUe6t1vxj4Uu6d39L~DgHtYi4hLwQ84GEVo3NXnwn5EvW1AxSMKI9~OYGtqkaL~xdGp3yLJh4JoyxAd7XU1bAKUFU9vLi9xmt-lzX0B-MUw8W1fqQ6rdFb9eOyfj79hla3YOiXGIWLagjNj6-DJYxDQzvptR~Oqfl3VxC9F30I4wMy~mBbcjR6J8kuag__";
    const posts = [
        { author: "Author 100000000000", avatar: photo_url, time: "1 hr ago", content: "This is post content 1", image: photo_url, likes: 12 },
        { author: "Author 2", avatar: "avatar2.jpg", time: "2 hrs ago", content: "This is post content 2", image: "image2.jpg", likes: 34 },
        { author: "Author 3", avatar: "avatar3.jpg", time: "3 hrs ago", content: "This is post content 300000000000000000", image: "image3.jpg", likes: 27 },
        { author: "Author 4", avatar: "avatar4.jpg", time: "4 hrs ago", content: "This is post content 4", image: "image4.jpg", likes: 45 },
        { author: "Author 5", avatar: photo_url, time: "5 hrs ago", content: "This is post content 5", image: photo_url, likes: 21 },
        { author: "Author 6", avatar: photo_url, time: "6 hrs ago", content: "This is post content 6", image: photo_url, likes: 18 }
    ];

    return (
        <div className="profilePostsContainer">
            {posts.map((post, index) => (
                <Post
                    key={index}
                    author={post.author.length>16 ? post.author.slice(0,15) + "..." : post.author}
                    avatar={post.avatar}
                    time={post.time}
                    content={post.content.length > 30 ? post.content.slice(0, 30) + "..." : post.content}
                    image={post.image}
                    likes={post.likes}
                />
            ))}
        </div>
    );
}

export default ProfilePosts;
