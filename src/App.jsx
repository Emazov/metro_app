import { useEffect, useRef, useState } from 'react';

const CameraMeasureApp = () => {
	const videoRef = useRef(null);
	const canvasRef = useRef(null);
	const [points, setPoints] = useState([]);
	const [stream, setStream] = useState(null);
	const animationFrameRef = useRef();

	const startCamera = async () => {
		try {
			const newStream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment' },
			});
			const video = videoRef.current;
			video.srcObject = newStream;

			await new Promise((resolve) => {
				video.onloadedmetadata = () => {
					video.play();
					const canvas = canvasRef.current;
					canvas.width = video.videoWidth;
					canvas.height = video.videoHeight;
					resolve();
				};
			});

			setStream(newStream);
			startCanvasAnimation();
		} catch (error) {
			console.error('Error accessing camera:', error);
		}
	};

	const stopCamera = () => {
		if (stream) {
			stream.getTracks().forEach((track) => track.stop());
			setStream(null);
		}
		cancelAnimationFrame(animationFrameRef.current);
	};

	const startCanvasAnimation = () => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');
		const video = videoRef.current;

		const drawFrame = () => {
			if (video && !video.paused) {
				ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

				// Рисуем точки и линии
				if (points.length > 0) {
					ctx.fillStyle = 'red';
					points.forEach((point) => {
						ctx.beginPath();
						ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
						ctx.fill();
					});
				}

				if (points.length === 2) {
					ctx.beginPath();
					ctx.moveTo(points[0].x, points[0].y);
					ctx.lineTo(points[1].x, points[1].y);
					ctx.strokeStyle = 'red';
					ctx.lineWidth = 2;
					ctx.stroke();
				}
			}
			animationFrameRef.current = requestAnimationFrame(drawFrame);
		};

		drawFrame();
	};

	const handleCanvasClick = (e) => {
		const canvas = canvasRef.current;
		const rect = canvas.getBoundingClientRect();
		const scaleX = canvas.width / rect.width;
		const scaleY = canvas.height / rect.height;

		const newPoint = {
			x: (e.clientX - rect.left) * scaleX,
			y: (e.clientY - rect.top) * scaleY,
		};

		setPoints((prev) => (prev.length >= 2 ? [newPoint] : [...prev, newPoint]));
	};

	const calculateDistance = () => {
		if (points.length < 2) return '0.00';

		const dx = points[1].x - points[0].x;
		const dy = points[1].y - points[0].y;
		const pixelDistance = Math.sqrt(dx ** 2 + dy ** 2);

		// Замените этот коэффициент на реальное значение
		// Для калибровки: pixelDistance / известноеРасстояниеВСантиметрах
		const cmPerPixel = 0.1;

		return (pixelDistance * cmPerPixel).toFixed(2);
	};

	useEffect(() => {
		startCamera();
		return () => {
			stopCamera();
			cancelAnimationFrame(animationFrameRef.current);
		};
	}, []);

	return (
		<div className='w-full h-screen flex flex-col items-center bg-black text-white'>
			<video ref={videoRef} className='hidden' autoPlay playsInline />
			<canvas
				ref={canvasRef}
				className='w-full h-auto max-h-[80vh]'
				onClick={handleCanvasClick}
			/>

			<div className='mt-4 text-xl'>Distance: {calculateDistance()} cm</div>

			<div className='flex gap-4 my-4'>
				<button
					onClick={startCamera}
					className='bg-green-500 px-4 py-2 rounded'
				>
					Restart
				</button>
				<button onClick={stopCamera} className='bg-red-500 px-4 py-2 rounded'>
					Stop
				</button>
				<button
					onClick={() => setPoints([])}
					className='bg-blue-500 px-4 py-2 rounded'
				>
					Reset
				</button>
			</div>
		</div>
	);
};

export default CameraMeasureApp;
