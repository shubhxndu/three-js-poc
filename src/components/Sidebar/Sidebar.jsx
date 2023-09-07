import { useEffect, useRef, useCallback, useState } from 'react';
import { animated, to, useSprings } from '@react-spring/web';
import { Part } from './Part';
import useWindowDimensions from '../../hooks/useWindowDimensions';
const numberOfParts = 5;

const parts = [...Array(numberOfParts).keys()];

const initalAngles = {
  1: [180],
  2: [180, 142],
  3: [218, 180, 142],
  4: [218, 180, 142, 105],
  5: [255, 218, 180, 142, 105],
};

/*------------------------------
Sidebar

Left Angle is 180 degree
Bottom is 90 degree
Top is 270 degree
Right is 0 Degree
------------------------------*/
function Sidebar() {
  const { height, width } = useWindowDimensions();
  let oldY = 0;
  const sidebarRef = useRef(null);
  const dragProps = useRef();
  const isOver = useRef(null);
  const order = useRef([]); // Store indicies as a local ref, this represents the item order

  let snapInProgress = false;

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

  const setActivePart = (currentAngle) => {
    const intervals = [40, 80, 120, 160, 200]; // Time duration in milliseconds
    const delta = 180 - currentAngle;

    intervals.forEach((value, _) => {
      setTimeout(() => {
        order.current.forEach((_, i) => {
          order.current[i].moveParts(delta / intervals.length);
        });
      }, value);
    });
  };

  const snapToDefaultPosition = () => {
    let closestPartIndex = 0;
    let minimumDifference = 360;
    order.current.forEach((_, i) => {
      //Loop to check which part is closest to 180 Degree angle
      let currentPartAngle = order.current[i].getCurrentAngle();
      if (Math.abs(currentPartAngle - 180) < minimumDifference) {
        minimumDifference = Math.abs(currentPartAngle - 180);
        closestPartIndex = i;
      }
    });
    order.current[closestPartIndex].snapToPart();
  };

  const onWheel = (e) => {
    clearTimeout(snapInProgress);
    const mouseWheelSensitivity = 1.235;
    const direction = -1; // -1 for anti-clockwise, 1 for clockwise
    if (e.deltaY) {
      // let thresholdDelta = Math.max(-8, Math.min(e.deltaY, 8));
      let thresholdDelta = 0;
      if (e.deltaY > 0) {
        thresholdDelta = -2;
      } else {
        thresholdDelta = 2;
      }
      if (order.current[0].canMove() && order.current[numberOfParts - 1].canMove())
        order.current.forEach((_, i) => {
          if (order.current[i].isPartEnabled())
            order.current[i].moveParts(thresholdDelta * mouseWheelSensitivity * direction);
        });
    }
    snapInProgress = setTimeout(() => {
      snapToDefaultPosition();
    }, [100]);
  };
  useEffect(() => {
    window.addEventListener('wheel', onWheel, { passive: true });

    return () => {
      window.removeEventListener('wheel', onWheel);
    };
  }, []);

  const pullElementFromTop = (index) => {
    console.log('pulling element from top', index);
    if (index >= 1) {
      order.current[index - 1].enablePart(255);
    }
  };

  const pushElementToTop = (index) => {
    if (index >= 1) {
      order.current[index - 1].disablePart(280);
    }
  };

  const pullElementFromBottom = (index) => {
    if (index < numberOfParts - 1) {
      order.current[index + 1].enablePart(90);
    }
  };

  const pushElementToBottom = (index) => {
    if (index < numberOfParts - 1) {
      order.current[index + 1].disablePart(60);
    }
  };

  const getInitialAngleByIndex = (index) => {
    if (numberOfParts < 6) {
      return initalAngles[numberOfParts][index];
    } else {
      if (index < 5) {
        return initalAngles[5][index];
      } else {
        return 60;
      }
    }
  };

  const initialiseDrag = (event) => {
    const { target, clientX, clientY, pageY } = event;
    const { offsetTop, offsetLeft } = target;
    const { left, top } = sidebarRef.current.getBoundingClientRect();

    oldY = event.pageY;
    dragProps.current = {
      dragStartLeft: left - offsetLeft,
      dragStartTop: top - offsetTop,
      dragStartX: clientX,
      dragStartY: clientY,
    };
  };

  const startDragging = (offsetY) => {
    if (offsetY) {
      let touchSensitivity = 1;
      let direction = -1;
      let thresholdDelta = 0;
      console.log(offsetY);
      if (offsetY < 0) {
        console.log('direction is up');
      } else if (offsetY > 0) {
        console.log('direction is down');
      }
      thresholdDelta = offsetY / 50;
      if (order.current[0].canMove() && order.current[numberOfParts - 1].canMove())
        order.current.forEach((_, i) => {
          if (order.current[i].isPartEnabled())
            order.current[i].moveParts(thresholdDelta * touchSensitivity * direction);
        });
    }
  };

  const stopDragging = () => {
    console.log('stopped dragging');
    setTimeout(() => {
      snapToDefaultPosition();
    }, [100]);
    // oldY = 0;
    // window.removeEventListener('mousemove', startDragging, false);
    // window.removeEventListener('mouseup', stopDragging, false);
  };

  return (
    <div className='relative left-full top-1/2'>
      {parts.map((refs, i) => (
        <Part
          index={i}
          width={width}
          height={height}
          infinite={numberOfParts > 5}
          ref={(el) => (order.current[i] = el)}
          angle={getInitialAngleByIndex(i)}
          startDragging={startDragging}
          stopDragging={stopDragging}
          getPositionByAngle={getPositionByAngle}
          pullElementFromTop={pullElementFromTop}
          pushElementToTop={pushElementToTop}
          pullElementFromBottom={pullElementFromBottom}
          pushElementToBottom={pushElementToBottom}
          setActivePart={setActivePart}
        />
      ))}{' '}
    </div>
  );
}

export default Sidebar;
