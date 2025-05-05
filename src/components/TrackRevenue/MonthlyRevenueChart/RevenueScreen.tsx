import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParams} from '@/utils/type';
import Icon from 'react-native-vector-icons/Ionicons';
import IconsMaterial from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import moment from 'moment';
import {AuthContext} from '@/context/AuthContext';
import {Config} from '@/config';
import DateTimePicker from '@react-native-community/datetimepicker';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString) => {
  return moment(dateString).format('DD/MM/YYYY');
};

const RevenueScreen = () => {
  const {t} = useTranslation();
  const {userToken} = useContext(AuthContext);
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();

  const [viewType, setViewType] = useState('monthly');
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState(null);

  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const fetchRevenueData = async (type) => {
    setLoading(true);
    setError(null);

    try {
      const myHeaders = new Headers();
      myHeaders.append('Authorization', userToken);

      const requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
      };

      const apiType = type === 'monthly' ? 'monthly' : 'quarterly';

      const response = await fetch(
        `${Config.API_URL}/api/landlord/track-revenue?type=${apiType}`,
        requestOptions,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      setRevenueData(result);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      setError('Không thể tải dữ liệu doanh thu. Vui lòng thử lại sau.');
      Alert.alert(
        'Lỗi',
        'Không thể tải dữ liệu doanh thu. Vui lòng thử lại sau.',
        [{text: 'OK'}],
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData(viewType);
    setSelectedPeriod(null);
    setModalVisible(false);
  }, [viewType]);

  useEffect(() => {
    if (selectedPeriod && selectedPeriod.transactions) {
      let filtered = [...selectedPeriod.transactions];

      if (startDate) {
        filtered = filtered.filter((transaction) =>
          moment(transaction.startDate).isSameOrAfter(moment(startDate), 'day'),
        );
      }

      if (endDate) {
        filtered = filtered.filter((transaction) =>
          moment(transaction.endDate).isSameOrBefore(moment(endDate), 'day'),
        );
      }

      setFilteredTransactions(filtered);
    }
  }, [selectedPeriod, startDate, endDate]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleViewTypeChange = (type) => {
    if (type !== viewType) {
      setViewType(type);
    }
  };

  const handlePeriodPress = (item) => {
    // console.log(item);
    setSelectedPeriod(item);
    setFilteredTransactions(item.transactions || []);
    // Reset date filters when opening modal
    setStartDate(null);
    setEndDate(null);
    setModalVisible(true);
  };

  const handleRefresh = () => {
    fetchRevenueData(viewType);
  };

  const handleStartDateChange = (event, date) => {
    setShowStartDatePicker(false);
    if (date) {
      setStartDate(date);
    }
  };

  const handleEndDateChange = (event, date) => {
    setShowEndDatePicker(false);
    if (date) {
      setEndDate(date);
    }
  };

  const clearDateFilters = () => {
    setStartDate(null);
    setEndDate(null);
    if (selectedPeriod) {
      setFilteredTransactions(selectedPeriod.transactions || []);
    }
  };

  if (loading || !revenueData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#0066cc"
        />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  // Get revenue data details based on view type
  const details = revenueData.result.details || [];

  // Get maximum value for scaling the bars - with safety checks
  const maxRevenue =
    viewType === 'monthly'
      ? Math.max(...(revenueData.result.monthlyRevenue || [0]))
      : Math.max(...(revenueData.result.quarterlyRevenue || [0]));

  const maxBarHeight = 100;

  const renderTransactionItem = ({item}) => {
    return (
      <View style={styles.transactionItem}>
        <View style={styles.transactionHeader}>
          <Text style={styles.estateName}>{item.estateName}</Text>
          <Text style={styles.price}>{formatCurrency(item.rentalPrice)}</Text>
        </View>
        <Text style={styles.tenant}>Khách hàng: {item.tenant}</Text>
        <View style={styles.dateRow}>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Ngày bắt đầu:</Text>
            <Text style={styles.dateValue}>{formatDate(item.startDate)}</Text>
          </View>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Ngày kết thúc:</Text>
            <Text style={styles.dateValue}>{formatDate(item.endDate)}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleGoBack}
          style={styles.backButton}
        >
          <Icon
            name="chevron-back"
            size={24}
            color="#000"
          />
        </TouchableOpacity>
        <Text style={styles.title}>Theo dõi doanh thu</Text>
        <TouchableOpacity></TouchableOpacity>
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          Tổng doanh thu: {formatCurrency(revenueData.result.totalRevenue)}
        </Text>
        <Text style={styles.summaryText}>
          Số giao dịch: {revenueData.allTimeStats.transactionCount}
        </Text>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            viewType === 'monthly' && styles.activeFilterButton,
          ]}
          onPress={() => handleViewTypeChange('monthly')}
        >
          <Text
            style={[
              styles.filterText,
              viewType === 'monthly' && styles.activeFilterText,
            ]}
          >
            Theo Tháng
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            viewType === 'quarterly' && styles.activeFilterButton,
          ]}
          onPress={() => handleViewTypeChange('quarterly')}
        >
          <Text
            style={[
              styles.filterText,
              viewType === 'quarterly' && styles.activeFilterText,
            ]}
          >
            Theo Quý
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chartContainer}
        contentContainerStyle={styles.chartContentContainer}
      >
        <View style={styles.chartInner}>
          {details.map((item, index) => {
            const barHeight =
              maxRevenue > 0 ? (item.revenue / maxRevenue) * maxBarHeight : 0;

            const barColor =
              item.revenue > 1000000
                ? '#4ade80'
                : item.revenue > 0
                ? '#a78bfa'
                : '#f472b6';

            const itemName =
              viewType === 'monthly' ? item.monthName : item.name;

            return (
              <TouchableOpacity
                key={index}
                style={styles.barContainer}
                onPress={() =>
                  item.revenue > 0 ? handlePeriodPress(item) : null
                }
                activeOpacity={item.revenue > 0 ? 0.7 : 1}
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
                <Text style={styles.periodName}>{itemName}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Chi tiết{' '}
                {viewType === 'monthly'
                  ? selectedPeriod?.monthName
                  : selectedPeriod?.name}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Icon
                  name="close"
                  size={24}
                  color="#374151"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.modalSummary}>
                <Text style={styles.modalSummaryText}>
                  Tổng doanh thu: {formatCurrency(selectedPeriod?.revenue || 0)}
                </Text>
                <Text style={styles.modalSummaryText}>
                  Số giao dịch: {filteredTransactions?.length || 0}
                </Text>
              </View>

              <View style={styles.dateFilterSection}>
                <Text style={styles.dateFilterTitle}>Lọc theo ngày</Text>

                <View style={styles.dateFilterRow}>
                  <View style={styles.datePickerContainer}>
                    <Text style={styles.dateFilterLabel}>Từ ngày:</Text>
                    <TouchableOpacity
                      style={styles.datePickerButton}
                      onPress={() => setShowStartDatePicker(true)}
                    >
                      <Text style={styles.datePickerButtonText}>
                        {startDate ? formatDate(startDate) : 'Chọn ngày'}
                      </Text>
                      <IconsMaterial
                        name="calendar-today"
                        size={16}
                        color="#6b7280"
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.datePickerContainer}>
                    <Text style={styles.dateFilterLabel}>Đến ngày:</Text>
                    <TouchableOpacity
                      style={styles.datePickerButton}
                      onPress={() => setShowEndDatePicker(true)}
                    >
                      <Text style={styles.datePickerButtonText}>
                        {endDate ? formatDate(endDate) : 'Chọn ngày'}
                      </Text>
                      <IconsMaterial
                        name="calendar-today"
                        size={16}
                        color="#6b7280"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Date filter actions */}
                <View style={styles.dateFilterActions}>
                  <TouchableOpacity
                    style={styles.clearDateFilterButton}
                    onPress={clearDateFilters}
                  >
                    <Text style={styles.clearDateFilterText}>Xóa bộ lọc</Text>
                  </TouchableOpacity>
                </View>

                {showStartDatePicker && (
                  <DateTimePicker
                    value={startDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleStartDateChange}
                  />
                )}
                {showEndDatePicker && (
                  <DateTimePicker
                    value={endDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleEndDateChange}
                  />
                )}
              </View>

              <Text style={styles.transactionsTitle}>
                Danh sách giao dịch{' '}
                {filteredTransactions.length > 0
                  ? `(${filteredTransactions.length})`
                  : ''}
              </Text>

              {filteredTransactions.length > 0 ? (
                <FlatList
                  data={filteredTransactions}
                  renderItem={renderTransactionItem}
                  keyExtractor={(item) => item.id}
                  style={styles.transactionList}
                  contentContainerStyle={styles.transactionListContent}
                />
              ) : (
                <Text style={styles.noTransactionsText}>
                  {startDate || endDate
                    ? 'Không có giao dịch nào phù hợp với bộ lọc.'
                    : 'Không có giao dịch trong khoảng thời gian này.'}
                </Text>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 10,
    color: '#4b5563',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 15,
    color: '#374151',
  },
  filterContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginBottom: 10,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeFilterButton: {
    backgroundColor: '#8BC83F',
    borderColor: '#8BC83F',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
  },
  activeFilterText: {
    color: 'white',
  },
  summaryContainer: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryText: {
    fontSize: 14,
    color: '#4b5563',
    marginVertical: 4,
  },
  chartContainer: {
    marginBottom: 20,
  },
  chartContentContainer: {
    paddingHorizontal: 15,
  },
  chartInner: {
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
  },
  barContainer: {
    alignItems: 'center',
    width: 100,
    marginHorizontal: 5,
  },
  barWrapper: {
    height: 150,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 40,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  periodName: {
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  infoIcon: {
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    paddingHorizontal: 20,
  },
  modalSummary: {
    backgroundColor: '#f3f4f6',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  modalSummaryText: {
    fontSize: 14,
    color: '#4b5563',
    marginVertical: 3,
  },
  dateFilterSection: {
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  dateFilterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  dateFilterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  datePickerContainer: {
    flex: 1,
    marginRight: 10,
  },
  dateFilterLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 5,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    backgroundColor: 'white',
  },
  datePickerButtonText: {
    fontSize: 13,
    color: '#4b5563',
  },
  dateFilterActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  clearDateFilterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: '#f3f4f6',
  },
  clearDateFilterText: {
    fontSize: 12,
    color: '#4b5563',
  },
  transactionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  transactionList: {
    maxHeight: 270,
  },
  transactionListContent: {
    paddingBottom: 20,
  },
  noTransactionsText: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  transactionItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  estateName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  price: {
    fontSize: 15,
    fontWeight: '600',
    color: '#16a34a',
  },
  tenant: {
    fontSize: 13,
    color: '#4b5563',
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  dateValue: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '500',
  },
});

export default RevenueScreen;
