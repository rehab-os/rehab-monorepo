import { Vibration, Platform } from 'react-native';

export class HapticFeedback {
  static trigger(type: 'impactLight' | 'impactMedium' | 'impactHeavy' | 'notificationError' | 'notificationSuccess') {
    if (Platform.OS === 'android') {
      // Android vibration patterns
      switch (type) {
        case 'impactLight':
          Vibration.vibrate(50);
          break;
        case 'impactMedium':
          Vibration.vibrate(100);
          break;
        case 'impactHeavy':
          Vibration.vibrate(150);
          break;
        case 'notificationError':
          Vibration.vibrate([0, 100, 50, 100]);
          break;
        case 'notificationSuccess':
          Vibration.vibrate([0, 50, 25, 50]);
          break;
      }
    } else {
      // iOS uses simple vibration
      switch (type) {
        case 'impactLight':
        case 'impactMedium':
        case 'impactHeavy':
          Vibration.vibrate();
          break;
        case 'notificationError':
          Vibration.vibrate([0, 200]);
          break;
        case 'notificationSuccess':
          Vibration.vibrate([0, 100]);
          break;
      }
    }
  }
}

export default HapticFeedback;