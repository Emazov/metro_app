import React, { useState, useRef, useEffect } from 'react';

function App() {
	const [stream, setStream] = useState(null);
	const [error, setError] = useState(null);
	const videoRef = useRef(null);

	const startStream = async () => {
		try {
			const mediaStream = await navigator.mediaDevices.getUserMedia({
				video: {
					facingMode: 'environment',
					width: { ideal: 1920 },
					height: { ideal: 1080 },
				},
				audio: false,
			});

			console.log('Stream obtained:', mediaStream);
			setStream(mediaStream);
			setError(null);

			// Принудительное обновление видео
			if (videoRef.current) {
				videoRef.current.srcObject = mediaStream;
			}
		} catch (err) {
			setError(`Camera error: ${err.message}`);
		}
	};

	useEffect(() => {
		const initVideo = async () => {
			if (videoRef.current && stream) {
				try {
					console.log('Setting video source...');
					videoRef.current.srcObject = stream;

					await videoRef.current.play();
					console.log('Video playback started');

					// Принудительное обновление стилей
					videoRef.current.style.display = 'block';
				} catch (playError) {
					setError(`Video play failed: ${playError.message}`);
				}
			}
		};

		initVideo();
	}, [stream]);

	useEffect(() => {
		return () => {
			if (stream) {
				console.log('Cleaning up stream...');
				stream.getTracks().forEach((track) => {
					track.stop();
					console.log('Track stopped:', track.kind);
				});
			}
		};
	}, [stream]);

	return (
		<div className='container'>
			<h1>Camera Debug</h1>

			{error && <div className='error'>{error}</div>}

			<div className='video-wrapper'>
				<video
					ref={videoRef}
					playsInline
					muted
					autoPlay
					style={{
						backgroundColor: '#000',
						width: '100%',
						height: 'auto',
					}}
				/>
			</div>

			<button onClick={startStream} disabled={!!stream}>
				{stream ? 'Camera Active' : 'Start Camera'}
			</button>
		</div>
	);
}

export default App;
