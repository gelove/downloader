import { Media } from "@/config/constant";
import { MediaList } from "@/pages/tools/transcode/media-list";

export default function Audio() {
  return <MediaList kind={Media.Audio} />;
}
