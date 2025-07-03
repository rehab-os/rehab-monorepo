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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
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
import OTPInputView from '@twotalltotems/react-native-otp-input';

import { AppDispatch, RootState } from '@rehab/shared';
import {
  login,
  sendOtp,
  fetchCurrentUser,
} from '@rehab/shared/store/slices/authSlice';
import { colors, typography } from '@rehab/shared/theme';
import GradientBackground from '../../components/ui/GradientBackground';
import AnimatedCard from '../../components/ui/AnimatedCard';

const { width } = Dimensions.get('window');

export const OTPVerificationScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const route = useRoute();
  const { phone } = route.params as { phone: string };

  const { loading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const otpInputRef = useRef<OTPInputView>(null);
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
      // Fetch user data after successful login
      dispatch(fetchCurrentUser());
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
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

  const handleVerifyOTP = () => {
    if (otp.length === 6) {
      dispatch(login({ phone, otp }));
    }
  };

  const handleResendOTP = () => {
    dispatch(sendOtp({ phone }));
    startResendTimer();
    setOtp('');
    otpInputRef.current?.clear();
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
              <Text style={styles.phoneNumber}>{formatPhoneNumber(phone)}</Text>
            </Animated.View>

            {/* OTP Input */}
            <AnimatedCard delay={300}>
              <Animated.View style={shakeAnimatedStyle}>
                <Text style={styles.otpLabel}>Enter Verification Code</Text>
                <OTPInputView
                  ref={otpInputRef}
                  style={styles.otpInput}
                  pinCount={6}
                  code={otp}
                  onCodeChanged={setOtp}
                  onCodeFilled={handleVerifyOTP}
                  autoFocusOnLoad
                  codeInputFieldStyle={styles.otpCell}
                  codeInputHighlightStyle={styles.otpCellFocused}
                  selectionColor={colors.primary[500]}
                  editable={!loading}
                />

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
                loading={loading}
                disabled={loading || otp.length !== 6}
                style={styles.verifyButton}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                theme={{
                  colors: { primary: colors.primary[500] },
                  roundness: 12,
                }}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
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
  otpInput: {
    width: '100%',
    height: 60,
    marginBottom: 24,
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
