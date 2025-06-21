import { ReactNodeRenderer } from "@task-manager/tiptap-plugin-file-renderer";
import VideoPlayer from "@task-manager/video-player";

const VideoRenderer: ReactNodeRenderer = ({ HTMLAttributes }) => {
	return <VideoPlayer controls src={HTMLAttributes.src} />;
};

export default VideoRenderer;

