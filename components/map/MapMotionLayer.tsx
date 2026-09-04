'use client';

import { useEffect, useRef } from 'react';

import {
  VLTAVA_WIDE_CENTERLINE_PATH,
  VLTAVA_WIDE_MIDDLE_BOAT_ROUTE,
  VLTAVA_WIDE_NORTH_BOAT_ROUTE,
  VLTAVA_WIDE_SOUTH_BOAT_ROUTE,
  VLTAVA_WIDE_UPPER_BOAT_ROUTE,
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
      }${paused ? ` ${styles.paused}` : ''}`}
      viewBox="0 0 1672 941"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id="vltava-water-corridor" clipPathUnits="userSpaceOnUse">
          <path
            d={VLTAVA_WIDE_CENTERLINE_PATH}
            fill="none"
            stroke="black"
            strokeWidth="56"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </clipPath>
      </defs>

      <g className={styles.shimmer}>
        <path className={styles.riverGlint} d={VLTAVA_WIDE_CENTERLINE_PATH} />
        <path
          className={`${styles.riverGlint} ${styles.riverGlintSecondary}`}
          d={VLTAVA_WIDE_CENTERLINE_PATH}
        />
      </g>

      <g className={styles.actors}>
        <g className={styles.trees}>
          <image
            className={`${styles.treeCluster} ${styles.treeClusterFirst}`}
            href="/map/motion/tree-cluster-v1.png"
            x="274"
            y="528"
            width="52"
            height="60"
            preserveAspectRatio="xMidYMid meet"
          />
          <image
            className={`${styles.treeCluster} ${styles.treeClusterSecond}`}
            href="/map/motion/tree-cluster-v1.png"
            x="418"
            y="718"
            width="46"
            height="54"
            preserveAspectRatio="xMidYMid meet"
          />
          <image
            className={`${styles.treeCluster} ${styles.treeClusterThird}`}
            href="/map/motion/tree-cluster-v1.png"
            x="930"
            y="815"
            width="44"
            height="52"
            preserveAspectRatio="xMidYMid meet"
          />
          <image
            className={`${styles.treeCluster} ${styles.treeClusterFourth}`}
            href="/map/motion/tree-cluster-v1.png"
            x="1376"
            y="522"
            width="50"
            height="58"
            preserveAspectRatio="xMidYMid meet"
          />
          <image
            className={`${styles.treeCluster} ${styles.treeClusterFifth}`}
            href="/map/motion/tree-cluster-v1.png"
            x="1468"
            y="672"
            width="46"
            height="54"
            preserveAspectRatio="xMidYMid meet"
          />
        </g>

        <g clipPath="url(#vltava-water-corridor)">
          <image
            className={styles.boat}
            href="/map/motion/boat-ochre.webp"
            x="-11"
            y="-23"
            width="22"
            height="48"
            transform="rotate(-90)"
            preserveAspectRatio="xMidYMid meet"
          >
            <animateMotion
              path={VLTAVA_WIDE_NORTH_BOAT_ROUTE}
              dur="66s"
              begin="-21s"
              rotate="auto"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              keyTimes="0;0.08;0.92;1"
              dur="66s"
              begin="-21s"
              repeatCount="indefinite"
            />
          </image>
          <image
            className={`${styles.boat} ${styles.boatSecondary}`}
            href="/map/motion/boat-brick.webp"
            x="-10"
            y="-22"
            width="20"
            height="45"
            transform="rotate(-90)"
            preserveAspectRatio="xMidYMid meet"
          >
            <animateMotion
              path={VLTAVA_WIDE_SOUTH_BOAT_ROUTE}
              dur="82s"
              begin="-49s"
              rotate="auto"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              keyTimes="0;0.08;0.92;1"
              dur="82s"
              begin="-49s"
              repeatCount="indefinite"
            />
          </image>
          <image
            className={`${styles.boat} ${styles.boatTertiary}`}
            href="/map/motion/boat-ochre.webp"
            x="-9"
            y="-20"
            width="18"
            height="40"
            transform="rotate(-90)"
            preserveAspectRatio="xMidYMid meet"
          >
            <animateMotion
              path={VLTAVA_WIDE_UPPER_BOAT_ROUTE}
              dur="74s"
              begin="-11s"
              rotate="auto"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;0.86;0.86;0"
              keyTimes="0;0.08;0.92;1"
              dur="74s"
              begin="-11s"
              repeatCount="indefinite"
            />
          </image>
          <image
            className={`${styles.boat} ${styles.boatFourth}`}
            href="/map/motion/boat-brick.webp"
            x="-8"
            y="-18"
            width="16"
            height="36"
            transform="rotate(-90)"
            preserveAspectRatio="xMidYMid meet"
          >
            <animateMotion
              path={VLTAVA_WIDE_MIDDLE_BOAT_ROUTE}
              dur="92s"
              begin="-63s"
              rotate="auto"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;0.72;0.72;0"
              keyTimes="0;0.08;0.92;1"
              dur="92s"
              begin="-63s"
              repeatCount="indefinite"
            />
          </image>
        </g>

        <image
          className={styles.birdFlock}
          href="/map/motion/birds-three.webp"
          x="-42"
          y="-30"
          width="84"
          height="60"
          preserveAspectRatio="xMidYMid meet"
        >
          <animateMotion
            path="M 1510 122 C 1355 36 1172 70 1002 211 C 937 266 882 292 830 302"
            dur="48s"
            begin="-7s"
            rotate="auto"
            repeatCount="indefinite"
          />
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
          <animateMotion
            path="M 1197 740 C 1087 684 1005 662 925 692 C 858 717 809 761 759 825"
            dur="56s"
            begin="-34s"
            rotate="auto"
            repeatCount="indefinite"
          />
        </image>
        <image
          className={`${styles.birdFlock} ${styles.birdFlockTertiary}`}
          href="/map/motion/birds-three.webp"
          x="-36"
          y="-26"
          width="72"
          height="52"
          preserveAspectRatio="xMidYMid meet"
        >
          <animateMotion
            path="M 114 188 C 310 92 512 112 686 196 C 805 253 931 224 1068 151"
            dur="62s"
            begin="-29s"
            rotate="auto"
            repeatCount="indefinite"
          />
        </image>
        <image
          className={`${styles.birdFlock} ${styles.birdFlockFourth}`}
          href="/map/motion/birds-two.webp"
          x="-31"
          y="-23"
          width="62"
          height="46"
          preserveAspectRatio="xMidYMid meet"
        >
          <animateMotion
            path="M 248 728 C 420 642 590 660 748 748 C 842 800 949 815 1060 774"
            dur="70s"
            begin="-48s"
            rotate="auto"
            repeatCount="indefinite"
          />
        </image>
        <image
          className={`${styles.birdFlock} ${styles.birdFlockFifth}`}
          href="/map/motion/birds-two.webp"
          x="-27"
          y="-19"
          width="54"
          height="38"
          preserveAspectRatio="xMidYMid meet"
        >
          <animateMotion
            path="M -88 414 C 150 336 351 351 544 451 C 673 518 805 522 935 476"
            dur="76s"
            begin="-17s"
            rotate="auto"
            repeatCount="indefinite"
          />
        </image>
        <image
          className={`${styles.birdFlock} ${styles.birdFlockSixth}`}
          href="/map/motion/birds-three.webp"
          x="-29"
          y="-21"
          width="58"
          height="42"
          preserveAspectRatio="xMidYMid meet"
        >
          <animateMotion
            path="M 1730 282 C 1520 204 1322 224 1150 344 C 1042 419 943 431 856 390"
            dur="84s"
            begin="-53s"
            rotate="auto"
            repeatCount="indefinite"
          />
        </image>
        <image
          className={`${styles.birdFlock} ${styles.birdFlockSeventh}`}
          href="/map/motion/birds-two.webp"
          x="-24"
          y="-17"
          width="48"
          height="34"
          preserveAspectRatio="xMidYMid meet"
        >
          <animateMotion
            path="M 1588 884 C 1419 803 1239 807 1072 863 C 946 905 828 892 720 825"
            dur="92s"
            begin="-71s"
            rotate="auto"
            repeatCount="indefinite"
          />
        </image>
      </g>
    </svg>
  );
}
