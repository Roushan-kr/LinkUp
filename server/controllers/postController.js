import fs from 'fs';
//import Post from '../models/Post.js';
import imageKit from '../configs/imageKit.js';
import Post from '../models/Post.js';
import User from '../models/User.js';

//add post

export const addPost = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { content, post_type } = req.body;
    const images = req?.files;

    let image_urls = [];
    if (images.length) {
      image_urls = await Promise.all(
        images.map(async (image) => {
          const fileBuffer = fs.readFileSync(image.path);
          const response = await imageKit.upload({
            file: fileBuffer,
            fileName: image.originalname,
            folder: 'posts',
          });
          const url = imageKit.url({
            path: response.filePath,
            transformation: [
              { quality: 'auto' },
              { format: 'webp' },
              { width: '1280' },
            ],
          });
          return url;
        })
      );
    }
    await Post.create({
      user: userId,
      content,
      image_urls,
      post_type,
    });
    res.json({ success: true, message: 'Post created successfully' });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//get posts
export const getFeedPosts = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const user = await User.findById(userId);

    const limits = parseInt(req.query.limits) || 20;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limits;

    //user connections and followings
    const userIds = [userId, ...user.connections, ...user.following];
    const posts = await Post.find({ user: { $in: userIds } })
      .populate({ path: 'user', select: 'name avatar' })
      .sort('-createdAt')
      .skip(skip)
      .limit(limits)
      .lean();
    res.json({ success: true, posts });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// like post
export const likePost = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { postId } = req.body;
    const post = await Post.findById(postId);

    const liked = post.likes_count.includes(userId);
    post.likes_count = liked
      ? post.likes_count.filter((user) => user !== userId)
      : [...post.likes_count, userId];
    await post.save();

    res.json({ success: true, message: liked ? 'post unliked' : 'post liked' });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
