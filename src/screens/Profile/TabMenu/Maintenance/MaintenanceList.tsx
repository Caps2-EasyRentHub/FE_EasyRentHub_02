import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Config} from '@/config';
import {AuthContext} from '@/context/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {format} from 'date-fns';
import {vi} from 'date-fns/locale';
import {RootStackParams} from '@/utils/type';
import {BackButton} from '@/components';

const StatusBadge = ({status}) => {
  let backgroundColor = '#E5E7EB';
  let textColor = '#4B5563';
  let statusText = 'Chưa xác định';

  switch (status) {
    case 'pending':
      backgroundColor = '#FEF3C7';
      textColor = '#D97706';
      statusText = 'Đang chờ';
      break;
    case 'approved':
      backgroundColor = '#D1FAE5';
      textColor = '#059669';
      statusText = 'Đã duyệt';
      break;
    case 'rejected':
      backgroundColor = '#FEE2E2';
      textColor = '#DC2626';
      statusText = 'Từ chối';
      break;
    case 'in_progress':
      backgroundColor = '#DBEAFE';
      textColor = '#3B82F6';
      statusText = 'Đang sửa chữa';
      break;
    case 'completed':
      backgroundColor = '#D1FAE5';
      textColor = '#059669';
      statusText = 'Hoàn thành';
      break;
  }

  return (
    <View style={[styles.statusBadge, {backgroundColor}]}>
      <Text style={[styles.statusText, {color: textColor}]}>{statusText}</Text>
    </View>
  );
};

// Priority badge component
const PriorityBadge = ({priority}) => {
  let backgroundColor = '#E5E7EB';
  let textColor = '#4B5563';
  let priorityText = 'Chưa xác định';

  switch (priority) {
    case 'low':
      backgroundColor = '#D1FAE5';
      textColor = '#059669';
      priorityText = 'Thấp';
      break;
    case 'medium':
      backgroundColor = '#FEF3C7';
      textColor = '#D97706';
      priorityText = 'Trung bình';
      break;
    case 'high':
      backgroundColor = '#FEE2E2';
      textColor = '#DC2626';
      priorityText = 'Cao';
      break;
  }

  return (
    <View style={[styles.priorityBadge, {backgroundColor}]}>
      <Text style={[styles.priorityText, {color: textColor}]}>
        {priorityText}
      </Text>
    </View>
  );
};

const MaintenanceList = () => {
  const {userToken, idUser} = useContext(AuthContext);
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [isLandlord, setIsLandlord] = useState(false);

  // Check if the user is a landlord
  useEffect(() => {
    const checkIfLandlord = async () => {
      try {
        const response = await fetch(`${Config.API_URL}/api/user/${idUser}`, {
          method: 'GET',
          headers: {Authorization: userToken},
        });
        const data = await response.json();
        const userIsLandlord = data?.user?.role === 'Landlord';
        setIsLandlord(userIsLandlord);
      } catch (error) {
        console.error('Error checking landlord status:', error);
        setIsLandlord(false);
      }
    };

    checkIfLandlord();
  }, [idUser, userToken]);

  const fetchMaintenanceRequests = async () => {
    try {
      setLoading(true);
      setError('');

      const myHeaders = new Headers();
      myHeaders.append('Authorization', userToken);

      const requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
      };

      // Use different endpoints based on user role
      const endpoint = isLandlord
        ? `${Config.API_URL}/api/maintenance/landlord`
        : `${Config.API_URL}/api/maintenance/tenant`;

      const response = await fetch(endpoint, requestOptions);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      setMaintenanceRequests(result.requests || []);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
      setError(
        'Không thể tải danh sách yêu cầu bảo trì. Vui lòng thử lại sau.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Only fetch data after we've determined the user role
    if (isLandlord !== null) {
      fetchMaintenanceRequests();
    }
  }, [isLandlord, userToken]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMaintenanceRequests();
  };

  const handlePressRequest = (requestId) => {
    if (isLandlord) {
      navigation.navigate('MaintenanceDetail', {requestId});
    } else {
      navigation.navigate('TenantMaintenanceDetail', {requestId});
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'dd/MM/yyyy', {locale: vi});
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return (
          <Ionicons
            name="time-outline"
            size={18}
            color="#D97706"
          />
        );
      case 'approved':
        return (
          <Ionicons
            name="checkmark-circle-outline"
            size={18}
            color="#059669"
          />
        );
      case 'rejected':
        return (
          <Ionicons
            name="close-circle-outline"
            size={18}
            color="#DC2626"
          />
        );
      case 'in_progress':
        return (
          <MaterialCommunityIcons
            name="progress-wrench"
            size={18}
            color="#3B82F6"
          />
        );
      case 'completed':
        return (
          <Ionicons
            name="checkmark-done-circle-outline"
            size={18}
            color="#059669"
          />
        );
      default:
        return (
          <Ionicons
            name="help-circle-outline"
            size={18}
            color="#4B5563"
          />
        );
    }
  };

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.requestItem}
      onPress={() => handlePressRequest(item._id)}
    >
      <View style={styles.requestHeader}>
        <View style={styles.headerLeft}>
          {getStatusIcon(item.status)}
          <Text
            style={styles.estateName}
            numberOfLines={1}
          >
            {item.estate?.name || item.estateName || 'Bất động sản'}
          </Text>
        </View>
        <StatusBadge status={item.status} />
      </View>

      <Text
        style={styles.requestDescription}
        numberOfLines={2}
      >
        {item.description}
      </Text>

      <View style={styles.requestFooter}>
        <View style={styles.requestInfo}>
          <Text style={styles.submittedDate}>
            Ngày gửi: {formatDate(item.createdAt)}
          </Text>
          <PriorityBadge priority={item.priority} />
        </View>
        <View style={styles.tenantInfo}>
          {item.tenant?.avatar && (
            <Image
              source={{uri: item.tenant.avatar}}
              style={styles.tenantAvatar}
            />
          )}
          <Text
            style={styles.tenantName}
            numberOfLines={1}
          >
            {isLandlord ? 'Người thuê' : 'Yêu cầu của bạn'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Các yêu cầu bảo trì</Text>
        <View style={{width: 40}} />
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#0066cc"
          />
          <Text style={styles.loadingText}>Đang tải yêu cầu...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color="#DC2626"
          />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchMaintenanceRequests}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : maintenanceRequests.length === 0 ? (
        <View style={styles.emptyContainer}>
          {/* <Image
            source={require('@/assets/Images/common/empty_notify.jpg')}
            style={styles.emptyImage}
          /> */}
          <Text style={styles.emptyTitle}>Không có yêu cầu bảo trì</Text>
          <Text style={styles.emptyDescription}>
            {isLandlord
              ? 'Hiện tại bạn không có yêu cầu bảo trì nào từ người thuê'
              : 'Bạn chưa gửi yêu cầu bảo trì nào'}
          </Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={fetchMaintenanceRequests}
          >
            <Text style={styles.refreshButtonText}>Làm mới</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={maintenanceRequests}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0066cc']}
              tintColor="#0066cc"
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyImage: {
    width: 100,
    height: 100,
    paddingTop: 24,
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    marginTop: 10,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  requestItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  estateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  requestDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 12,
    lineHeight: 20,
  },
  requestFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  requestInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  submittedDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tenantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tenantAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  tenantName: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default MaintenanceList;
