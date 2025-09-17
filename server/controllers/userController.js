import imagekit from '../configs/imageKit.js';
import Connection from '../models/Connection.js';
import User from '../models/User.js';
import fs from 'fs';

export const getUserData = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//update user data

export const updateUserData = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { username, bio, location, full_name } = req.body;

    const updateData = {
      username,
      bio,
      location,
      full_name,
    };
    const profile = req?.files?.profile && req?.files?.profile[0];
    const cover = req?.files?.cover && req?.files?.cover[0];
    if (profile) {
      const buffer = fs.readFileSync(profile.path);
      const response = await imagekit.upload({
        file: buffer,
        fileName: profile.originalname,
      });
      const url = imagekit.url({
        path: response.filePath,
        transformation: [
          { quality: 'auto' },
          { format: 'webp' },
          { width: '512' },
        ],
      });
      updateData.profile_picture = url;
    }

    if (cover) {
      const buffer = fs.readFileSync(cover.path);
      const response = await imagekit.upload({
        file: buffer,
        fileName: profile.originalname,
      });
      const url = imagekit.url({
        path: response.filePath,
        transformation: [
          { quality: 'auto' },
          { format: 'webp' },
          { width: '1280' },
        ],
      });
      updateData.cover_photo = url;
    }
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });
    res.json({ success: true, user, message: 'profile updated successfully' });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// find users using username , email, location

export const discoverUsers = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { input } = req.body;

    const allUsers = await User.find({
      $or: [
        {
          username: new RegExp(input, 'i'),
        },
        {
          email: new RegExp(input, 'i'),
        },
        {
          full_name: new RegExp(input, 'i'),
        },
        {
          location: new RegExp(input, 'i'),
        },
      ],
    });
    // not sending self
    const filteredUsers = allUsers.filter((user) => user._id !== userId);
    res.json({ success: false, users: filteredUsers });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//follow users

export const followUser = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { id } = req.body;

    const user = await User.findById(userId);
    if (user.following.includes(id)) {
      return res.json({
        success: false,
        message: 'You are already following this user',
      });
    }
    user.following.push(id);
    await user.save();

    const toUser = await User.findById(id);
    toUser.followers.push(userId);
    await toUser.save();

    res.json({ success: true, message: `followed ${toUser.username}` });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// unfollow user
export const unfollowUser = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { id } = req.body;

    const user = await User.findById(userId);
    await User.updateOne({ _id: userId }, { $pull: { following: id } });
    await user.save();

    const toUser = await User.findById(id);
    await User.updateOne({ _id: id }, { $pull: { followers: userId } });
    await toUser.save();

    res.json({ success: true, message: `unfollowed ${toUser.username}` });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//send connection request
export const sendConnectionRequest = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { id } = req.body;

    //check if user has sent more than 20 requests today
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const connectionRequests = await Connection.find({
      from_user_id: userId,
      createdAt: { $gte: last24Hours },
    });
    if (connectionRequests.length >= 20) {
      return res.json({
        success: false,
        message: 'You have reached the limit of 20 connection requests per day',
      });
    }

    // check if connection request already exists
    const connection = await Connection.findOne({
      $or: [
        { from_user_id: userId, to_user_id: id },
        { from_user_id: id, to_user_id: userId },
      ],
    });
    if (!connection) {
      await Connection.create({
        from_user_id: userId,
        to_user_id: id,
      });
      return res.json({
        success: true,
        message: 'Connection request sent successfully',
      });
    } else  if (connection && connection.status === 'accepted') {
      return res.json({
        success: false,
        message: `already connected with ${id}`,
      });
    } else {
      return res.json({
        success: false,
        message: 'Connection request already sent',
      });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//get user connections
export const getUserConnections = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const user = await User.findById(userId).populate(
      'connections followers following'
    );

    const connections = user.connections;
    const followers = user.followers;
    const following = user.following;

    const pendingConnections = (
      await Connection.find({ to_user_id: userId, status: 'pending' }).populate(
        'from_user_id'
      )
    ).map((connection) => connection.from_user_id);
    res.json({
      success: true,
      connections,
      followers,
      following,
      pendingConnections,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//accept connection request
export const acceptConnectionRequest = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { id } = req.body;

    const connection = await Connection.findOne({
      from_user_id: id,
      to_user_id: userId,
    });
    if (!connection) {
      return res.json({ success: false, message: 'unavailable connection' });
    }
    const user = await User.findById(userId);
    user.connections.push(id);
    await user.save();

    const toUser = await User.findById(id);
    toUser.connections.push(userId);
    await toUser.save();

    connection.status = 'accepted';
    await connection.save();
    res.json({ success: true, message: 'connection accepted successfully' });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
