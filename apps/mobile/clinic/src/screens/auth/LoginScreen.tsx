import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Surface,
  HelperText,
} from 'react-native-paper';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setLoading } from '../../store/slices/authSlice';
import { ApiManager } from '../../services/api';
import { validatePhoneNumber } from '../../utils/validators';
import HapticFeedback from '../../utils/haptics';
import { showMessage } from 'react-native-flash-message';

const { width, height } = Dimensions.get('window');

export const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [countryCode] = useState('+91');
  
  const buttonScale = useSharedValue(1);
  const logoRotation = useSharedValue(0);
  const backgroundAnimation = useSharedValue(0);

  useEffect(() => {
    // Subtle logo animation
    logoRotation.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 2000 }),
        withTiming(-5, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      true
    );

    // Background gradient animation
    backgroundAnimation.value = withRepeat(
      withTiming(1, { duration: 10000 }),
      -1,
      true
    );
  }, []);

  const validatePhone = () => {
    if (!phone) {
      setPhoneError('Phone number is required');
      return false;
    }
    if (!validatePhoneNumber(phone)) {
      setPhoneError('Please enter a valid 10-digit phone number');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleSendOtp = async () => {
    if (!validatePhone()) {
      HapticFeedback.trigger('notificationError');
      return;
    }

    HapticFeedback.trigger('impactLight');
    dispatch(setLoading(true));
    
    try {
      const response = await ApiManager.sendOtp({ 
        phone: `${countryCode}${phone}` 
      });
      
      if (response.success) {
        showMessage({
          message: 'OTP Sent Successfully',
          description: 'Please check your phone for the verification code',
          type: 'success',
          icon: 'success',
          duration: 3000,
        });
        navigation.navigate('OTPVerification', { 
          phoneNumber: `${countryCode}${phone}` 
        });
      } else {
        showMessage({
          message: 'Failed to send OTP',
          description: response.message || 'Please try again',
          type: 'danger',
          icon: 'danger',
        });
      }
    } catch (error: any) {
      showMessage({
        message: 'Error',
        description: error.message || 'Something went wrong',
        type: 'danger',
        icon: 'danger',
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const animatedLogoStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${logoRotation.value}deg` }],
    };
  });

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      backgroundAnimation.value,
      [0, 1],
      [0, -50],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ translateY }],
    };
  });

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <Animated.View style={[styles.backgroundContainer, animatedBackgroundStyle]}>
        <LinearGradient
          colors={['#F0FDF4', '#DCFCE7', '#BBF7D0', '#86EFAC']}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.patternOverlay}>
          {[...Array(20)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.circlePattern,
                {
                  left: `${(i % 4) * 25}%`,
                  top: `${Math.floor(i / 4) * 20}%`,
                  opacity: 0.1,
                },
              ]}
            />
          ))}
        </View>
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Logo Section */}
            <Animated.View 
              entering={FadeInDown.delay(100).springify()} 
              style={styles.logoSection}
            >
              <Animated.View style={[styles.logoContainer, animatedLogoStyle]}>
                <Surface style={styles.logoSurface} elevation={4}>
                  <Icon name="medical-bag" size={48} color="#16A34A" />
                </Surface>
              </Animated.View>
              <Text variant="displaySmall" style={styles.brandName}>
                RehabOS
              </Text>
              <Text variant="bodyLarge" style={styles.tagline}>
                The Operating System for Modern Rehabilitation
              </Text>
            </Animated.View>

            {/* Form Section */}
            <Animated.View 
              entering={FadeInUp.delay(300).springify()} 
              style={styles.formSection}
            >
              <Surface style={styles.formCard} elevation={2}>
                <Text variant="headlineMedium" style={styles.welcomeText}>
                  Welcome Back
                </Text>
                <Text variant="bodyMedium" style={styles.subtitleText}>
                  Enter your phone number to continue
                </Text>

                <View style={styles.inputContainer}>
                  <View style={styles.phoneInputWrapper}>
                    <Surface style={styles.countryCodeContainer} elevation={1}>
                      <Text style={styles.countryCode}>{countryCode}</Text>
                    </Surface>
                    <TextInput
                      label="Phone Number"
                      value={phone}
                      onChangeText={(text) => {
                        setPhone(text.replace(/[^0-9]/g, ''));
                        if (phoneError) setPhoneError('');
                      }}
                      keyboardType="number-pad"
                      maxLength={10}
                      mode="outlined"
                      error={!!phoneError}
                      disabled={loading}
                      style={styles.phoneInput}
                      outlineColor="#E5E7EB"
                      activeOutlineColor="#16A34A"
                      textColor="#374151"
                      theme={{
                        colors: {
                          primary: '#16A34A',
                          error: '#F43F5E',
                        },
                        roundness: 10,
                      }}
                    />
                  </View>
                  {phoneError ? (
                    <HelperText type="error" visible={!!phoneError} style={styles.errorText}>
                      {phoneError}
                    </HelperText>
                  ) : (
                    <HelperText type="info" visible style={styles.helperText}>
                      We'll send you a verification code
                    </HelperText>
                  )}
                </View>

                <Animated.View style={[styles.buttonWrapper, animatedButtonStyle]}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPressIn={() => {
                      buttonScale.value = withSpring(0.96);
                    }}
                    onPressOut={() => {
                      buttonScale.value = withSpring(1);
                    }}
                    style={styles.touchableButton}
                  >
                    <Button
                      mode="contained"
                      onPress={handleSendOtp}
                      loading={loading}
                      disabled={loading}
                      style={styles.button}
                      contentStyle={styles.buttonContent}
                      labelStyle={styles.buttonLabel}
                      buttonColor="#16A34A"
                      textColor="#FFFFFF"
                    >
                      {loading ? 'Sending...' : 'Get Started'}
                    </Button>
                  </TouchableOpacity>
                </Animated.View>

                <View style={styles.infoSection}>
                  <Icon name="shield-check" size={16} color="#16A34A" />
                  <Text variant="bodySmall" style={styles.infoText}>
                    Your data is secure and encrypted
                  </Text>
                </View>
              </Surface>
            </Animated.View>

            {/* Footer */}
            <Animated.View entering={FadeIn.delay(500)} style={styles.footer}>
              <Text variant="bodySmall" style={styles.footerText}>
                By continuing, you agree to our Terms of Service
              </Text>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backgroundContainer: {
    position: 'absolute',
    width: width * 1.5,
    height: height * 1.5,
    top: -height * 0.25,
    left: -width * 0.25,
  },
  gradientBackground: {
    flex: 1,
  },
  patternOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  circlePattern: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#16A34A',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 48,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoSurface: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 40,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  tagline: {
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  formSection: {
    width: '100%',
  },
  formCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 32,
   
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  subtitleText: {
    color: '#6B7280',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  countryCodeContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    color: '#F43F5E',
    marginTop: 4,
  },
  helperText: {
    color: '#6B7280',
    marginTop: 4,
  },
  buttonWrapper: {
    width: '100%',
  },
  touchableButton: {
    width: '100%',
  },
  button: {
    borderRadius: 10,
    elevation: 2,
  },
  buttonContent: {
    paddingVertical: 14,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
  },
  infoText: {
    color: '#6B7280',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    color: '#9CA3AF',
    textAlign: 'center',
  },
});