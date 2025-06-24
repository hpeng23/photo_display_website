import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const photos = [
  '/photo/1.jpg',
  '/photo/2.jpg',
  '/photo/3.jpg',
  '/photo/4.jpg',
];
const music = '/music/a.ogg';

function App() {
  const [current, setCurrent] = useState(0);
  const [musicStarted, setMusicStarted] = useState(false);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // 自动轮播
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % photos.length);
    }, 3500);
    return () => clearInterval(intervalRef.current);
  }, []);

  // 切换上一张
  const prevPhoto = () => {
    setCurrent((prev) => (prev - 1 + photos.length) % photos.length);
    resetInterval();
  };
  // 切换下一张
  const nextPhoto = () => {
    setCurrent((prev) => (prev + 1) % photos.length);
    resetInterval();
  };
  // 重置自动轮播计时
  const resetInterval = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % photos.length);
    }, 3500);
  };

  // 点击按钮播放音乐
  const handlePlayMusic = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().then(() => {
        setMusicStarted(true);
      }).catch(() => {
        alert('音乐播放失败，请检查浏览器设置');
      });
    }
  };

  return (
    <div className="App" style={{ background: '#222', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {!musicStarted && (
        <button onClick={handlePlayMusic} style={{ fontSize: 22, padding: '12px 32px', marginBottom: 24, borderRadius: 8, border: 'none', background: '#4caf50', color: '#fff', cursor: 'pointer', boxShadow: '0 2px 8px #0004' }}>
          点击播放舒缓音乐
        </button>
      )}
      <audio ref={audioRef} src={music} loop />
      <div style={{ position: 'relative', width: '100vw', height: '100vh', margin: 0, boxShadow: 'none', borderRadius: 0, overflow: 'hidden', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src={photos[current]}
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
        <button onClick={prevPhoto} style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', fontSize: 48, background: 'rgba(0,0,0,0.4)', color: '#fff', border: 'none', borderRadius: '50%', width: 64, height: 64, cursor: 'pointer', zIndex: 2 }}>&lt;</button>
        <button onClick={nextPhoto} style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', fontSize: 48, background: 'rgba(0,0,0,0.4)', color: '#fff', border: 'none', borderRadius: '50%', width: 64, height: 64, cursor: 'pointer', zIndex: 2 }}>&gt;</button>
        <div style={{ position: 'absolute', bottom: 24, left: 0, width: '100%', textAlign: 'center', color: '#fff', fontSize: 24, letterSpacing: 2, textShadow: '0 2px 8px #000' }}>
          {current + 1} / {photos.length}
        </div>
      </div>
      <div style={{ color: '#fff', fontSize: 20, marginTop: 16 }}>舒缓音乐{musicStarted ? '正在播放...' : '等待播放'}</div>
    </div>
  );
}

export default App;
