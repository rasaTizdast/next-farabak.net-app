type Props = { url: string };

const VideoPlayer = ({ url }: Props) => {
  return (
    <div className="mx-auto my-8 flex w-full flex-col items-center px-4">
      <div className="h-[2px] w-full bg-[#969696]"></div>
      <h1 className="mb-8 self-start text-[1.1rem] md:self-center">کلیپ معرفی پروژه</h1>
      <video className="h-auto w-full max-w-[1100px] rounded-lg" controls>
        <source src={url} type="video/mp4" />
      </video>
    </div>
  );
};

export default VideoPlayer;
