import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const ThreeDChart = ({ data, xAxis, yAxis, chartType }) => {
    console.log('ThreeDChart props:', { data, xAxis, yAxis, chartType });
    const mountRef = useRef(null);

    useEffect(() => {
        console.log('ThreeDChart useEffect running');
        const currentMount = mountRef.current;
        console.log('Mount element:', currentMount);

        // Clear previous scene elements if component re-renders with new data
        if (currentMount.children.length > 0) {
            console.log('Clearing previous scene elements');
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
        camera.position.set(0, 10, 15);
        camera.lookAt(0, 0, 0);

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        currentMount.appendChild(renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(5, 10, 7);
        scene.add(directionalLight);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.screenSpacePanning = false;
        controls.maxPolarAngle = Math.PI / 2;

        if (data && data.length > 0 && xAxis && yAxis) {
            console.log('Creating chart with data:', { data, xAxis, yAxis, chartType });
            const xValues = data.map(d => d[xAxis]);
            const yValues = data.map(d => parseFloat(d[yAxis]));

            const maxVal = Math.max(...yValues);
            const minVal = Math.min(...yValues);

            const barWidth = 1;
            const barDepth = 1;
            const spacing = 0.5;

            const startX = -((xValues.length - 1) * (barWidth + spacing)) / 2;

            // Create a group for all chart elements
            const chartGroup = new THREE.Group();
            scene.add(chartGroup);

            // Add a base plane
            const planeGeometry = new THREE.PlaneGeometry(20, 20);
            const planeMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xcccccc,
                side: THREE.DoubleSide
            });
            const plane = new THREE.Mesh(planeGeometry, planeMaterial);
            plane.rotation.x = -Math.PI / 2;
            plane.position.y = -0.1;
            chartGroup.add(plane);

            switch (chartType) {
                case '3DBar':
                    console.log('Creating 3D Bar chart');
                    // Create 3D bars
            yValues.forEach((val, index) => {
                        const barHeight = val / maxVal * 10;
                const geometry = new THREE.BoxGeometry(barWidth, barHeight, barDepth);
                        const material = new THREE.MeshPhongMaterial({ 
                            color: new THREE.Color().setHSL(index / xValues.length, 0.7, 0.5)
                        });
                const bar = new THREE.Mesh(geometry, material);

                bar.position.x = startX + index * (barWidth + spacing);
                        bar.position.y = barHeight / 2;
                bar.position.z = 0;
                        chartGroup.add(bar);

                        // Add value label
                        const valueLabel = createTextSprite(val.toString());
                        valueLabel.position.set(bar.position.x, barHeight + 0.5, 0);
                        chartGroup.add(valueLabel);
                    });
                    break;

                case '3DLine':
                    console.log('Creating 3D Line chart');
                    // Create 3D line
                    const points = [];
                    yValues.forEach((val, index) => {
                        const x = startX + index * (barWidth + spacing);
                        const y = val / maxVal * 10;
                        points.push(new THREE.Vector3(x, y, 0));
                    });

                    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
                    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x42a5f5 });
                    const line = new THREE.Line(lineGeometry, lineMaterial);
                    chartGroup.add(line);

                    // Add points at each data point
                    points.forEach((point, index) => {
                        const sphereGeometry = new THREE.SphereGeometry(0.2);
                        const sphereMaterial = new THREE.MeshPhongMaterial({ 
                            color: new THREE.Color().setHSL(index / points.length, 0.7, 0.5)
                        });
                        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
                        sphere.position.copy(point);
                        chartGroup.add(sphere);

                        // Add value label
                        const valueLabel = createTextSprite(yValues[index].toString());
                        valueLabel.position.set(point.x, point.y + 0.5, 0);
                        chartGroup.add(valueLabel);
                    });
                    break;

                case '3DPie':
                    console.log('Creating 3D Pie chart');
                    // Create 3D pie chart
                    const radius = 5;
                    const total = yValues.reduce((sum, val) => sum + val, 0);
                    let startAngle = 0;

                    yValues.forEach((val, index) => {
                        const angle = (val / total) * Math.PI * 2;
                        const geometry = new THREE.CylinderGeometry(radius, radius, 1, 32, 1, true, startAngle, angle);
                        const material = new THREE.MeshPhongMaterial({ 
                            color: new THREE.Color().setHSL(index / yValues.length, 0.7, 0.5),
                            side: THREE.DoubleSide
                        });
                        const slice = new THREE.Mesh(geometry, material);
                        slice.rotation.x = Math.PI / 2;
                        chartGroup.add(slice);

                        // Add value label
                        const valueLabel = createTextSprite(val.toString());
                        const labelAngle = startAngle + angle / 2;
                        valueLabel.position.set(
                            Math.cos(labelAngle) * (radius + 1),
                            0.5,
                            Math.sin(labelAngle) * (radius + 1)
                        );
                        chartGroup.add(valueLabel);

                        startAngle += angle;
                    });
                    break;

                default:
                    console.log('Unknown chart type:', chartType);
            }

            // Add X-axis labels
            xValues.forEach((label, index) => {
                const xLabel = createTextSprite(label);
                xLabel.position.set(startX + index * (barWidth + spacing), -1, 0);
                chartGroup.add(xLabel);
            });
        } else {
            console.log('Missing required props:', { hasData: !!data, dataLength: data?.length, xAxis, yAxis });
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
            console.log('Cleaning up ThreeDChart');
            window.removeEventListener('resize', handleResize);
            currentMount.removeChild(renderer.domElement);
            renderer.dispose();
            controls.dispose();
            scene.traverse((object) => {
                if (!object.isMesh) return;
                object.geometry.dispose();
                object.material.dispose();
            });
        };
    }, [data, xAxis, yAxis, chartType]);

    // Helper function to create text sprites
    const createTextSprite = (text) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 128;
        canvas.height = 64;
        context.font = 'bold 24px Arial';
        context.fillStyle = 'black';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(2, 1, 1);

        return sprite;
    };

    return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};

export default ThreeDChart; 