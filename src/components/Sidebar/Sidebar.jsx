import { useEffect, useRef, useCallback, useState } from 'react';
import { animated, to, useSprings } from '@react-spring/web';
import { Part } from './Part';
import useWindowDimensions from '../../hooks/useWindowDimensions';
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
Sidebar
------------------------------*/
function Sidebar() {
  const { height, width } = useWindowDimensions();

  const [angles, setAngles] = useState([80, 105, 135, 180, 225, 255]);

  const isOver = useRef(null);
  const order = useRef([]); // Store indicies as a local ref, this represents the item order
  const getInitialPositions = (i) => {
    let x = 0;
    let y = 0;
    let z = 0;
    let radianInterval = 45;
    let wheelRadius = 3;

    x = 0 + Math.cos(radianInterval * i) * wheelRadius;
    y = 0 + Math.sin(radianInterval * i) * wheelRadius;
    return { x, y, z };
  };

  const [springs, api] = useSprings(
    images.length,
    () => ({
      from: { opacity: 0 },
      to: { opacity: 1 },
    }),
    [],
  ); // Create springs, each corresponds to an item, controlling its transform, scale, etc.
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

  const handleWindowPointerOver = useCallback(() => {
    isOver.current = true;
  }, []);

  const handleWindowPointerOut = useCallback(() => {
    isOver.current = false;

    api.start({
      position: [0, 0],
    });
  }, []);

  const onWheel = (e) => {
    const mouseWheelSensitivity = 10;
    console.log(e);
    if (e.deltaY) {
      order.current.forEach((_, i) => {
        order.current[i].moveParts(e.deltaY * mouseWheelSensitivity);
      });
      // setDelta(e.deltaY * mouseWheelSensitivity);
    }
  };
  useEffect(() => {
    window.addEventListener('pointerover', handleWindowPointerOver);
    window.addEventListener('pointerout', handleWindowPointerOut);
    // window.addEventListener('pointermove', handlePointerMove);

    window.addEventListener('wheel', onWheel, { passive: true });

    return () => {
      window.removeEventListener('pointerover', handleWindowPointerOver);
      window.removeEventListener('pointerout', handleWindowPointerOut);
      window.removeEventListener('wheel', onWheel);
      // window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [handleWindowPointerOver, handleWindowPointerOut]);

  const pullElementFromTop = () => {
    console.log('pulling element from top');
  };

  const pullElementFromBottom = () => {
    console.log('pulling element from bottom');
  };

  return (
    <div className='relative left-full top-1/2'>
      {images.map((refs, i) => (
        <Part
          index={i}
          width={width}
          height={height}
          ref={(el) => (order.current[i] = el)}
          angle={angles[i]}
          pullElementFromTop={pullElementFromTop}
          pullElementFromBottom={pullElementFromBottom}
        />
      ))}{' '}
    </div>
  );
}

export default Sidebar;
