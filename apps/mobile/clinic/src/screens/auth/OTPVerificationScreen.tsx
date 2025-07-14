// apps/mobile/src/screens/auth/OTPVerificationScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { useRoute, useNavigation } from '@react-navigation/native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { Button, ActivityIndicator } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { showMessage } from 'react-native-flash-message';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setLoading } from '../../store/slices/authSlice';
import ApiManager from '../../services/api/ApiManager';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import GradientBackground from '../../components/ui/GradientBackground';
import AnimatedCard from '../../components/ui/AnimatedCard';
// import {MaterialCommun}

const { width } = Dimensions.get('window');

export const OTPVerificationScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const { phoneNumber } = route.params as { phoneNumber: string };

  const { loading: isLoading, isAuthenticated } = useAppSelector((state) => state.auth);
  const [error, setError] = useState<string | null>(null);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const otpInputRefs = useRef<TextInput[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();

  // Animation values
  const shakeAnimation = useSharedValue(0);

  useEffect(() => {
    startResendTimer();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (error) {
      // Shake animation on error
      shakeAnimation.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withRepeat(withTiming(10, { duration: 100 }), 3, true),
        withTiming(0, { duration: 50 })
      );
    }
  }, [error]);

  const shakeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeAnimation.value }],
  }));

  const startResendTimer = () => {
    setResendTimer(30);
    setCanResend(false);

    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      // Handle paste
      const otpArray = value.slice(0, 6).split('');
      const newOtp = [...otp];
      otpArray.forEach((digit, i) => {
        if (i < 6) {
          newOtp[i] = digit;
        }
      });
      setOtp(newOtp);
      otpInputRefs.current[5]?.focus();
    } else {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to next input
      if (value && index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length === 6) {
      setError(null);
      dispatch(setLoading(true));
      try {
        const response = await ApiManager.verifyOtp({
          phone: phoneNumber,
          otp: otpCode,
        });
        
        // ApiManager.verifyOtp already handles the Redux state update via loginSuccess
        // and token storage in AsyncStorage, so we just need to check success
        if (!response.success) {
          const errorMessage = response.message || 'Invalid OTP. Please try again.';
          setError(errorMessage);
          showMessage({
            message: 'Verification Failed',
            description: errorMessage,
            type: 'danger',
            icon: 'danger',
          });
        }
      } catch (error: any) {
        const errorMessage = error.message || 'Something went wrong. Please try again.';
        setError(errorMessage);
        showMessage({
          message: 'Error',
          description: errorMessage,
          type: 'danger',
          icon: 'danger',
        });
      } finally {
        dispatch(setLoading(false));
      }
    }
  };

  const handleResendOTP = async () => {
    dispatch(setLoading(true));
    setError(null);
    try {
      const response = await ApiManager.sendOtp({ phone: phoneNumber });
      if (response.success) {
        startResendTimer();
        setOtp(['', '', '', '', '', '']);
        otpInputRefs.current[0]?.focus();
        showMessage({
          message: 'OTP Resent',
          description: 'A new verification code has been sent to your phone',
          type: 'success',
          icon: 'success',
        });
      } else {
        showMessage({
          message: 'Failed to resend OTP',
          description: response.message || 'Please try again',
          type: 'danger',
          icon: 'danger',
        });
      }
    } catch (error: any) {
      showMessage({
        message: 'Error',
        description: error.message || 'Failed to resend OTP',
        type: 'danger',
        icon: 'danger',
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    // Format phone number for display
    if (phoneNumber.startsWith('+91')) {
      const cleaned = phoneNumber.substring(3);
      return `+91 ${cleaned.substring(0, 5)} ${cleaned.substring(5)}`;
    }
    return phoneNumber;
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color={colors.primary[600]} />
            </TouchableOpacity>

            {/* Header */}
            <Animated.View
              entering={FadeInDown.duration(600)}
              style={styles.header}
            >
              <View style={styles.iconContainer}>
                <Icon
                  name="message-text-lock"
                  size={48}
                  color={colors.primary[500]}
                />
              </View>
              <Text style={styles.title}>Verify Your Phone</Text>
              <Text style={styles.subtitle}>We've sent a 6-digit code to</Text>
              <Text style={styles.phoneNumber}>{formatPhoneNumber(phoneNumber)}</Text>
            </Animated.View>

            {/* OTP Input */}
            <AnimatedCard delay={300}>
              <Animated.View style={shakeAnimatedStyle}>
                <Text style={styles.otpLabel}>Enter Verification Code</Text>
                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => {
                        if (ref) otpInputRefs.current[index] = ref;
                      }}
                      style={[
                        styles.otpCell,
                        digit ? styles.otpCellFocused : null,
                      ]}
                      value={digit}
                      onChangeText={(value) => handleOtpChange(value, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      keyboardType="numeric"
                      maxLength={1}
                      textAlign="center"
                      editable={!isLoading}
                      autoFocus={index === 0}
                    />
                  ))}
                </View>

                {error && (
                  <Animated.View
                    entering={FadeInDown.duration(300)}
                    style={styles.errorContainer}
                  >
                    <Icon name="alert-circle" size={16} color={colors.error} />
                    <Text style={styles.errorText}>{error}</Text>
                  </Animated.View>
                )}
              </Animated.View>

              <Button
                mode="contained"
                onPress={handleVerifyOTP}
                loading={isLoading}
                disabled={isLoading || otp.join('').length !== 6}
                style={styles.verifyButton}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                theme={{
                  colors: { primary: colors.primary[500] },
                  roundness: 12,
                }}
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </Button>

              <View style={styles.resendContainer}>
                {canResend ? (
                  <TouchableOpacity onPress={handleResendOTP}>
                    <Text style={styles.resendLink}>Resend OTP</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.resendText}>
                    Resend OTP in {resendTimer} seconds
                  </Text>
                )}
              </View>
            </AnimatedCard>

            {/* Security Note */}
            <AnimatedCard delay={600}>
              <View style={styles.securityNote}>
                <Icon
                  name="shield-lock"
                  size={20}
                  color={colors.secondary[600]}
                />
                <Text style={styles.securityText}>
                  This OTP will expire in 10 minutes for your security
                </Text>
              </View>
            </AnimatedCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  backButton: {
    marginTop: 16,
    marginBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary[600],
  },
  otpLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 12,
  },
  otpCell: {
    width: width / 8,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    textAlign: 'center',
    backgroundColor: colors.background.paper,
  },
  otpCellFocused: {
    borderColor: colors.primary[500],
    borderWidth: 2,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
    marginBottom: 16,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.error,
    marginLeft: 6,
  },
  verifyButton: {
    marginBottom: 24,
    elevation: 2,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semiBold,
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  resendLink: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary[600],
    textDecorationLine: 'underline',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.secondary[50],
    borderRadius: 12,
  },
  securityText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.secondary[700],
    marginLeft: 12,
  },
});
