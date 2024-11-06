import styles from "./VideoPlayer.module.css"; // CSS file for styling

type Props = { url: string };

const VideoPlayer = ({ url }: Props) => {
  return (
    <div className={styles.video_container}>
      <div className={styles.line}></div>
      <h1>کلیپ معرفی پروژه</h1>
      <video
        className={styles.custom_video}
        controls // Shows video controls
      >
        <source src={url} type="video/mp4" />
      </video>
    </div>
  );
};

export default VideoPlayer;
