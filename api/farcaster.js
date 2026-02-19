import { TwitterApi } from "twitter-api-v2";

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {
    const cast = req.body.data;

    // Only your casts
    if (cast.author.fid !== 431880) {
      return res.status(200).end();
    }
    
    // Ignore replies
    if (cast.parent_hash) {
      return res.status(200).end();
    }

    const text = cast.text.slice(0, 280);

    await twitterClient.v2.tweet(text);

    return res.status(200).end();
  } catch (err) {
    console.error(err);
    return res.status(500).end();
  }
}