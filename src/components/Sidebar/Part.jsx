import { useSpring, animated } from '@react-spring/web';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';

export const Part = forwardRef((props, ref) => {
  const currentAngle = useRef(0);
  const isInView = useRef(false);

  useEffect(() => {
    currentAngle.current = props.angle;
  }, []);

  const [springs, api] = useSpring(() => ({
    from: { x: props.width, y: props.height / 2 - 100, opacity: 0 },
    to: async (next, cancel) => {
      const initialPosition = props.getPositionByAngle(props.angle);
      await next([{ x: props.width, y: props.height / 2 - 100, opacity: 1 }]),
        await next([
          {
            x: initialPosition.x,
            y: initialPosition.y,
          },
        ]);
    },
    config: {
      tension: 400,
    },
  }));

  const setActiveElement = () => {
    props.setActivePart(currentAngle.current);
  };

  useImperativeHandle(ref, () => ({
    moveParts: (delta, duration) => {
      currentAngle.current += delta;

      if (currentAngle.current > 360) {
        currentAngle.current -= 360;
      }
      api.start({
        to: async (next, cancel) => {
          const newPosition = props.getPositionByAngle(currentAngle.current);
          await next([
            {
              x: newPosition.x,
              y: newPosition.y,
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
      onClick={setActiveElement}
    >
      Part {props.index + 1}
    </animated.div>
  );
});
