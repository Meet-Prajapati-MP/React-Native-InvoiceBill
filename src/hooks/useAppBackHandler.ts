import { useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';

/**
 * Registers Android hardware back button handler.
 * Call onBack when not at root; call onExitRequest when at root.
 * Returns true to consume the event (prevent default exit).
 */
export function useAppBackHandler(
  isAtRoot: boolean,
  onBack: () => void,
  onExitRequest: () => void,
) {
  const onBackRef = useRef(onBack);
  const onExitRequestRef = useRef(onExitRequest);
  const isAtRootRef = useRef(isAtRoot);

  onBackRef.current = onBack;
  onExitRequestRef.current = onExitRequest;
  isAtRootRef.current = isAtRoot;

  useEffect(() => {
    const handler = () => {
      if (isAtRootRef.current) {
        onExitRequestRef.current();
        return true;
      }
      onBackRef.current();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', handler);
    return () => sub.remove();
  }, []);
}
