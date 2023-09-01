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

  /*--------------------
  Vars
  --------------------*/

  const handleWindowPointerOver = useCallback(() => {
    isOver.current = true;
  }, []);

  const handleWindowPointerOut = useCallback(() => {
    isOver.current = false;
  }, []);

  const getPositionByAngle = (angle) => {
    let wheelRadius = 300;

    const radian = angle * (Math.PI / 180);

    let x = Number(Math.cos(radian) * wheelRadius);
    let y = Number(Math.sin(radian) * wheelRadius);

    return { x, y };
  };

  const onWheel = (e) => {
    const mouseWheelSensitivity = 1;
    console.log(e);
    if (e.deltaY) {
      let thresholdDelta = Math.max(-8, Math.min(e.deltaY, 8));
      order.current.forEach((_, i) => {
        order.current[i].moveParts(thresholdDelta * mouseWheelSensitivity);
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
          getPositionByAngle={getPositionByAngle}
          pullElementFromTop={pullElementFromTop}
          pullElementFromBottom={pullElementFromBottom}
        />
      ))}{' '}
    </div>
  );
}

export default Sidebar;
