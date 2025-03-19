import { useEffect, useRef, useState } from 'react';

const CameraMeasureApp = () => {
	const videoRef = useRef(null);
	const canvasRef = useRef(null);
	const [points, setPoints] = useState([]);
	const [stream, setStream] = useState(null);

	const startCamera = async () => {
		try {
			const newStream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment' },
			});
			if (videoRef.current) {
				videoRef.current.srcObject = newStream;
			}
			setStream(newStream);
		} catch (error) {
			console.error('Error accessing camera:', error);
		}
	};

	const stopCamera = () => {
		if (stream) {
			stream.getTracks().forEach((track) => track.stop());
			setStream(null);
		}
	};

	useEffect(() => {
		startCamera();
		return () => stopCamera();
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
		<div className='w-full h-screen flex flex-col items-center justify-center bg-black text-white relative'>
			<video ref={videoRef} autoPlay playsInline className='w-full h-auto' />
			<canvas
				ref={canvasRef}
				className='absolute top-0 left-0 w-full h-full'
				onClick={handleCanvasClick}
			/>
			{points.map((point, index) => (
				<div
					key={index}
					className='absolute bg-red-500 w-4 h-4 rounded-full'
					style={{ left: point.x - 8, top: point.y - 8 }}
				></div>
			))}
			<div className='mt-4 text-xl'>Distance: {calculateDistance()} cm</div>
			<div className='flex gap-4 mt-4'>
				<button
					onClick={startCamera}
					className='bg-green-500 px-4 py-2 rounded'
				>
					Start
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
