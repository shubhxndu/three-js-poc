import { useSpring, animated } from '@react-spring/three';
import { Html } from '@react-three/drei';

const Part = ({ x, y, z }) => {
  const trans = (x, y) => `translate3d(${x}px,${y}px,0) translate3d(-50%,-50%,0)`;

  const props = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    transform: trans(x, y),
  });

  return (
    <animated.mesh position={[x, y, z]} style={props}>
      <Html>Part Name </Html>
    </animated.mesh>
  );
};

export default Part;
