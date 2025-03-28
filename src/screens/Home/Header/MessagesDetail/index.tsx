import {
  Animated,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useRef, useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {BackButton} from '@/components';
import {getImages} from '@/assets/Images';
import {screenWidth} from '@/themes/Responsive';
import {Seen} from '@/assets/Svg';

const MessagesDetail = ({route}: any) => {
  const {avatar, _id, full_name} = route.params;

  const [chat, setChat] = useState('');
  const [focusTime, setFocusTime] = useState(false);
  const showTime = useRef(new Animated.Value(0)).current;
  const AnimatedShowTime = () => {
    Animated.timing(showTime, {
      toValue: 15,
      duration: 500,
      useNativeDriver: false,
    }).start();
    setFocusTime(true);
  };
  const AnimatedUnShowTime = () => {
    Animated.timing(showTime, {
      toValue: 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
    setFocusTime(false);
  };

  return (
    <View style={styles.component}>
      <BackButton />
      <View style={{flexDirection: 'row', marginLeft: 74, marginTop: 14}}>
        <View>
          <View style={styles.viewAvatar}>
            <Image
              source={{uri: avatar}}
              style={styles.avatar}
            />
          </View>
          <View style={styles.viewIcon}>
            <View style={styles.iconOnline} />
          </View>
        </View>

        <View style={styles.rightView}>
          <Text style={styles.name}>{full_name}</Text>
          <Text style={styles.text}>Online</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.btnDelete}>
        <Ionicons
          name="call-outline"
          color={'#252B5C'}
          size={20}
        />
      </TouchableOpacity>
      <View
        style={{
          width: screenWidth - 20,
          marginLeft: 10,
          marginVertical: 10,
          backgroundColor: '#F5F4F8',
          flex: 1,
          borderRadius: 50,
          justifyContent: 'flex-end',
        }}
      >
        <KeyboardAvoidingView>
          <ScrollView>
            <TouchableOpacity
              style={styles.leftMessage}
              onPress={() => {
                focusTime ? AnimatedUnShowTime() : AnimatedShowTime();
              }}
            >
              <View style={styles.contentLeft}>
                <Text style={styles.textLeft}>
                  Lorem ipsum dolor sit amet, consectetur
                </Text>
              </View>
              <Animated.View style={[styles.timeLeft, {height: showTime}]}>
                <Text style={styles.textTime}>10.46</Text>
                {/* <Seen /> */}
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.rightMessage}
              onPress={() => {
                focusTime ? AnimatedUnShowTime() : AnimatedShowTime();
              }}
            >
              <View style={styles.contentRight}>
                <Text style={styles.textRight}>
                  Lorem ipsum dolor sit amet, consectetur
                </Text>
              </View>
              <Animated.View style={[styles.timeRight, {height: showTime}]}>
                {/* <Seen /> */}
                <Text style={styles.textTime}>10.46</Text>
              </Animated.View>
            </TouchableOpacity>
          </ScrollView>
          <View>
            <TextInput
              placeholder="Enter a message"
              style={[
                styles.input,
                {fontFamily: chat ? 'Lato-Bold' : 'Lato-Regular'},
              ]}
              placeholderTextColor={'#A1A5C1'}
            />
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: 30,
                right: 30,
                width: 50,
                height: 50,
                backgroundColor: '#8BC83F',
                borderRadius: 50,
                zIndex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              // onPress={}
            >
              <MaterialIcons
                name="send"
                size={25}
                color={'#FFFFFF'}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

export default MessagesDetail;

const styles = StyleSheet.create({
  component: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  btnDelete: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    position: 'absolute',
    top: 24,
    right: 24,
    borderRadius: 25,
    backgroundColor: '#F5F4F8',
    zIndex: 1,
  },
  viewAvatar: {
    backgroundColor: '#FFFF',
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    margin: 10,
  },
  avatar: {
    width: 47,
    height: 47,
    borderRadius: 25,
  },
  viewIcon: {
    backgroundColor: '#FFFFFF',
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 12,
    top: 8,
    borderRadius: 12,
  },
  iconOnline: {
    backgroundColor: '#8BC83F',
    width: 8,
    height: 8,
    borderRadius: 8,
  },
  rightView: {
    marginTop: 16,
  },
  name: {
    fontFamily: 'Lato-Bold',
    color: '#252B5C',
    fontSize: 16,
    width: screenWidth / 2 - 24 - 48,
  },
  text: {
    color: '#53587A',
    fontFamily: 'Lato-Regular',
    marginLeft: 2,
    fontSize: 13,
    width: screenWidth / 2,
    height: 15,
    marginTop: 4,
  },
  input: {
    color: '#252B5C',
    fontSize: 15,
    height: 70,
    width: screenWidth - 48,
    marginLeft: 14,
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 14,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
  },
  leftMessage: {
    alignSelf: 'flex-start',
  },
  contentLeft: {
    backgroundColor: '#234F68',
    maxWidth: '80%',
    padding: 16,
    marginTop: 15,
    borderRadius: 25,
  },
  rightMessage: {
    alignSelf: 'flex-end',
  },
  contentRight: {
    backgroundColor: '#FFFFFF',
    maxWidth: '80%',
    marginTop: 15,
    padding: 16,
    borderRadius: 25,
  },
  textLeft: {
    fontFamily: 'Lato-Medium',
    color: '#FFFFFF',
    fontSize: 16,
  },
  textRight: {
    fontFamily: 'Lato-Medium',
    color: '#53587A',
    fontSize: 16,
  },
  textTime: {
    fontFamily: 'Lato-Medium',
    color: '#A1A5C1',
    fontSize: 14,
  },
  timeRight: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 10,
  },
  timeLeft: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 10,
  },
});
