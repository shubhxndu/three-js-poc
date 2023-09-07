import { useSpring, animated, easings } from '@react-spring/web';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';

export const Part = forwardRef((props, ref) => {
  const currentAngle = useRef(0);
  const isTopElement = useRef(false);
  const isBottomElement = useRef(false);
  const disabled = useRef(false);

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
      easing: easings.steps(5),
    },
  }));

  const setActiveElement = () => {
    props.setActivePart(currentAngle.current);
  };

  useImperativeHandle(ref, () => ({
    moveParts: (delta, duration) => {
      if (disabled.current) {
        return;
      }
      currentAngle.current += delta;

      if (currentAngle.current <= 0) {
        currentAngle.current = 360 - Math.abs(currentAngle.current);
      }
      if (currentAngle.current >= 360) {
        currentAngle.current = currentAngle.current % 360;
      }
      // if (currentAngle.current > 246 && currentAngle.current < 255 && delta < 0) {
      //   props.pullElementFromTop(props.index);
      // }
      // if (currentAngle.current > 246 && currentAngle.current < 255 && delta > 0) {
      //   props.pushElementToTop(props.index);
      // }
      // if (currentAngle.current > 105 && currentAngle.current < 115 && delta < 0) {
      //   props.pushElementToBottom(props.index);
      // }
      // if (currentAngle.current > 105 && currentAngle.current < 115 && delta > 0) {
      //   props.pullElementFromBottom(props.index);
      // }
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
    snapToPart: () => {
      props.setActivePart(currentAngle.current);
    },
    getCurrentAngle: () => {
      return currentAngle.current;
    },
    disablePart: (angle) => {
      currentAngle.current = angle;
      if (!disabled.current) {
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
      }
      disabled.current = true;
    },
    enablePart: (angle) => {
      currentAngle.current = angle;
      disabled.current = false;
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
    isPartEnabled: () => {
      return !disabled.currrent;
    },
    canMove: () => {
      if (props.index === 0 && currentAngle.current <= 160) {
        return false;
      }
      if (props.index !== 0 && currentAngle.current >= 200) {
        return false;
      }
      return true;
    },
  }));

  return (
    <animated.div
      className={'absolute select-none'}
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
