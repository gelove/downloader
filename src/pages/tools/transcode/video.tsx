import { Media } from "@/config/constant";
import { MediaList } from "@/pages/tools/transcode/media-list";

export default function Video() {
  return <MediaList kind={Media.Video} />;
}
