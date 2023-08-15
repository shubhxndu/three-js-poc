import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import { useScroll } from '@react-spring/web';
import { usePrevious } from 'react-use';
import Part from './Part';
const images = [
  {
    image: 'https://raw.githubusercontent.com/supahfunk/webgl-carousel/main/public/img/1.jpg',
  },
  {
    image: 'https://raw.githubusercontent.com/supahfunk/webgl-carousel/main/public/img/2.jpg',
  },
  {
    image: 'https://raw.githubusercontent.com/supahfunk/webgl-carousel/main/public/img/3.jpg',
  },
  {
    image: 'https://raw.githubusercontent.com/supahfunk/webgl-carousel/main/public/img/4.jpg',
  },
  {
    image: 'https://raw.githubusercontent.com/supahfunk/webgl-carousel/main/public/img/5.jpg',
  },
  {
    image: 'https://raw.githubusercontent.com/supahfunk/webgl-carousel/main/public/img/6.jpg',
  },
];

/*------------------------------
Plane Settings
------------------------------*/
const planeSettings = {
  wheelRadius: 600,
  radianInterval: 45,
  width: 1,
  height: 1.5,
  gap: 0.1,
};

/*------------------------------
Sidebar
------------------------------*/
const Sidebar = () => {
  const [$root, setRoot] = useState();
  const { scrollYProgress } = useScroll();
  const [activePlane, setActivePlane] = useState(null);
  const prevActivePlane = usePrevious(activePlane);

  const isOver = useRef(false);

  const { width, height } = useThree((state) => state.size);

  const [springs, api] = useSpring(
    () => ({
      scale: 1,
      position: [0, 0],
      color: '#ff6d6d',
      config: (key) => {
        switch (key) {
          case 'scale':
            return {
              mass: 4,
              friction: 10,
            };
          case 'position':
            return { mass: 4, friction: 220 };
          default:
            return {};
        }
      },
    }),
    [],
  );

  /*--------------------
  Vars
  --------------------*/

  const speedWheel = 0.02;

  const handleClick = useCallback(() => {
    let clicked = false;

    return () => {
      clicked = !clicked;
      api.start({
        color: clicked ? '#569AFF' : '#ff6d6d',
      });
    };
  }, []);

  const handlePointerEnter = () => {
    console.log('pointer is in');
    api.start({
      scale: 1.2,
    });
  };

  const handlePointerLeave = () => {
    api.start({
      scale: 1,
    });
  };

  const handleWindowPointerOver = useCallback(() => {
    isOver.current = true;
  }, []);

  const handleWindowPointerOut = useCallback(() => {
    isOver.current = false;

    api.start({
      position: [0, 0],
    });
  }, []);

  const handlePointerMove = useCallback(
    (e) => {
      if (isOver.current) {
        const x = (e.offsetX / width) * 2 - 1;
        const y = (e.offsetY / height) * -2 + 1;

        api.start({
          position: [x * 5, y * 2],
        });
      }
    },
    [api, width, height],
  );

  useEffect(() => {
    window.addEventListener('pointerover', handleWindowPointerOver);
    window.addEventListener('pointerout', handleWindowPointerOut);
    window.addEventListener('pointermove', handlePointerMove);

    return () => {
      window.removeEventListener('pointerover', handleWindowPointerOver);
      window.removeEventListener('pointerout', handleWindowPointerOut);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [handleWindowPointerOver, handleWindowPointerOut, handlePointerMove]);

  /*--------------------
  Render Plane Events
  --------------------*/
  const renderPlaneEvents = () => {
    return (
      <animated.mesh
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick()}
        scale={springs.scale}
      >
        <planeGeometry args={[planeSettings.width * 2, planeSettings.height * 2]} />
        <meshBasicMaterial transparent={true} opacity={0} />
        {renderSlider()}
      </animated.mesh>
    );
  };

  /*--------------------
  Render Slider
  --------------------*/
  const renderSlider = () => {
    return (
      <group position={(0, 0, 0)} ref={setRoot}>
        {images.map((item, i) => (
          <Part {...getInitialPositions(i, images.length)} key={'random' + i} />
        ))}
      </group>
    );
  };

  const getInitialPositions = (i, lengthOfItems) => {
    let x = 0;
    let y = 0;
    let z = 0;
    let radianInterval = 45;
    let wheelRadius = 3;

    x = 0 + Math.cos(radianInterval * i) * wheelRadius;
    y = 0 + Math.sin(radianInterval * i) * wheelRadius;
    return { x, y, z };
  };

  return <group>{renderPlaneEvents()}</group>;
};

export default Sidebar;
