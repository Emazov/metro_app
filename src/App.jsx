import { useEffect, useRef, useState } from 'react';

const CameraMeasureApp = () => {
	const videoRef = useRef(null);
	const canvasRef = useRef(null);
	const [points, setPoints] = useState([]);

	useEffect(() => {
		const startCamera = async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: true,
				});
				if (videoRef.current) {
					videoRef.current.srcObject = stream;
				}
			} catch (error) {
				console.error('Error accessing camera:', error);
			}
		};
		startCamera();
	}, []);

	const handleCanvasClick = (e) => {
		if (points.length >= 2) setPoints([]);
		const rect = canvasRef.current.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		setPoints([...points, { x, y }]);
	};

	const calculateDistance = () => {
		if (points.length === 2) {
			const dx = points[1].x - points[0].x;
			const dy = points[1].y - points[0].y;
			const pixelDistance = Math.sqrt(dx * dx + dy * dy);
			const cmPerPixel = 0.1; // Placeholder conversion factor
			return (pixelDistance * cmPerPixel).toFixed(2);
		}
		return '0.00';
	};

	return (
		<div className='w-full h-screen flex flex-col items-center justify-center bg-black text-white'>
			<video ref={videoRef} autoPlay playsInline className='w-full h-auto' />
			<canvas
				ref={canvasRef}
				className='absolute top-0 left-0 w-full h-full'
				onClick={handleCanvasClick}
			/>
			<div className='mt-4 text-xl'>Distance: {calculateDistance()} cm</div>
		</div>
	);
};

export default CameraMeasureApp;
