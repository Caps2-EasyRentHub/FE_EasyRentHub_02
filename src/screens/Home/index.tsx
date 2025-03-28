import {RefreshControl, StyleSheet, View} from 'react-native';
import React, {useCallback, useState} from 'react';

import StoryBar from './StoryBar';
import {HomeProps} from '@/utils/interface';
import TopLocation from './TopLocation';
import FeaturedEstates from './FeaturedEstate';
import Header from './Header';
import NearbyEstate from './NearbyEstate';
import {ScrollView} from 'react-native-virtualized-view';

const Home: React.FC<HomeProps> = ({navigation}) => {
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 100);
  }, []);

  return (
    <View style={styles.container}>
      <Header
        navigation={navigation}
        load={refreshing}
      />
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#8BC83F']}
          />
        }
      >
        <TopLocation />
        <FeaturedEstates navigation={navigation} />
        <NearbyEstate
          detail={false}
          id=""
        />
      </ScrollView>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
