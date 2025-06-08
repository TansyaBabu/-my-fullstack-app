import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ThreeDChart = ({ data, xAxis, yAxis }) => {
    const mountRef = useRef(null);

    useEffect(() => {
        const currentMount = mountRef.current;

        // Clear previous scene elements if component re-renders with new data
        if (currentMount.children.length > 0) {
            while (currentMount.firstChild) {
                currentMount.removeChild(currentMount.firstChild);
            }
        }

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
            75,
            currentMount.clientWidth / currentMount.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 10, 15); // Adjust camera position for better view of 3D bars
        camera.lookAt(0, 0, 0);

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        currentMount.appendChild(renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // Increased intensity
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // Added directional light
        directionalLight.position.set(5, 10, 7);
        scene.add(directionalLight);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.screenSpacePanning = false;
        controls.maxPolarAngle = Math.PI / 2;

        // 3D Bar Chart Logic
        if (data && data.length > 0 && xAxis && yAxis) {
            const xValues = data.map(d => d[xAxis]);
            const yValues = data.map(d => parseFloat(d[yAxis]));

            const maxVal = Math.max(...yValues);
            const minVal = Math.min(...yValues);

            const barWidth = 1; // Width of each bar
            const barDepth = 1; // Depth of each bar
            const spacing = 0.5; // Space between bars

            const startX = -((xValues.length - 1) * (barWidth + spacing)) / 2;

            yValues.forEach((val, index) => {
                const barHeight = val / maxVal * 10; // Scale height for visualization
                const geometry = new THREE.BoxGeometry(barWidth, barHeight, barDepth);
                const material = new THREE.MeshPhongMaterial({ color: 0x42a5f5 }); // Blue color
                const bar = new THREE.Mesh(geometry, material);

                bar.position.x = startX + index * (barWidth + spacing);
                bar.position.y = barHeight / 2; // Position bars correctly above the plane
                bar.position.z = 0;
                scene.add(bar);

                // Optional: Add X-axis labels (simple text, more advanced would use CanvasTexture)
                const xLabelCanvas = document.createElement('canvas');
                const xLabelContext = xLabelCanvas.getContext('2d');
                xLabelCanvas.width = 128;
                xLabelCanvas.height = 64;
                xLabelContext.font = 'bold 18px Arial';
                xLabelContext.fillStyle = 'black';
                xLabelContext.textAlign = 'center';
                xLabelContext.fillText(xValues[index], xLabelCanvas.width / 2, xLabelCanvas.height / 2);

                const xLabelTexture = new THREE.CanvasTexture(xLabelCanvas);
                const xLabelMaterial = new THREE.SpriteMaterial({ map: xLabelTexture });
                const xLabelSprite = new THREE.Sprite(xLabelMaterial);
                xLabelSprite.position.set(bar.position.x, -1, 0); // Position below bars
                xLabelSprite.scale.set(2, 1, 1); // Scale sprite
                scene.add(xLabelSprite);

                // Dispose of resources for labels after use
                xLabelTexture.dispose();
                xLabelMaterial.dispose();
            });

            // Add Y-axis guide line (simple line for now)
            const yAxisGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(startX - barWidth / 2 - spacing, 0, 0),
                new THREE.Vector3(startX - barWidth / 2 - spacing, maxVal / maxVal * 10 + 1, 0) // Extend slightly above max bar height
            ]);
            const yAxisMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
            const yAxisLine = new THREE.Line(yAxisGeometry, yAxisMaterial);
            scene.add(yAxisLine);

            // Dispose of resources for lines after use
            yAxisGeometry.dispose();
            yAxisMaterial.dispose();
        }

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Handle window resize
        const handleResize = () => {
            camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            currentMount.removeChild(renderer.domElement);
            renderer.dispose();
            controls.dispose();
            // Dispose of scene objects to prevent memory leaks
            scene.traverse((object) => {
                if (!object.isMesh) return;
                object.geometry.dispose();
                object.material.dispose();
            });
        };
    }, [data, xAxis, yAxis]);

    return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};

export default ThreeDChart; 