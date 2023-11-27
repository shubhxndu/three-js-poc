import { useEffect, useRef, useCallback, useState } from 'react';
import { animated, to, useSprings } from '@react-spring/web';
import { Part } from './Part';
import useWindowDimensions from '../../hooks/useWindowDimensions';
const numberOfParts = 15;
const parts = [...Array(numberOfParts).keys()];

const settings = {
  Web: {
    partsOnScreen: 5,
    defaultAngleForHiddenParts: 47,
    initialAngles: {
      1: [180],
      2: [180, 142],
      3: [218, 180, 142],
      4: [218, 180, 142, 105],
      5: [255, 218, 180, 142, 105],
    },
    angles: {
      topDisabled: 290,
      topEnabled: 290,
      bottomDisabled: 40,
      bottomEnabled: 68,
    },
    wheelRadius: 270,
    infiniteWheelThreshold: 5,
    activePartMovementDuration: 10,
    defaultPositionAngle: 180,
    mouseWheelSensitivity: 0.85,
    scrollWheelSensitivity: 3,
    touchSensitivity: 0.85,
    angleSteps: 2,
    wheelMovementDirection: -1,
    defaultPositionSnapDuration: 100,
    touchMovementDivider: 1.47,
    maxAngleForLastPart: 200,
    minAngleForFirstPart: 160,
    topPartPullPushRange: [249, 255],
    bottomPartPullPushRange: [105, 112],
  },
  Mobile: {
    partsOnScreen: 3,
    defaultAngleForHiddenParts: 38,
    initialAngles: {
      1: [270],
      2: [270, 233],
      3: [307, 270, 233],
    },
    wheelRadius: 180,
    infiniteWheelThreshold: 3,
    activePartMovementDuration: 10,
    defaultPositionAngle: 270,
    mouseWheelSensitivity: 0.85,
    touchSensitivity: 0.85,
    angleSteps: 2,
    wheelMovementDirection: -1,
    defaultPositionSnapDuration: 100,
    touchMovementDivider: 1.47,
    maxAngleForLastPart: 290,
    minAngleForFirstPart: 250,
    topPartPullPushRange: [339, 345],
    bottomPartPullPushRange: [195, 202],
  },
};

