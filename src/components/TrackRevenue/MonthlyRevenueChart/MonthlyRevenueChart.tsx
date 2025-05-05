import React from 'react';
import {View, Text, StyleSheet, ScrollView, Dimensions} from 'react-native';

const {width} = Dimensions.get('window');

// Function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amount);
};

const MonthlyRevenueChart = ({data}) => {
  // Get maximum value for scaling the bars
  const maxRevenue = Math.max(...data.result.monthlyRevenue);

  // If all values are 0, set a default height
  const maxBarHeight = 150;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      <View style={styles.container}>
        {data.result.details.map((month, index) => {
          // Calculate the height of the bar based on the revenue
          const barHeight =
            maxRevenue > 0 ? (month.revenue / maxRevenue) * maxBarHeight : 0;

          // Determine bar color based on revenue amount
          const barColor =
            month.revenue > 1000000
              ? '#4ade80' // green for high revenue
              : month.revenue > 0
              ? '#a78bfa' // purple for medium revenue
              : '#f472b6'; // pink for no revenue

          return (
            <View
              key={month.month}
              style={styles.barContainer}
            >
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight > 0 ? barHeight : 2,
                      backgroundColor: barColor,
                    },
                  ]}
                />
              </View>
              <Text style={styles.monthName}>{month.monthName}</Text>
              <Text style={styles.revenueText}>
                {formatCurrency(month.revenue)}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginVertical: 10,
    marginHorizontal: 15,
  },
  barContainer: {
    alignItems: 'center',
    width: 80,
    marginHorizontal: 5,
  },
  barWrapper: {
    height: 150,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 30,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  monthName: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
    color: '#4b5563',
  },
  revenueText: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default MonthlyRevenueChart;
