type Props = { url: string };

const VideoPlayer = ({ url }: Props) => {
  return (
    <section
      aria-labelledby="project-video-title"
      className="mx-auto mt-10 flex w-full flex-col items-center border-t border-slate-200 pt-8"
    >
      <h2
        id="project-video-title"
        className="mb-6 self-start text-xl font-bold text-(--farabak-ink-deep) md:self-center"
      >
        ویدیوی ثبت‌شده پروژه
      </h2>
      <video className="h-auto w-full max-w-[1100px] rounded-2xl" controls preload="metadata">
        <source src={url} type="video/mp4" />
      </video>
    </section>
  );
};

export default VideoPlayer;
