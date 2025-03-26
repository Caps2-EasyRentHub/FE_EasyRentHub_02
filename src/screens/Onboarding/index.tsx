import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Animated,
} from 'react-native';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {getImages} from '@/assets/Images';
import Paginator from '@/components/Paginator';
import {useTranslation} from 'react-i18next';
import {screenHeight, screenWidth} from '@/themes/Responsive';
import Feather from 'react-native-vector-icons/Feather';
import {languageStore} from '@/stores';
import {LanguageBottomSheet} from '@/components/LanguageBottomSheet';
import {observer} from 'mobx-react-lite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {OnboardingProps} from '@/utils/interface';
import OptionLogin from '../OptionLogin';
import Splash from '@/components/Splash';
import {AuthContext} from '@/context/AuthContext';

const Onboarding: React.FC<OnboardingProps> = observer(() => {
  const {userToken} = useContext(AuthContext);

  const {t} = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingStatus, setOnboardingStatus] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const slides = [
    {
      key: 1,
      title: t('onboarding.description1.title'),
      text: t('onboarding.description1.text'),
      image: getImages().picture_1,
    },
    {
      key: 2,
      title: t('onboarding.description2.title'),
      text: t('onboarding.description2.text'),
      image: getImages().picture_2,
    },
    {
      key: 3,
      title: t('onboarding.description3.title'),
      text: t('onboarding.description3.text'),
      image: getImages().picture_3,
    },
  ];

  const viewableItemsChanged = useRef(({viewableItems}: any) => {
    setCurrentIndex(viewableItems[0]?.index || 0);
  }).current;

  const viewConfig = useRef({viewAreaCoveragePercentThreshold: 50}).current;

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const value = await AsyncStorage.getItem('Onboarding');
        if (value === 'true') {
          setOnboardingStatus(true);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setIsLoading(false);
      }
    };
    checkOnboardingStatus();
  }, []);

  const scrollTo = async () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current?.scrollToIndex({index: currentIndex + 1});
    } else {
      try {
        await AsyncStorage.setItem('Onboarding', 'true');
        setOnboardingStatus(true);
      } catch (error) {
        console.error('Error saving onboarding status:', error);
      }
    }
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem('Onboarding', 'true');
      setOnboardingStatus(true);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const renderItem = ({item}: any) => {
    return (
      <View style={styles.slide}>
        <View style={styles.contentContainer}>
          <View style={styles.viewTitle}>
            <Text style={styles.titleContainer}>
              {item.title.split(' ').map((item: any, index: any) => {
                if (
                  item === 'tốt' ||
                  item === 'nhất' ||
                  item === 'một' ||
                  item === 'lần' ||
                  item === 'chạm' ||
                  item === 'hoàn' ||
                  item === 'hảo' ||
                  item === 'the' ||
                  item === 'best' ||
                  item === 'one' ||
                  item === 'click' ||
                  item === 'perfect' ||
                  item === 'choice' ||
                  item === 'lựa' ||
                  item === 'chọn' ||
                  item === 'hoàn' ||
                  item === 'hảo' ||
                  item === 'của' ||
                  item === 'bạn'
                ) {
                  return (
                    <Text
                      key={index}
                      style={styles.titleHighlight}
                    >
                      {item}{' '}
                    </Text>
                  );
                } else {
                  return (
                    <Text
                      key={index}
                      style={styles.titleNormal}
                    >
                      {item}{' '}
                    </Text>
                  );
                }
              })}
            </Text>
          </View>
          <View style={styles.viewText}>
            <Text style={styles.text}>{item.text}</Text>
          </View>
        </View>
        <View style={styles.imageContainer}>
          <Image
            source={item.image}
            style={styles.images}
          />
          <View style={styles.imageOverlay} />
        </View>
      </View>
    );
  };

  if (isLoading) {
    return <Splash />;
  }

  if (onboardingStatus) {
    return (
      <View style={{flex: 1}}>
        <OptionLogin />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LanguageBottomSheet />
      <Image
        source={getImages().logo}
        style={styles.logo}
      />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            languageStore.setShowLanguageSheet(true);
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              borderColor: '#ECEDF3',
              padding: 16,
              marginLeft: 40,
            }}
          >
            <Text
              style={{
                color: '#252B5C',
                fontSize: 12,
                fontFamily: 'Lato-Regular',
                marginHorizontal: 8,
              }}
            >
              {t('choose_language')}
            </Text>
            <Feather
              name="chevron-down"
              size={12.5}
              color={'#234F68'}
            />
          </View>
        </TouchableOpacity>
        <View style={{flex: 1}}></View>
        <TouchableOpacity
          style={styles.buttonSkip}
          onPress={handleSkip}
        >
          <Text style={styles.textSkip}>{t('skip')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item) => item.key.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {x: scrollX}}}],
          {
            useNativeDriver: false,
          },
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />
      <Paginator
        data={slides}
        scrollX={scrollX}
      />
      <TouchableOpacity
        style={styles.nextButton}
        onPress={scrollTo}
      >
        <Text style={styles.nextText}>{t('next')}</Text>
      </TouchableOpacity>
    </View>
  );
});

export default Onboarding;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 37,
    justifyContent: 'space-between',
    width: '100%',
    zIndex: 1,
  },
  textSkip: {
    color: '#2A2A2A',
    fontSize: 15,
    fontFamily: 'Lato-Regular',
  },
  buttonSkip: {
    width: 86,
    height: 38,
    backgroundColor: '#DFDFDF',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  slide: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingTop: 20,
    width: screenWidth,
  },
  logo: {
    width: 79.02,
    height: 74.41,
    position: 'absolute',
    top: 0,
    left: 0,
    marginTop: 19,
    marginLeft: 10,
    zIndex: 1,
  },
  contentContainer: {
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    zIndex: 2,
    maxWidth: screenWidth,
  },
  viewTitle: {
    marginBottom: 16,
    width: '100%',
  },
  viewText: {
    marginBottom: 16,
    width: '100%',
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  images: {
    width: screenWidth - 32,
    height: screenHeight - 500,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  imageOverlay: {
    position: 'absolute',
    top: 20,
    left: 16,
    right: 16,
    bottom: 0,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  text: {
    fontFamily: 'Lato-Regular',
    color: '#53587A',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    textAlign: 'left',
    width: '100%',
  },
  nextButton: {
    width: 190,
    height: 54,
    backgroundColor: '#8BC83F',
    shadowColor: '#8BC83F',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 24,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextText: {
    fontFamily: 'Lato-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  titleNormal: {
    fontFamily: 'Lato-Regular',
    color: '#000000',
    fontSize: 28,
    textAlign: 'left',
    marginBottom: 8,
  },
  titleHighlight: {
    fontFamily: 'Lato-Bold',
    color: '#204D6C',
    fontSize: 28,
    textAlign: 'left',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    paddingRight: 8,
  },
});
