import React, { useState, useRef, useEffect } from 'react';

function App() {
	const [stream, setStream] = useState(null);
	const [error, setError] = useState(null);
	const videoRef = useRef(null);

	// Инициализация видеопотока
	const startStream = async () => {
		try {
			const mediaStream = await navigator.mediaDevices.getUserMedia({
				video: {
					facingMode: 'environment', // Используем заднюю камеру
				},
				audio: false,
			});

			setStream(mediaStream);
			setError(null);
		} catch (err) {
			setError(`Error accessing camera: ${err.message}`);
		}
	};

	// Остановка потока
	const stopStream = () => {
		if (stream) {
			stream.getTracks().forEach((track) => track.stop());
			setStream(null);
		}
	};

	// Обновление видео элемента при изменении потока
	useEffect(() => {
		if (videoRef.current && stream) {
			videoRef.current.srcObject = stream;
			videoRef.current.play();
		}
	}, [stream]);

	// Очистка при размонтировании
	useEffect(() => {
		return () => {
			if (stream) {
				stream.getTracks().forEach((track) => track.stop());
			}
		};
	}, []);

	return (
		<div className='container'>
			<h1>Camera Stream</h1>

			{error && <div className='error'>{error}</div>}

			<div className='video-container'>
				<video ref={videoRef} playsInline muted autoPlay />
			</div>

			<div className='controls'>
				{!stream ? (
					<button onClick={startStream}>Start Camera</button>
				) : (
					<button onClick={stopStream}>Stop Camera</button>
				)}
			</div>
		</div>
	);
}

export default App;
