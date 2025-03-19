import React, { useState, useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as posedetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';

const CameraMeasurer = () => {
	const [isStreaming, setIsStreaming] = useState(false);
	const [measurements, setMeasurements] = useState([]);
	const [model, setModel] = useState(null);
	const [refDistance, setRefDistance] = useState(null);
	const videoRef = useRef(null);
	const canvasRef = useRef(null);
	const streamRef = useRef(null);
	const pointsRef = useRef([]);

	// Инициализация модели
	useEffect(() => {
		const loadModel = async () => {
			await tf.setBackend('webgl');
			const detector = await posedetection.createDetector(
				posedetection.SupportedModels.MoveNet,
				{ modelType: posedetection.movenet.modelType.SINGLEPOSE_THUNDER }
			);
			setModel(detector);
		};
		loadModel();
	}, []);

	const startStream = async () => {
		try {
			const constraints = {
				video: { facingMode: 'environment', width: 640, height: 480 },
			};
			const stream = await navigator.mediaDevices.getUserMedia(constraints);
			streamRef.current = stream;
			videoRef.current.srcObject = stream;
			await videoRef.current.play();
			setIsStreaming(true);
			detectPoses();
		} catch (err) {
			console.error(err);
		}
	};

	const detectPoses = async () => {
		if (!model) return;

		const detect = async () => {
			if (!videoRef.current || !isStreaming) return;

			const poses = await model.estimatePoses(videoRef.current);
			drawResults(poses);

			requestAnimationFrame(detect);
		};
		detect();
	};

	const calculateDistance = (point1, point2) => {
		if (!refDistance) return null;
		const dx = point1.x - point2.x;
		const dy = point1.y - point2.y;
		const pixelDistance = Math.sqrt(dx * dx + dy * dy);
		return (pixelDistance / refDistance.pixel) * refDistance.real;
	};

	const setReference = (point1, point2, realDistance) => {
		const dx = point1.x - point2.x;
		const dy = point1.y - point2.y;
		const pixelDistance = Math.sqrt(dx * dx + dy * dy);
		setRefDistance({ pixel: pixelDistance, real: realDistance });
	};

	const drawResults = (poses) => {
		const ctx = canvasRef.current.getContext('2d');
		ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

		// Отрисовка скелетона
		poses.forEach((pose) => {
			pose.keypoints.forEach((keypoint) => {
				if (keypoint.score > 0.3) {
					ctx.beginPath();
					ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
					ctx.fillStyle = 'red';
					ctx.fill();
				}
			});
		});

		// Отрисовка измерений
		if (pointsRef.current.length === 2) {
			const [p1, p2] = pointsRef.current;
			ctx.beginPath();
			ctx.moveTo(p1.x, p1.y);
			ctx.lineTo(p2.x, p2.y);
			ctx.strokeStyle = '#00ff00';
			ctx.lineWidth = 2;
			ctx.stroke();

			const distance = calculateDistance(p1, p2);
			if (distance) {
				ctx.fillStyle = '#00ff00';
				ctx.font = '16px Arial';
				ctx.fillText(
					`${distance.toFixed(2)} cm`,
					(p1.x + p2.x) / 2,
					(p1.y + p2.y) / 2
				);
			}
		}
	};

	const handleCanvasClick = (e) => {
		if (!isStreaming) return;

		const rect = canvasRef.current.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		pointsRef.current = [...pointsRef.current, { x, y }].slice(-2);

		if (pointsRef.current.length === 2 && !refDistance) {
			const realDistance = parseFloat(
				prompt('Введите реальное расстояние между точками в см:')
			);
			if (!isNaN(realDistance)) {
				setReference(pointsRef.current[0], pointsRef.current[1], realDistance);
			}
		}
	};

	return (
		<div className='container'>
			<div className='video-container'>
				<video ref={videoRef} playsInline muted />
				<canvas
					ref={canvasRef}
					width='640'
					height='480'
					onClick={handleCanvasClick}
					style={{ position: 'absolute', top: 0, left: 0 }}
				/>
			</div>

			<button onClick={startStream} disabled={isStreaming}>
				{isStreaming ? 'Streaming...' : 'Start Camera'}
			</button>

			<div className='controls'>
				<button onClick={() => (pointsRef.current = [])}>Clear Points</button>
			</div>

			<style jsx>{`
				.container {
					position: relative;
					max-width: 640px;
					margin: 0 auto;
				}
				.video-container {
					position: relative;
					width: 100%;
					height: 480px;
				}
				video,
				canvas {
					position: absolute;
					width: 100%;
					height: 100%;
					object-fit: cover;
				}
				button {
					margin: 10px;
					padding: 10px 20px;
					background: #007bff;
					color: white;
					border: none;
					border-radius: 4px;
					cursor: pointer;
				}
			`}</style>
		</div>
	);
};

export default CameraMeasurer;
