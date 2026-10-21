import Svg, { Circle, Rect } from 'react-native-svg';
import { usePalette } from './theme';

export function Logo({ size = 40 }: { size?: number }) {
  const c = usePalette();
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityLabel="PointEarner">
      <Rect width="100" height="100" rx="24" fill={c.accent} />
      <Circle cx="38.5" cy="50" r="20" fill="none" stroke="#FFFFFF" strokeWidth="6.5" />
      <Circle cx="61.5" cy="50" r="20" fill="none" stroke="#FFFFFF" strokeWidth="6.5" />
    </Svg>
  );
}
