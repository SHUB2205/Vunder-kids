import React from 'react';
import Post from '../Home/Post';
import './ProfilePhotos.css';

function ProfilePosts() {
    const photo_url = "https://s3-alpha-sig.figma.com/img/ba6b/ae19/01d54ee30a92d542fa96c191010906c1?Expires=1730678400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=EU41ZHvv5kIVOAASwJeDg6iXBtTxJA2YLxjoIGHcPLBM8~L74pQkFwC~7Pldql-Tg7SODQXF4U73hMM3XYf2oc9mnPVi8NHbMg9VnRSaASwbic-PRz3VUWHSE8MCiB3vU2rmcfgjljk-So0RWuRYUM-odklUe6t1vxj4Uu6d39L~DgHtYi4hLwQ84GEVo3NXnwn5EvW1AxSMKI9~OYGtqkaL~xdGp3yLJh4JoyxAd7XU1bAKUFU9vLi9xmt-lzX0B-MUw8W1fqQ6rdFb9eOyfj79hla3YOiXGIWLagjNj6-DJYxDQzvptR~Oqfl3VxC9F30I4wMy~mBbcjR6J8kuag__";
    const posts = [
        {image: photo_url},
        {image: photo_url},
        {image: photo_url},
        {image: photo_url},
        {image: photo_url},
        {image: photo_url}
    ];

    return (
        <div className="profilePhotosContainer">
            {posts.map((post, index) => (
                <img src={post.image} alt={`image-${index}`}/>
            ))}
        </div>
    );
}

export default ProfilePosts;
