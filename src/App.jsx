import React, { useState, useRef, useEffect } from 'react';

const CameraStream = () => {
	const [isStreaming, setIsStreaming] = useState(false);
	const [error, setError] = useState(null);
	const videoRef = useRef(null);
	const streamRef = useRef(null);

	const startStream = async () => {
		try {
			const constraints = {
				video: {
					facingMode: 'environment', // Используем заднюю камеру
					width: { ideal: 1920 },
					height: { ideal: 1080 },
				},
			};

			const stream = await navigator.mediaDevices.getUserMedia(constraints);
			streamRef.current = stream;

			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				videoRef.current.play();
			}

			setIsStreaming(true);
			setError(null);
		} catch (err) {
			setError(err.message);
			setIsStreaming(false);
		}
	};

	const stopStream = () => {
		if (streamRef.current) {
			streamRef.current.getTracks().forEach((track) => track.stop());
			streamRef.current = null;
		}
		setIsStreaming(false);
	};

	const toggleStream = () => {
		if (isStreaming) {
			stopStream();
		} else {
			startStream();
		}
	};

	useEffect(() => {
		return () => {
			if (streamRef.current) {
				stopStream();
			}
		};
	}, []);

	return (
		<div className='container'>
			<h1>Camera Stream</h1>

			{error && <div className='error'>{error}</div>}

			<div className='video-container'>
				<video
					ref={videoRef}
					playsInline
					muted
					autoPlay
					style={{ display: isStreaming ? 'block' : 'none' }}
				/>
			</div>

			<button
				onClick={toggleStream}
				className={`stream-button ${isStreaming ? 'active' : ''}`}
			>
				{isStreaming ? 'Stop Stream' : 'Start Stream'}
			</button>

			<style jsx>{`
				.container {
					max-width: 600px;
					margin: 0 auto;
					padding: 20px;
					text-align: center;
				}

				.video-container {
					position: relative;
					width: 100%;
					height: 400px;
					background: #000;
					margin: 20px 0;
				}

				video {
					width: 100%;
					height: 100%;
					object-fit: cover;
				}

				.stream-button {
					padding: 12px 24px;
					font-size: 16px;
					background: #007bff;
					color: white;
					border: none;
					border-radius: 4px;
					cursor: pointer;
					transition: background 0.3s;
				}

				.stream-button.active {
					background: #dc3545;
				}

				.error {
					color: #dc3545;
					margin: 10px 0;
				}
			`}</style>
		</div>
	);
};

export default CameraStream;
