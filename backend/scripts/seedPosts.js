/**
 * Seed Script for Vunder Kids App
 * Creates 150+ posts with images/videos, profiles, and sport tags
 * 
 * Run: node scripts/seedPosts.js
 * Run with force reset: node scripts/seedPosts.js --force
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const bcrypt = require('bcryptjs');

// Check for force flag
const FORCE_RESET = process.argv.includes('--force');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vunderkids';

// Sports list with emojis
const SPORTS = [
  'Football', 'Basketball', 'Tennis', 'Cricket', 'Baseball',
  'Soccer', 'Golf', 'Swimming', 'Running', 'Cycling',
  'Boxing', 'MMA', 'Wrestling', 'Volleyball', 'Badminton',
  'Table Tennis', 'Hockey', 'Rugby', 'Skiing', 'Snowboarding',
  'Surfing', 'Skateboarding', 'Gymnastics', 'Athletics', 'Pickleball',
  'Padel', 'Squash', 'Lacrosse', 'Handball', 'Archery',
];

// Sample user profiles
const SAMPLE_USERS = [
  { name: 'Alex Thompson', userName: 'alex_sports', bio: 'Sports enthusiast | Basketball lover 🏀' },
  { name: 'Sarah Mitchell', userName: 'sarah_runs', bio: 'Marathon runner | Fitness coach 🏃‍♀️' },
  { name: 'Mike Johnson', userName: 'mike_tennis', bio: 'Tennis player | Grand Slam dreamer 🎾' },
  { name: 'Emma Davis', userName: 'emma_swim', bio: 'Competitive swimmer | Olympic hopeful 🏊‍♀️' },
  { name: 'James Wilson', userName: 'james_football', bio: 'Football fanatic | Weekend warrior ⚽' },
  { name: 'Olivia Brown', userName: 'olivia_yoga', bio: 'Yoga instructor | Wellness advocate 🧘‍♀️' },
  { name: 'Daniel Garcia', userName: 'dan_boxing', bio: 'Amateur boxer | Training daily 🥊' },
  { name: 'Sophia Martinez', userName: 'sophia_golf', bio: 'Golf enthusiast | Course explorer ⛳' },
  { name: 'Chris Anderson', userName: 'chris_cycling', bio: 'Cyclist | Mountain biker 🚴' },
  { name: 'Ava Taylor', userName: 'ava_volleyball', bio: 'Beach volleyball player | Sand lover 🏐' },
  { name: 'Ryan Lee', userName: 'ryan_mma', bio: 'MMA fighter | BJJ purple belt 🥋' },
  { name: 'Mia Robinson', userName: 'mia_gymnastics', bio: 'Gymnast | Flexibility goals 🤸‍♀️' },
  { name: 'Ethan Clark', userName: 'ethan_hockey', bio: 'Ice hockey player | Puck life 🏒' },
  { name: 'Isabella White', userName: 'bella_dance', bio: 'Dancer | Sports enthusiast 💃' },
  { name: 'Noah Harris', userName: 'noah_cricket', bio: 'Cricket player | Batting specialist 🏏' },
  { name: 'Charlotte Lewis', userName: 'char_skiing', bio: 'Skier | Mountain adventurer ⛷️' },
  { name: 'Liam Walker', userName: 'liam_surf', bio: 'Surfer | Wave chaser 🏄' },
  { name: 'Amelia Hall', userName: 'amelia_badminton', bio: 'Badminton player | Shuttle master 🏸' },
  { name: 'Mason Young', userName: 'mason_baseball', bio: 'Baseball player | Home run hitter ⚾' },
  { name: 'Harper King', userName: 'harper_athletics', bio: 'Track athlete | Speed demon 🏃' },
];

// Sample avatar URLs (using placeholder services)
const AVATAR_URLS = [
  'https://randomuser.me/api/portraits/men/1.jpg',
  'https://randomuser.me/api/portraits/women/1.jpg',
  'https://randomuser.me/api/portraits/men/2.jpg',
  'https://randomuser.me/api/portraits/women/2.jpg',
  'https://randomuser.me/api/portraits/men/3.jpg',
  'https://randomuser.me/api/portraits/women/3.jpg',
  'https://randomuser.me/api/portraits/men/4.jpg',
  'https://randomuser.me/api/portraits/women/4.jpg',
  'https://randomuser.me/api/portraits/men/5.jpg',
  'https://randomuser.me/api/portraits/women/5.jpg',
  'https://randomuser.me/api/portraits/men/6.jpg',
  'https://randomuser.me/api/portraits/women/6.jpg',
  'https://randomuser.me/api/portraits/men/7.jpg',
  'https://randomuser.me/api/portraits/women/7.jpg',
  'https://randomuser.me/api/portraits/men/8.jpg',
  'https://randomuser.me/api/portraits/women/8.jpg',
  'https://randomuser.me/api/portraits/men/9.jpg',
  'https://randomuser.me/api/portraits/women/9.jpg',
  'https://randomuser.me/api/portraits/men/10.jpg',
  'https://randomuser.me/api/portraits/women/10.jpg',
];

// Sports-specific image URLs (using Unsplash)
const SPORTS_IMAGES = {
  Football: [
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800',
    'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800',
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800',
  ],
  Basketball: [
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
    'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=800',
    'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800',
  ],
  Tennis: [
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800',
    'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800',
    'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800',
  ],
  Soccer: [
    'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800',
    'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
  ],
  Swimming: [
    'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800',
    'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=800',
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',
  ],
  Running: [
    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800',
    'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800',
    'https://images.unsplash.com/photo-1486218119243-13883505764c?w=800',
  ],
  Cycling: [
    'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800',
    'https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=800',
  ],
  Golf: [
    'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800',
    'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800',
    'https://images.unsplash.com/photo-1592919505780-303950717480?w=800',
  ],
  Boxing: [
    'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800',
    'https://images.unsplash.com/photo-1517438322307-e67111335449?w=800',
    'https://images.unsplash.com/photo-1495555687398-3f50d6e79e1e?w=800',
  ],
  Volleyball: [
    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800',
    'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=800',
    'https://images.unsplash.com/photo-1592656094267-764a45160876?w=800',
  ],
  default: [
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800',
    'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=800',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800',
  ],
};

// Sample video URLs (using sample video services)
const VIDEO_URLS = [
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
];

// Post content templates by sport
const POST_TEMPLATES = {
  Football: [
    "What an incredible game today! 🏈 The team really showed up when it mattered most.",
    "Practice makes perfect! Working on my throwing technique today. 🎯",
    "Game day vibes! Let's go team! 🏟️",
    "Nothing beats the feeling of a touchdown! 🙌",
    "Training hard for the upcoming season. No days off! 💪",
  ],
  Basketball: [
    "Nothing but net! 🏀 Working on my three-pointers today.",
    "Court session was intense! Love this game! 🔥",
    "Hoops life is the best life! Who's ready to play? 🏀",
    "Dribble, shoot, score! That's the rhythm! 🎯",
    "Late night practice paying off! 💯",
  ],
  Tennis: [
    "Ace! 🎾 Perfect serve today on the court.",
    "Working on my backhand. Getting better every day! 💪",
    "Love the sound of the ball hitting the sweet spot! 🎾",
    "Tennis is life! Anyone up for a match? 🏆",
    "Early morning practice session. The court is calling! ☀️",
  ],
  Soccer: [
    "Goal! ⚽ What a beautiful strike!",
    "Training with the team today. Chemistry is building! 🤝",
    "The beautiful game never gets old! ⚽",
    "Working on my footwork. Precision is key! 🎯",
    "Match day ready! Let's bring home the win! 🏆",
  ],
  Swimming: [
    "New personal best in the pool today! 🏊‍♂️",
    "Early morning laps. Nothing beats the water! 💧",
    "Working on my butterfly stroke. It's getting smoother! 🦋",
    "Pool time is the best time! 🏊",
    "Swim, eat, sleep, repeat! 💪",
  ],
  Running: [
    "Just finished a 10K! Feeling accomplished! 🏃‍♂️",
    "Morning run done! Best way to start the day! ☀️",
    "Training for the marathon. One mile at a time! 🎯",
    "Runner's high is real! 🏃‍♀️",
    "New route, new challenges! Love exploring while running! 🌍",
  ],
  Cycling: [
    "50 miles today! The views were incredible! 🚴",
    "Mountain biking adventure! Nature is amazing! 🏔️",
    "Pedal power! Nothing beats cycling through the countryside! 🌾",
    "New bike day! Can't wait to test it out! 🚲",
    "Group ride was epic today! Great community! 🤝",
  ],
  Golf: [
    "Hole in one! ⛳ Best day on the course!",
    "Working on my swing. Getting more consistent! 🏌️",
    "Beautiful day for 18 holes! ☀️",
    "Golf is meditation in motion! 🧘",
    "Putting practice paying off! 🎯",
  ],
  Boxing: [
    "Sparring session was intense! 🥊 Getting sharper!",
    "Heavy bag work today. Building power! 💪",
    "Float like a butterfly, sting like a bee! 🦋🐝",
    "Training camp mode activated! 🥊",
    "Defense wins fights! Working on my footwork! 👣",
  ],
  Volleyball: [
    "Beach volleyball vibes! 🏐 Perfect weather for a game!",
    "Spike! Nothing more satisfying! 💥",
    "Team practice was amazing today! Great energy! ⚡",
    "Working on my serves. Consistency is key! 🎯",
    "Sand, sun, and volleyball! Paradise! 🏖️",
  ],
  default: [
    "Great workout today! Feeling stronger! 💪",
    "Sports bring people together! Love this community! 🤝",
    "Training hard, staying focused! 🎯",
    "Another day, another opportunity to improve! 📈",
    "Passion + dedication = success! 🏆",
    "Early bird gets the gains! Morning workout done! ☀️",
    "Rest day is important too! Recovery mode! 😴",
    "Setting new goals and crushing them! 🎯",
    "The grind never stops! Let's go! 🔥",
    "Grateful for this journey! Sports changed my life! ❤️",
  ],
};

// Helper functions
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const getImageForSport = (sport) => {
  const images = SPORTS_IMAGES[sport] || SPORTS_IMAGES.default;
  return getRandomItem(images);
};

const getContentForSport = (sport) => {
  const templates = POST_TEMPLATES[sport] || POST_TEMPLATES.default;
  return getRandomItem(templates);
};

// Main seed function
async function seedDatabase() {
  try {
    console.log('🚀 Starting database seed...');
    console.log('📡 Connecting to MongoDB...');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create users
    console.log('\n👥 Creating users...');
    const createdUsers = [];
    const hashedPassword = await bcrypt.hash('password123', 10);

    for (let i = 0; i < SAMPLE_USERS.length; i++) {
      const userData = SAMPLE_USERS[i];
      
      // Check if user already exists
      let user = await User.findOne({ userName: userData.userName });
      
      if (!user) {
        user = new User({
          name: userData.name,
          userName: userData.userName,
          email: `${userData.userName}@vunderkids.com`,
          password: hashedPassword,
          bio: userData.bio,
          avatar: AVATAR_URLS[i],
          isVerified: true,
          sports: [getRandomItem(SPORTS), getRandomItem(SPORTS)],
        });
        await user.save();
        console.log(`  ✅ Created user: ${userData.userName}`);
      } else {
        console.log(`  ⏭️ User exists: ${userData.userName}`);
      }
      
      createdUsers.push(user);
    }

    console.log(`\n📊 Total users: ${createdUsers.length}`);

    // Create posts
    console.log('\n📝 Creating posts...');
    let postsCreated = 0;
    const targetPosts = 160;

    // Check existing posts count
    const existingPosts = await Post.countDocuments();
    console.log(`  📊 Existing posts: ${existingPosts}`);

    // Force reset if flag is set
    if (FORCE_RESET) {
      console.log('  🗑️ Force reset enabled - deleting seeded posts...');
      await Post.deleteMany({ creator: { $in: createdUsers.map(u => u._id) } });
      console.log('  ✅ Seeded posts deleted');
    }

    const currentPosts = FORCE_RESET ? 0 : existingPosts;
    
    if (currentPosts >= targetPosts) {
      console.log('  ⏭️ Sufficient posts already exist. Skipping post creation.');
    } else {
      const postsToCreate = targetPosts - currentPosts;
      console.log(`  🎯 Creating ${postsToCreate} new posts...`);

      for (let i = 0; i < postsToCreate; i++) {
        const creator = getRandomItem(createdUsers);
        const sport = getRandomItem(SPORTS);
        const isVideo = Math.random() < 0.15; // 15% chance of video
        
        const postData = {
          creator: creator._id,
          content: getContentForSport(sport),
          sport: sport,
          mediaType: isVideo ? 'video' : 'image',
          mediaURL: isVideo ? getRandomItem(VIDEO_URLS) : getImageForSport(sport),
          likes: getRandomNumber(0, 150),
          likedBy: [],
          comments: [],
          tags: [sport.toLowerCase()],
          isArchived: false,
          createdAt: new Date(Date.now() - getRandomNumber(0, 30 * 24 * 60 * 60 * 1000)), // Random date within last 30 days
        };

        const post = new Post(postData);
        await post.save();
        postsCreated++;

        if (postsCreated % 20 === 0) {
          console.log(`  📝 Created ${postsCreated}/${postsToCreate} posts...`);
        }
      }
    }

    // Summary
    const totalPosts = await Post.countDocuments();
    const totalUsers = await User.countDocuments();
    
    // Get sport distribution
    const sportDistribution = await Post.aggregate([
      { $match: { sport: { $exists: true, $ne: null } } },
      { $group: { _id: '$sport', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    console.log('\n' + '='.repeat(50));
    console.log('📊 SEED COMPLETE - SUMMARY');
    console.log('='.repeat(50));
    console.log(`👥 Total Users: ${totalUsers}`);
    console.log(`📝 Total Posts: ${totalPosts}`);
    console.log(`🆕 Posts Created This Run: ${postsCreated}`);
    console.log('\n🏆 Top Sports by Posts:');
    sportDistribution.forEach((sport, idx) => {
      console.log(`   ${idx + 1}. ${sport._id}: ${sport.count} posts`);
    });
    console.log('='.repeat(50));

    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');
    console.log('🎉 Seed completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed
seedDatabase();
