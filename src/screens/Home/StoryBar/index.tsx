import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import {getImages} from '@/assets/Images';
import {StoryBarProps} from '@/utils/interface';
import {push} from '@/navigation/NavigationUtils';
const data = [
  {
    id: 1,
    avatar: getImages().picture_1,
    name: 'Hung 1',
    content: [
      {
        images: getImages().picture_1,
        type: 'image',
        finish: 0,
      },
      {
        images: getImages().picture_2,
        type: 'image',
        finish: 0,
      },
      {
        images: getImages().picture_3,
        type: 'image',
        finish: 0,
      },
    ],
  },
  // {id: 2, avatar: getImages().picture_2, name: 'Hung 2'},
  // {id: 3, avatar: getImages().picture_3, name: 'Hung 3'},
  // {id: 4, avatar: getImages().picture_4, name: 'Hung 4'},
  // {id: 5, avatar: getImages().picture_5, name: 'Hung 5'},
  // {id: 6, avatar: getImages().picture_4, name: 'Hung 6'},
];
const renderItem = ({item}: any, navigation: any) => {
  return (
    <TouchableOpacity
      style={styles.containerStory}
      activeOpacity={0.6}
      onPress={() => push({name: 'Stories', params: {content: item.content}})}
    >
      <Image
        source={item.avatar}
        style={styles.avatar}
      />
      <Text style={styles.name}>{item.name}</Text>
    </TouchableOpacity>
  );
};
const StoryBar: React.FC<StoryBarProps> = ({navigation}) => {
  return (
    <View>
      <FlatList
        data={data}
        renderItem={(item) => renderItem(item, navigation)}
        keyExtractor={(item) => item.id.toString()}
        horizontal
      />
    </View>
  );
};

export default StoryBar;

const styles = StyleSheet.create({
  containerStory: {
    alignItems: 'center',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 50,
    marginHorizontal: 7.5,
  },
  name: {
    fontSize: 11,
    color: '#252B5C',
    fontFamily: 'Lato-Regular',
    marginTop: 8,
  },
});
