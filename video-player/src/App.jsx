import { useState, useRef, useEffect } from "react";
import "./App.css";

const VideoPlayer = ({ video, onTimeUpdate, onVideoEnd }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const videoElement = videoRef.current;

    const handleLoadedMetadata = () => {
      if (videoElement.duration) {
        setDuration(videoElement.duration);
        videoElement.currentTime = video.lastPlayedTime || 0;
        const initialPercentage =
          ((video.lastPlayedTime || 0) / videoElement.duration) * 100;
        setProgress(initialPercentage);
      }
    };

    const handleTimeUpdate = () => {
      if (videoElement.duration && !isNaN(videoElement.duration)) {
        const currentTime = videoElement.currentTime;
        const percentage = (currentTime / videoElement.duration) * 100;
        setProgress(percentage);
        onTimeUpdate(video.id, currentTime, percentage);
      }
    };

    const handleVideoEnd = () => {
      setIsPlaying(false);
      onVideoEnd(video.id);
    };

    if (videoElement) {
      videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
      videoElement.addEventListener("timeupdate", handleTimeUpdate);
      videoElement.addEventListener("ended", handleVideoEnd);
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener(
          "loadedmetadata",
          handleLoadedMetadata
        );
        videoElement.removeEventListener("timeupdate", handleTimeUpdate);
        videoElement.removeEventListener("ended", handleVideoEnd);
      }
    };
  }, [video, onTimeUpdate, onVideoEnd]);

  const togglePlay = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play().catch((e) => console.error("Play error:", e));
    }
    setIsPlaying(!isPlaying);
  };

  const skip = (seconds) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    videoElement.currentTime = Math.max(
      0,
      Math.min(videoElement.currentTime + seconds, videoElement.duration)
    );
  };

  const handleSliderChange = (e) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const newValue = e.target.value;
    const newTime = (newValue / 100) * videoElement.duration;
    videoElement.currentTime = newTime;
    setProgress(newValue);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="video-player-container">
      <div className="video-wrapper">
        <video
          ref={videoRef}
          src={video.src}
          onClick={togglePlay}
          className="video-element"
        />
      </div>

      <div className="video-controls">
        <div className="controls-wrapper">
          <button onClick={togglePlay} className="play-button">
            {isPlaying ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </button>

          <button onClick={() => skip(-10)} className="control-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"
              />
            </svg>
          </button>

          <button onClick={() => skip(10)} className="control-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z"
              />
            </svg>
          </button>

          <div className="progress-container">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSliderChange}
              className="progress-slider"
            />
          </div>

          <div className="time-display">
            {formatTime((progress / 100) * duration)} / {formatTime(duration)}
          </div>
        </div>
      </div>
    </div>
  );
};

const VideoStats = ({ videos, currentVideoId }) => {
  const totalVideos = videos.length;
  const watchedVideos = videos.filter((v) => v.watched).length;
  const completionPercentage =
    totalVideos > 0 ? Math.round((watchedVideos / totalVideos) * 100) : 0;

  const currentVideo = videos.find((v) => v.id === currentVideoId);

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="video-stats-container">
      <h2 className="stats-title">Chapter Statistics</h2>

      <div className="overall-progress">
        <h3 className="section-heading">Overall Progress</h3>
        <div className="progress-bar-container">
          <div
            className="progress-bar"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        <div className="progress-stats">
          <span>
            {watchedVideos} / {totalVideos} videos
          </span>
          <span className="bold-text">{completionPercentage}% Complete</span>
        </div>
      </div>

      <div className="divider"></div>

      {currentVideo && (
        <div className="current-video-stats">
          <h3 className="section-heading">
            Current Video: {currentVideo.title}
          </h3>

          <div className="status-indicator">
            {currentVideo.watched ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="status-icon completed"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="status-icon in-progress"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span>
              Status: {currentVideo.watched ? "Completed" : "In Progress"}
            </span>
          </div>

          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{ width: `${currentVideo.watchedPercentage || 0}%` }}
            ></div>
          </div>
          <p className="progress-percentage">
            Progress: {Math.round(currentVideo.watchedPercentage || 0)}%
          </p>

          <p className="video-position">
            Position: {formatTime(currentVideo.lastPlayedTime || 0)} /{" "}
            {formatTime(currentVideo.duration || 0)}
          </p>
        </div>
      )}
    </div>
  );
};

