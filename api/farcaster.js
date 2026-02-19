import { TwitterApi } from "twitter-api-v2";
import fetch from "node-fetch";

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
    const cast = req.body?.data;

    if (!cast) return res.status(200).end();
    if (cast.author?.fid !== 431880) return res.status(200).end();
    if (cast.parent_hash) return res.status(200).end();

    const text = cast.text.slice(0, 280);

    let mediaIds = [];

    if (cast.embeds && cast.embeds.length > 0) {
      for (const embed of cast.embeds) {
        if (embed.url && embed.url.match(/\.(jpg|jpeg|png|webp)$/i)) {
          const response = await fetch(embed.url);
          const buffer = await response.arrayBuffer();

          const mediaId = await twitterClient.v1.uploadMedia(
            Buffer.from(buffer),
            { type: "image" }
          );

          mediaIds.push(mediaId);
        }
      }
    }

    await twitterClient.v2.tweet({
      text,
      media: mediaIds.length ? { media_ids: mediaIds } : undefined,
    });

    return res.status(200).end();
  } catch (err) {
    console.error(err);
    return res.status(500).end();
  }
}