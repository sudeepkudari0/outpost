import { LinkedInPublisher } from './linkedin-publisher';
import { TwitterPublisher } from './twitter-publisher';

const twitter = new TwitterPublisher();
const linkedin = new LinkedInPublisher();

export function getPublisher(platform: string) {
  const key = platform.toLowerCase();
  switch (key) {
    case 'twitter':
    case 'x':
      return twitter;
    case 'linkedin':
      return linkedin;
    default:
      return undefined;
  }
}
