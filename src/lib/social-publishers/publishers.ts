import { LinkedInPublisher } from './linkedin-publisher';
import { InstagramPublisher } from './meta/instagram-publisher';
import { TwitterPublisher } from './twitter-publisher';

const twitter = new TwitterPublisher();
const linkedin = new LinkedInPublisher();
const instagram = new InstagramPublisher();

export function getPublisher(platform: string) {
  const key = platform.toLowerCase();
  switch (key) {
    case 'twitter':
    case 'x':
      return twitter;
    case 'linkedin':
      return linkedin;
    case 'instagram':
      return instagram;
    default:
      return undefined;
  }
}
