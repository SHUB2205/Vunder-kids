const Group = require('../models/Group');
const User = require('../models/User');

exports.getRecommendedCommunities = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Recommendation criteria
    const recommendationCriteria = {
      $or: [
        // Communities with same industry
        { industry: user.industry },
        // Communities with matching passions
        { 
          passions: { 
            $elemMatch: { 
              name: { $in: user.passions.map(p => p.name) } 
            } 
          } 
        },
        // Communities in same location
        { location: user.location }
      ],
      // Exclude communities user is already a member of
      _id: { $nin: user.groups }
    };

    const recommendedCommunities = await Group.find(recommendationCriteria)
      .populate('createdBy', 'name avatar')
      .limit(5);

    // Transform the communities to include member count
    const formattedCommunities = await Promise.all(
      recommendedCommunities.map(async (community) => ({
        id: community._id,
        name: community.name,
        description: community.description,
        avatar: community.avatar,
        industry: community.industry,
        memberCount: community.members.length,
        createdBy: {
          name: community.createdBy.name,
          avatar: community.createdBy.avatar
        },
        passions: community.passions,
        location: community.location
      }))
    );

    res.json(formattedCommunities);
  } catch (error) {
    console.error("Error fetching recommended communities:", error);
    res.status(500).json({ message: "Error fetching recommended communities" });
  }
};

exports.getCommunities = async (req, res) => {
  try {
    const communities = await Group.find()
      .populate('createdBy', 'name avatar')
      .limit();
    res.json(communities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching communities', error });
  }
}

exports.joinCommunity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { communityId } = req.params;

    const community = await Group.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Check if user is already a member
    if (community.members.includes(userId)) {
      return res.status(400).json({ message: "Already a member of this community" });
    }

    // If community is public, directly add user
    if (community.privacy === 'public') {
      community.members.push(userId);
      await community.save();

      // Add community to user's groups
      await User.findByIdAndUpdate(userId, {
        $push: { groups: communityId }
      });

      return res.status(200).json({ message: "Joined community successfully" });
    }

    // If private, add join request
    community.joinRequests.push({ 
      user: userId, 
      status: 'pending' 
    });
    await community.save();

    res.status(200).json({ message: "Join request sent" });
  } catch (error) {
    console.error("Error joining community:", error);
    res.status(500).json({ message: "Error joining community" });
  }
};

exports.getCommunityDetails = async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.user.id;

    const community = await Group.findById(communityId)
      .populate({
        path: 'members',
        select: 'name avatar industry passions'
      })
      .populate({
        path: 'admins',
        select: 'name avatar industry passions'
      })
      .populate('createdBy', 'name avatar');

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const isAdmin = community.admins.some(admin => admin._id.toString() === userId);
    const isMember = community.members.some(member => member._id.toString() === userId);

    const formattedCommunity = {
      _id: community._id,
      name: community.name,
      description: community.description,
      avatar: community.avatar,
      industry: community.industry,
      location: community.location,
      passions: community.passions,
      privacy: community.privacy,
      memberCount: community.members.length,
      createdBy: {
        name: community.createdBy.name,
        avatar: community.createdBy.avatar
      },
      members: community.members.map(member => ({
        id: member._id,
        name: member.name,
        avatar: member.avatar,
        industry: member.industry,
        passions: member.passions
      })),
      admins: community.admins.map(admin => ({
        id: admin._id,
        name: admin.name,
        avatar: admin.avatar,
        industry: admin.industry,
        passions: admin.passions
      })),
      userRole: isAdmin ? 'admin' : (isMember ? 'member' : 'non-member')
    };

    res.json(formattedCommunity);
  } catch (error) {
    console.error("Error fetching community details:", error);
    res.status(500).json({ message: "Error fetching community details" });
  }
};

exports.getJoinedCommunities = async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId).populate({
        path: 'groups',
        select: 'name avatar members description industry location'
      });
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Transform communities data
      const joinedCommunities = user.groups.map(community => ({
        id: community._id,
        name: community.name,
        avatar: community.avatar,
        memberCount: community.members ? community.members.length : 0,
        description: community.description,
        industry: community.industry,
        location: community.location
      }));
  
      res.json(joinedCommunities);
    } catch (error) {
      console.error("Error fetching joined communities:", error);
      res.status(500).json({ message: "Error fetching joined communities" });
    }
  };
  
exports.createCommunity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      name, 
      description, 
      industry, 
      location, 
      passions, 
      privacy = 'public' 
    } = req.body;

    const newCommunity = new Group({
      name,
      description,
      createdBy: userId,
      industry,
      location,
      passions,
      privacy,
      members: [userId],
      admins: [userId]
    });

    await newCommunity.save();

    // Add community to user's groups
    await User.findByIdAndUpdate(userId, {
      $push: { groups: newCommunity._id }
    });

    res.status(201).json({
      message: "Community created successfully",
      community: {
        id: newCommunity._id,
        name: newCommunity.name,
        description: newCommunity.description
      }
    });
  } catch (error) {
    console.error("Error creating community:", error);
    res.status(500).json({ message: "Error creating community" });
  }
};  