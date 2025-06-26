import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaMusic, FaTimes, FaStepBackward, FaStepForward, FaListUl } from 'react-icons/fa';

function App() {
  const [photoList, setPhotoList] = useState([]);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [audioTime, setAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [audioBoxPos, setAudioBoxPos] = useState({ x: window.innerWidth - 380, y: 40 });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [audioBoxHidden, setAudioBoxHidden] = useState(false);
  const [musicList, setMusicList] = useState([]);
  const [musicIndex, setMusicIndex] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  const audioBoxRef = useRef(null);
  console.log('musicList:', musicList, 'musicIndex:', musicIndex);

  useEffect(() => {
    fetch('/assets.json')
      .then(res => res.json())
      .then(data => {
        setPhotoList(data.photos || []);
        setMusicList(data.musics || []);
        setMusicIndex(idx => (data.musics && idx < data.musics.length ? idx : 0));
      });
  }, []);

  // 自动轮播
  useEffect(() => {
    if (photoList.length === 0) return;
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % photoList.length);
    }, 3500);
    return () => clearInterval(intervalRef.current);
  }, [photoList]);

  // 音频事件监听
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setAudioTime(audio.currentTime);
    const onLoadedMetadata = () => setAudioDuration(audio.duration);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, [musicList, musicIndex]);

  // 拖动事件（PC+移动端）
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (dragging) {
        setAudioBoxPos({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };
    const handleMouseUp = () => setDragging(false);
    const handleTouchMove = (e) => {
      if (dragging && e.touches.length === 1) {
        setAudioBoxPos({
          x: e.touches[0].clientX - dragOffset.x,
          y: e.touches[0].clientY - dragOffset.y,
        });
        e.preventDefault();
      }
    };
    const handleTouchEnd = () => setDragging(false);
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove, { passive: false });
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [dragging, dragOffset]);

  // 窗口缩放时防止控件超出边界
  useEffect(() => {
    const handleResize = () => {
      setAudioBoxPos(pos => ({
        x: Math.min(pos.x, window.innerWidth - 340),
        y: Math.min(pos.y, window.innerHeight - 80)
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 控制播放/暂停
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  // 拖动进度条
  const handleSeek = (e) => {
    const percent = e.target.value;
    if (audioRef.current) {
      audioRef.current.currentTime = percent * audioDuration;
    }
  };

  // 音量控制
  const handleVolume = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
      setMuted(v === 0);
    }
  };

  // 静音切换
  const toggleMute = () => {
    setMuted((m) => {
      if (audioRef.current) audioRef.current.muted = !m;
      return !m;
    });
  };

  // 时间格式化
  const formatTime = (t) => {
    if (!t || isNaN(t)) return '00:00';
    const m = Math.floor(t / 60).toString().padStart(2, '0');
    const s = Math.floor(t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // 重置自动轮播计时
  const resetInterval = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % photoList.length);
    }, 3500);
  };

  // 切换上一张
  const prevPhoto = () => {
    setCurrent((prev) => (prev - 1 + photoList.length) % photoList.length);
    resetInterval();
  };
  // 切换下一张
  const nextPhoto = () => {
    setCurrent((prev) => (prev + 1) % photoList.length);
    resetInterval();
  };

  // 切换上一首
  const prevMusic = () => {
    setMusicIndex(idx => {
      const newIdx = (idx - 1 + musicList.length) % musicList.length;
      return newIdx;
    });
  };
  // 切换下一首
  const nextMusic = () => {
    setMusicIndex(idx => {
      const newIdx = (idx + 1) % musicList.length;
      return newIdx;
    });
  };

  // 切换歌曲时自动播放（仅在当前是播放状态时）
  useEffect(() => {
    if (audioRef.current && musicList.length > 0 && musicList[musicIndex]) {
      audioRef.current.pause();
      audioRef.current.load();
      if (playing) {
        audioRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      }
    }
    // eslint-disable-next-line
  }, [musicIndex, musicList]);

  return (
    <div className="App" style={{ background: '#222', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {/* 音频控件悬浮框 */}
      {musicList.length > 0 && musicList[musicIndex] && (
        <audio ref={audioRef} src={`/music/${musicList[musicIndex]}`} loop preload="auto" style={{ display: 'none' }} />
      )}
      <div
        ref={audioBoxRef}
        style={{
          position: 'fixed',
          left: audioBoxPos.x,
          top: audioBoxPos.y,
          zIndex: 1000,
          cursor: dragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          transition: dragging ? 'none' : 'box-shadow 0.2s',
          boxShadow: dragging ? '0 0 16px #0006' : '0 2px 12px #0004',
        }}
      >
        {audioBoxHidden ? (
          <div
            onMouseDown={e => {
              setDragging(true);
              const rect = audioBoxRef.current.getBoundingClientRect();
              setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
              audioBoxRef.current._dragStart = { x: e.clientX, y: e.clientY };
            }}
            onMouseUp={e => {
              const start = audioBoxRef.current._dragStart;
              if (start && Math.abs(e.clientX - start.x) < 5 && Math.abs(e.clientY - start.y) < 5) {
                setAudioBoxHidden(false);
              }
              audioBoxRef.current._dragStart = null;
            }}
            onTouchStart={e => {
              if (e.touches.length === 1) {
                setDragging(true);
                const rect = audioBoxRef.current.getBoundingClientRect();
                setDragOffset({ x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top });
                audioBoxRef.current._dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
              }
            }}
            onTouchEnd={e => {
              const start = audioBoxRef.current._dragStart;
              if (start && e.changedTouches.length === 1 && Math.abs(e.changedTouches[0].clientX - start.x) < 5 && Math.abs(e.changedTouches[0].clientY - start.y) < 5) {
                setAudioBoxHidden(false);
              }
              audioBoxRef.current._dragStart = null;
            }}
            style={{
              width: 48,
              height: 48,
              background: '#fff',
              borderRadius: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px #0002',
              cursor: dragging ? 'grabbing' : 'grab',
            }}
            title="展开播放器"
          >
            <FaMusic size={28} color="#4caf50" />
          </div>
        ) : (
          <div
            style={{
              background: '#fff',
              borderRadius: 10,
              padding: '12px 24px 12px 12px',
              minWidth: 300,
              maxWidth: 380,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              position: 'relative',
              boxShadow: '0 0 4px #222',
            }}
          >
            {/* 拖动区域 */}
            <div
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 24, cursor: 'grab', zIndex: 2 }}
              onMouseDown={e => {
                setDragging(true);
                const rect = audioBoxRef.current.getBoundingClientRect();
                setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
              }}
              onTouchStart={e => {
                if (e.touches.length === 1) {
                  setDragging(true);
                  const rect = audioBoxRef.current.getBoundingClientRect();
                  setDragOffset({ x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top });
                }
              }}
            />
            {/* 右上角按钮分开布局 */}
            <div style={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 6, zIndex: 3 }}>
              <button
                onClick={() => setShowPlaylist(v => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#4caf50', marginLeft: 0, padding: 0 }}
                title="播放列表"
              >
                <FaListUl />
              </button>
              <button
                onClick={() => setAudioBoxHidden(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#888', marginLeft: 0, padding: 0 }}
                title="收起播放器"
              >
                <FaTimes />
              </button>
            </div>
            <div style={{ fontStyle: 'italic', fontSize: 16, marginBottom: 4, color: '#222', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {musicList[musicIndex] ? musicList[musicIndex] : '无音乐'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'nowrap' }}>
              <button onClick={prevMusic} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#222', marginRight: 2 }} title="上一首">
                <FaStepBackward />
              </button>
              <button onClick={togglePlay} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: '#222', marginRight: 4 }}>
                {playing ? <FaPause /> : <FaPlay />}
              </button>
              <button onClick={nextMusic} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#222', marginRight: 2 }} title="下一首">
                <FaStepForward />
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={audioDuration ? audioTime / audioDuration : 0}
                onChange={handleSeek}
                style={{ flex: 1 }}
              />
              <span style={{ fontSize: 14, color: '#222', minWidth: 60, textAlign: 'center' }}>
                {formatTime(audioTime)} / {formatTime(audioDuration)}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 8, minWidth: 32 }}>
                <button onClick={toggleMute} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#222', marginBottom: 2, padding: 0 }}>
                  {muted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={handleVolume}
                  style={{ width: 8, height: 48, writingMode: 'bt-lr', WebkitAppearance: 'slider-vertical', margin: 0 }}
                />
              </div>
            </div>
            {/* 播放列表弹窗 */}
            {showPlaylist && (
              <div style={{ position: 'absolute', top: 44, right: 0, left: 0, background: '#fff', border: '1px solid #eee', borderRadius: 8, boxShadow: '0 2px 8px #0002', maxHeight: 220, overflowY: 'auto', zIndex: 10 }}>
                {musicList.length === 0 && <div style={{ padding: 16, color: '#888', textAlign: 'center' }}>暂无音乐</div>}
                {musicList.map((m, i) => (
                  <div
                    key={m}
                    onClick={() => { setMusicIndex(i); setShowPlaylist(false); }}
                    style={{
                      padding: '8px 16px',
                      background: i === musicIndex ? '#e8f5e9' : 'transparent',
                      color: i === musicIndex ? '#388e3c' : '#222',
                      cursor: 'pointer',
                      fontWeight: i === musicIndex ? 'bold' : 'normal',
                      borderBottom: '1px solid #f0f0f0',
                      fontSize: 16,
                    }}
                  >
                    {m}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div style={{ position: 'relative', width: '100vw', height: '100vh', margin: 0, boxShadow: 'none', borderRadius: 0, overflow: 'hidden', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {photoList[current] && (
          <img
            src={`/photo/${photoList[current]}`}
            alt={`第${current + 1}张`}
            style={{
              maxWidth: '100vw',
              maxHeight: '100vh',
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              transition: 'opacity 0.5s',
              display: 'block',
              margin: '0 auto',
              background: '#111',
            }}
          />
        )}
        <button onClick={prevPhoto} style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', fontSize: 48, background: 'rgba(0,0,0,0.4)', color: '#fff', border: 'none', borderRadius: '50%', width: 64, height: 64, cursor: 'pointer', zIndex: 2 }}>&lt;</button>
        <button onClick={nextPhoto} style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', fontSize: 48, background: 'rgba(0,0,0,0.4)', color: '#fff', border: 'none', borderRadius: '50%', width: 64, height: 64, cursor: 'pointer', zIndex: 2 }}>&gt;</button>
        <div style={{ position: 'absolute', bottom: 24, left: 0, width: '100%', textAlign: 'center', color: '#fff', fontSize: 24, letterSpacing: 2, textShadow: '0 2px 8px #000' }}>
          {photoList.length > 0 ? `${current + 1} / ${photoList.length}` : '暂无图片'}
        </div>
      </div>
      <div style={{ color: '#fff', fontSize: 20, marginTop: 16 }}>舒缓音乐{playing ? '正在播放...' : '等待播放'}</div>
    </div>
  );
}

export default App;
