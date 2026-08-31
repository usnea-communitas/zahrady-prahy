'use client';

import { useEffect, useRef } from 'react';

import {
  VLTAVA_CENTERLINE_PATH,
  VLTAVA_NORTH_BOAT_ROUTE,
  VLTAVA_SOUTH_BOAT_ROUTE,
} from '@/lib/map/geometry.generated';

import styles from './MapMotionLayer.module.css';

type MapMotionLayerProps = {
  paused: boolean;
  quiet: boolean;
  ready: boolean;
};

export function MapMotionLayer({ paused, quiet, ready }: MapMotionLayerProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const syncPlayback = () => {
      if (paused || document.hidden) svg.pauseAnimations();
      else svg.unpauseAnimations();
    };

    syncPlayback();
    document.addEventListener('visibilitychange', syncPlayback);
    return () => document.removeEventListener('visibilitychange', syncPlayback);
  }, [paused]);

  return (
    <svg
      ref={svgRef}
      className={`${styles.motionLayer}${ready ? ` ${styles.ready}` : ''}${
        quiet ? ` ${styles.quiet}` : ''
      }`}
      viewBox="0 0 1672 941"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <g className={styles.shimmer}>
        <path
          className={styles.riverGlint}
          d={VLTAVA_CENTERLINE_PATH}
        />
        <path
          className={`${styles.riverGlint} ${styles.riverGlintSecondary}`}
          d={VLTAVA_CENTERLINE_PATH}
        />
      </g>

      <g className={styles.actors}>
        <image
          className={styles.boat}
          href="/map/motion/boat-ochre.webp"
          x="-11"
          y="-23"
          width="22"
          height="48"
          preserveAspectRatio="xMidYMid meet"
        >
          {!paused && (
            <>
              <animateMotion
                path={VLTAVA_NORTH_BOAT_ROUTE}
                dur="72s"
                begin="-18s"
                rotate="auto"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                keyTimes="0;0.08;0.92;1"
                dur="72s"
                begin="-18s"
                repeatCount="indefinite"
              />
            </>
          )}
        </image>
        <image
          className={`${styles.boat} ${styles.boatSecondary}`}
          href="/map/motion/boat-brick.webp"
          x="-10"
          y="-22"
          width="20"
          height="45"
          preserveAspectRatio="xMidYMid meet"
        >
          {!paused && (
            <>
              <animateMotion
                path={VLTAVA_SOUTH_BOAT_ROUTE}
                dur="96s"
                begin="-57s"
                rotate="auto"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                keyTimes="0;0.08;0.92;1"
                dur="96s"
                begin="-57s"
                repeatCount="indefinite"
              />
            </>
          )}
        </image>

        <image
          className={styles.birdFlock}
          href="/map/motion/birds-three.webp"
          x="-42"
          y="-30"
          width="84"
          height="60"
          preserveAspectRatio="xMidYMid meet"
        >
          {!paused && (
            <animateMotion
              path="M 1510 122 C 1355 36 1172 70 1002 211 C 937 266 882 292 830 302"
              dur="48s"
              begin="-7s"
              rotate="auto"
              repeatCount="indefinite"
            />
          )}
        </image>
        <image
          className={`${styles.birdFlock} ${styles.birdFlockSecondary}`}
          href="/map/motion/birds-two.webp"
          x="-38"
          y="-27"
          width="76"
          height="54"
          preserveAspectRatio="xMidYMid meet"
        >
          {!paused && (
            <animateMotion
              path="M 1197 740 C 1087 684 1005 662 925 692 C 858 717 809 761 759 825"
              dur="56s"
              begin="-34s"
              rotate="auto"
              repeatCount="indefinite"
            />
          )}
        </image>
      </g>
    </svg>
  );
}
