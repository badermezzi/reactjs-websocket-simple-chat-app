import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadLinksPreset } from "@tsparticles/preset-links";
import { loadExternalPushInteraction } from "@tsparticles/interaction-external-push";
// *** ADD THIS IMPORT ***
import { loadExternalGrabInteraction } from "@tsparticles/interaction-external-grab";

function ParticleBackground() {
	const [init, setInit] = useState(false);

	useEffect(() => {
		initParticlesEngine(async (engine) => {
			// Load the preset first
			await loadLinksPreset(engine);
			// Explicitly load the push interaction
			await loadExternalPushInteraction(engine);
			// *** ADD THIS LINE - Explicitly load the grab interaction ***
			await loadExternalGrabInteraction(engine);
		}).then(() => {
			setInit(true);
		});
	}, []);

	const particlesLoaded = useCallback(async (container) => {
		console.log("Particles component loaded:", container);
	}, []);

	// Keep the same options object from Step 14 / Previous Step
	const particleOptions = useMemo(() => ({
		preset: "links",
		background: { color: { value: '#090b0c', }, },
		fpsLimit: 60,
		interactivity: {
			events: {
				onClick: { enable: true, mode: 'push', },
				onHover: { enable: true, mode: 'grab', }, // Ensure grab is enabled here
				resize: true,
			},
			modes: {
				push: { quantity: 4, },
				grab: { // Ensure grab configuration is present
					distance: 150,
					links: { opacity: 1 }
				},
			},
		},
		particles: {
			color: { value: '#ffffff', },
			links: { color: '#ffffff', distance: 150, enable: true, opacity: 0.7, width: 1, },
			move: { direction: 'none', enable: true, outModes: { default: 'out', }, random: true, speed: 2.0, straight: false, },
			number: { density: { enable: false, area: 800, }, value: 100, },
			opacity: { value: 1, },
			shape: { type: 'circle', },
			size: { value: { min: 0, max: 2.5 }, },
		},
		detectRetina: false,
	}), []);


	// Render the Particles component only after the engine and presets are initialized
	if (init) {
		return (
			<Particles
				id="tsparticles" // Unique ID for the canvas element
				particlesLoaded={particlesLoaded} // Callback function when particles are ready
				options={particleOptions} // The options object defined above
			// style={{ // Basic CSS styling for the canvas container
			// 	position: 'absolute',
			// 	top: 0,
			// 	left: 0,
			// 	width: '100%',
			// 	height: '100%',
			// 	zIndex: 0
			// }}
			/>
		);
	}

	// Return null while the engine is initializing
	return null;
}

export default ParticleBackground;