/*------------------------------
Sidebar

Left Angle is 180 degree
Bottom is 90 degree
Top is 270 degree
Right is 0 Degree
------------------------------*/
function Sidebar({ deviceType }) {
  const { height, width } = useWindowDimensions();
  const order = useRef([]); // Store indicies as a local ref, this represents the item order

  let snapInProgress = false;

  const isWheelInfinite = numberOfParts > settings[deviceType].infiniteWheelThreshold;

  useEffect(() => {
    window.addEventListener('wheel', onWheel, { passive: true });

    return () => {
      window.removeEventListener('wheel', onWheel);
    };
  }, []);

  const getPositionByAngle = (angle) => {
    const radian = angle * (Math.PI / 180);
    let x = Number(Math.cos(radian) * settings[deviceType].wheelRadius);
    let y = Number(Math.sin(radian) * settings[deviceType].wheelRadius);
    return { x, y };
  };

  const setActivePart = (currentAngle) => {
    const movementInterval = settings[deviceType].activePartMovementDuration; // Time duration in milliseconds
    const delta = 180 - currentAngle;
    let remainingDelta = delta;
    if (remainingDelta < 0) {
      for (let i = 0; i < Math.abs(delta) / settings[deviceType].angleSteps; i++) {
        setTimeout(() => {
          order.current.forEach((_, i) => {
            order.current[i].moveParts(-1 * settings[deviceType].angleSteps);
          });
        }, i * movementInterval);
        remainingDelta += settings[deviceType].angleSteps;
      }
      if (remainingDelta == -1) {
        setTimeout(() => {
          order.current.forEach((_, i) => {
            order.current[i].moveParts(-1);
          });
        }, movementInterval);
      }
    } else {
      for (let i = 0; i < Math.abs(delta) / settings[deviceType].angleSteps; i++) {
        setTimeout(() => {
          order.current.forEach((_, i) => {
            order.current[i].moveParts(settings[deviceType].angleSteps);
          });
        }, i * movementInterval);
        remainingDelta -= settings[deviceType].angleSteps;
      }
      if (remainingDelta == 1) {
        setTimeout(() => {
          order.current.forEach((_, i) => {
            order.current[i].moveParts(1);
          });
        }, movementInterval);
      }
    }
  };

  const snapToDefaultPosition = () => {
    let closestPartIndex = 0;
    let minimumDifference = settings[deviceType].defaultPositionAngle;

    order.current.forEach((_, i) => {
      //Loop to check which part is closest to settings[deviceType].defaultPositionAngle Degree angle
      let currentPartAngle = order.current[i].getCurrentAngle();
      if (
        Math.abs(currentPartAngle - settings[deviceType].defaultPositionAngle) < minimumDifference
      ) {
        minimumDifference = Math.abs(currentPartAngle - settings[deviceType].defaultPositionAngle);
        closestPartIndex = i;
      }
    });
    order.current[closestPartIndex].snapToPart();
  };

  const onWheel = (e) => {
    clearTimeout(snapInProgress);
    const mouseWheelSensitivity = settings[deviceType].mouseWheelSensitivity;
    const direction = settings[deviceType].wheelMovementDirection; // -1 for anti-clockwise, 1 for clockwise
    if (e.deltaY) {
      // let thresholdDelta = Math.max(-8, Math.min(e.deltaY, 8));
      let thresholdDelta = 0;
      if (e.deltaY > 0) {
        thresholdDelta = -1 * settings[deviceType].angleSteps;
      } else {
        thresholdDelta = settings[deviceType].angleSteps;
      }
      if (order.current[0].canMove() && order.current[numberOfParts - 1].canMove())
        order.current.forEach((_, i) => {
          if (order.current[i].isPartEnabled())
            order.current[i].moveParts(thresholdDelta * mouseWheelSensitivity * direction);
        });
    }
    snapInProgress = setTimeout(() => {
      snapToDefaultPosition();
    }, [settings[deviceType].defaultPositionSnapDuration]);
  };

  const pullElementFromTop = (index) => {
    if (index >= 1) {
      // first part + 37 degrees
      order.current[index - 1].enablePart(settings[deviceType].angles.topEnabled);
    }
    if (index == 0 && isWheelInfinite) {
      order.current[numberOfParts - 1].enablePart(settings[deviceType].angles.topEnabled);
    }
  };

  const pushElementToTop = (index) => {
    if (index >= 1) {
      order.current[index - 1].disablePart(settings[deviceType].angles.topDisabled);
    }
    if (index == 0 && isWheelInfinite) {
      order.current[numberOfParts - 1].disablePart(settings[deviceType].angles.topEnabled);
    }
  };

  const pullElementFromBottom = (index) => {
    if (index < numberOfParts - 1) {
      // Last part - 37 degrees
      order.current[index + 1].enablePart(settings[deviceType].angles.bottomEnabled);
    } else if (isWheelInfinite) {
      order.current[0].enablePart(settings[deviceType].angles.bottomEnabled);
    }
  };

  const pushElementToBottom = (index) => {
    if (index < numberOfParts - 1) {
      order.current[index + 1].disablePart(settings[deviceType].angles.bottomDisabled);
    } else if (isWheelInfinite) {
      order.current[0].disablePart(settings[deviceType].angles.bottomDisabled);
    }
  };

  const getInitialAngleByIndex = (index) => {
    if (numberOfParts < settings[deviceType].partsOnScreen) {
      return settings[deviceType]['initialAngles'][numberOfParts][index];
    } else {
      if (index < settings[deviceType].partsOnScreen) {
        return settings[deviceType]['initialAngles'][settings[deviceType].partsOnScreen][index];
      } else {
        return settings[deviceType].defaultAngleForHiddenParts;
      }
    }
  };

  const startDragging = (offsetY) => {
    if (offsetY) {
      let touchSensitivity = settings[deviceType].touchSensitivity;
      let direction = settings[deviceType].wheelMovementDirection;
      let thresholdDelta = 0;
      let divider = settings[deviceType].touchMovementDivider;
      if (offsetY > 0) {
        thresholdDelta = settings[deviceType].angleSteps / divider;
      } else {
        thresholdDelta = (-1 * settings[deviceType].angleSteps) / divider;
      }
      if (order.current[0].canMove() && order.current[numberOfParts - 1].canMove())
        order.current.forEach((_, i) => {
          if (order.current[i].isPartEnabled())
            order.current[i].moveParts(thresholdDelta * touchSensitivity * direction);
        });
    }
  };

  const stopDragging = () => {
    snapToDefaultPosition();
  };

  return (
    <animated.div className='relative left-full top-1/2 max-w-full'>
      {parts.map((refs, i) => (
        <Part
          index={i}
          key={`randomKey${i}`}
          width={width}
          height={height}
          infinite={isWheelInfinite}
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
          defaultAngleForHiddenParts={settings[deviceType].defaultAngleForHiddenParts}
          bottomDisabled={settings[deviceType].angles.bottomDisabled}
          maxAngleForLastPart={settings[deviceType].maxAngleForLastPart}
          minAngleForFirstPart={settings[deviceType].minAngleForFirstPart}
          topPartPullPushRange={settings[deviceType].topPartPullPushRange}
          bottomPartPullPushRange={settings[deviceType].bottomPartPullPushRange}
        />
      ))}{' '}
    </animated.div>
  );
}

export default Sidebar;
