import { useSpring, animated, useSpringRef } from '@react-spring/web';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';

export const Part = forwardRef((props, ref) => {
  const currentAngle = useRef(0);

  useEffect(() => {
    currentAngle.current = props.angle;
  }, []);

  const [springs, api] = useSpring(() => ({
    from: { x: props.width, y: props.height / 2 - 100, opacity: 0 },
    to: async (next, cancel) => {
      await next([{ x: props.width, y: props.height / 2 - 100, opacity: 1 }]),
        await next([
          {
            x: props.getPositionByAngle(props.angle).x,
            y: props.getPositionByAngle(props.angle).y,
          },
        ]);
    },
    config: {
      tension: 600,
    },
  }));

  useImperativeHandle(ref, () => ({
    moveParts: (delta) => {
      currentAngle.current += delta;

      if (currentAngle.current > 360) {
        currentAngle.current -= 360;
      }
      api.start({
        to: async (next, cancel) => {
          await next([
            {
              x: props.getPositionByAngle(currentAngle.current).x,
              y: props.getPositionByAngle(currentAngle.current).y,
            },
          ]);
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
      Part {props.index + 1}
    </animated.div>
  );
});