export const getInitialVideoData = () => [
  {
    id: 1,
    title: "Chapter 1",
    src: "/src/assets/1.mp3",
    duration: 0, // will be set when loaded
    watched: false,
    watchedPercentage: 0,
    lastPlayedTime: 0,
  },
  // Add similar objects for all 6 videos
  {
    id: 2,
    title: "Chapter 2",
    src: "/src/assets/2.mp3",
    duration: 0,
    watched: false,
    watchedPercentage: 0,
    lastPlayedTime: 0,
  },
  {
    id: 3,
    title: "Chapter 3",
    src: "/src/assets/3.mp3",
    duration: 0,
    watched: false,
    watchedPercentage: 0,
    lastPlayedTime: 0,
  },
  {
    id: 4,
    title: "Chapter 4",
    src: "/src/assets/4.mp3",
    duration: 0,
    watched: false,
    watchedPercentage: 0,
    lastPlayedTime: 0,
  },
  {
    id: 5,
    title: "Chapter 5",
    src: "/src/assets/5.mp3",
    duration: 0,
    watched: false,
    watchedPercentage: 0,
    lastPlayedTime: 0,
  },
  {
    id: 6,
    title: "Chapter 6",
    src: "/src/assets/6.mp3",
    duration: 0,
    watched: false,
    watchedPercentage: 0,
    lastPlayedTime: 0,
  },
  {
    id: 7,
    title: "Chapter 7",
    src: "/src/assets/7.mp3",
    duration: 0,
    watched: false,
    watchedPercentage: 0,
    lastPlayedTime: 0,
  },
  {
    id: 8,
    title: "Chapter 8",
    src: "/src/assets/8.mp3",
    duration: 0,
    watched: false,
    watchedPercentage: 0,
    lastPlayedTime: 0,
  },
  {
    id: 9,
    title: "Chapter 9",
    src: "/src/assets/9.mp3",
    duration: 0,
    watched: false,
    watchedPercentage: 0,
    lastPlayedTime: 0,
  },
  {
    id: 10,
    title: "Chapter 10",
    src: "/src/assets/10.mp3",
    duration: 0,
    watched: false,
    watchedPercentage: 0,
    lastPlayedTime: 0,
  },
  {
    id: 11,
    title: "Chapter 2",
    src: "/src/assets/11.mp3",
    duration: 0,
    watched: false,
    watchedPercentage: 0,
    lastPlayedTime: 0,
  },
  {
    id: 12,
    title: "Chapter 12",
    src: "/src/assets/12.mp3",
    duration: 0,
    watched: false,
    watchedPercentage: 0,
    lastPlayedTime: 0,
  },
];

const App = () => {
  const STORAGE_KEY = "videoPlayerData";

  const [videos, setVideos] = useState(() => {
    // Try to load from localStorage first
    const savedData = localStorage.getItem(STORAGE_KEY);
    return savedData ? JSON.parse(savedData) : getInitialVideoData();
  });

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const currentVideo = videos[currentVideoIndex];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
  }, [videos]);

  const updateVideoStats = (videoId, currentTime, percentage) => {
    setVideos((prevVideos) =>
      prevVideos.map((video) => {
        if (video.id === videoId) {
          const newPercentage = Math.min(100, Math.max(0, percentage));
          return {
            ...video,
            lastPlayedTime: currentTime,
            watchedPercentage: newPercentage,
            watched: newPercentage >= 95,
          };
        }
        return video;
      })
    );
  };

  const handleVideoEnd = (videoId) => {
    setVideos((prevVideos) =>
      prevVideos.map((video) =>
        video.id === videoId
          ? {
              ...video,
              watched: true,
              watchedPercentage: 100,
              lastPlayedTime: video.duration,
            }
          : video
      )
    );

    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  const selectVideo = (index) => {
    setCurrentVideoIndex(index);
  };

  const resetAllStats = () => {
    if (window.confirm("Are you sure you want to reset all video stats?")) {
      setVideos(getInitialVideoData());
    }
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <h1 className="app-title">Learning Management System</h1>
        <button onClick={resetAllStats} className="reset-button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Reset All
        </button>
      </div>

      <div className="main-content">
        {/* Left Side - Video Player & Video List */}
        <div className="left-panel">
          <VideoPlayer
            video={currentVideo}
            onTimeUpdate={updateVideoStats}
            onVideoEnd={handleVideoEnd}
          />

          <div className="video-list-container">
            <h2 className="list-title">Chapter List</h2>
            <div className="video-list">
              {videos.map((video, index) => (
                <button
                  key={video.id}
                  onClick={() => selectVideo(index)}
                  className={`video-list-item ${
                    index === currentVideoIndex ? "active" : ""
                  }`}
                >
                  <span className="video-title">{video.title}</span>
                  <span
                    className={`video-status ${
                      video.watched ? "completed" : "in-progress"
                    }`}
                  >
                    {video.watched
                      ? "Completed"
                      : `${Math.round(video.watchedPercentage)}%`}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Video Stats */}
        <div className="right-panel">
          <VideoStats videos={videos} currentVideoId={currentVideo.id} />
        </div>
      </div>
    </div>
  );
};

export default App;
