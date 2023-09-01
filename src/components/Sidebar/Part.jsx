import { useSpring, animated, useSpringRef } from '@react-spring/web';
import { forwardRef, useCallback, useEffect, useImperativeHandle } from 'react';

export const Part = forwardRef((props, ref) => {
  const radius = 300;

  // useEffect(() => {
  //   api.start({
  //     to: [{ x: getPositionByAngle(props.angle).x, y: getPositionByAngle(props.angle).y }],
  //     config: {
  //       clamp: true,
  //     },
  //   });
  // }, [props.angle]);

  const getPositionByAngle = (angle) => {
    let wheelRadius = 300;

    const radian = angle * (Math.PI / 180);

    let x = Number(Math.cos(radian) * wheelRadius);
    let y = Number(Math.sin(radian) * wheelRadius);

    return { x, y };
  };
  const [springs, api] = useSpring(() => ({
    from: { x: props.width, y: props.height / 2 - 100, opacity: 0 },
    to: [
      { x: props.width, y: props.height / 2 - 100, opacity: 1 },
      {
        x: getPositionByAngle(props.angle).x,
        y: getPositionByAngle(props.angle).y,
      },
    ],
    config: {
      clamp: true,
    },
  }));

  useImperativeHandle(ref, () => ({
    moveParts: (delta) => {
      console.log('callling move parts', props.angle, delta);
      api.start({
        to: {
          x: getPositionByAngle(props.angle + delta / 50).x,
          y: getPositionByAngle(props.angle + delta / 50).y,
        },
        config: {
          duration: 200,
          clamp: true,
        },
      });
    },
  }));
  return (
    <animated.div
      className={'absolute'}
      style={{
        width: 80,
        height: 80,
        zIndex: props.index,
        background: '#ff6d6d',
        borderRadius: 8,
        ...springs,
      }}
    >
      Part Name
    </animated.div>
  );
});
