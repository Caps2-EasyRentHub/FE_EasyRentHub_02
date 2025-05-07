import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Config} from '@/config';
import {AuthContext} from '@/context/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {format} from 'date-fns';
import {vi} from 'date-fns/locale';
import {BackButton} from '@/components';
import Modal from 'react-native-modal';
import ImageViewer from 'react-native-image-zoom-viewer';
import Icon from 'react-native-vector-icons/Ionicons';

const TenantMaintenanceDetail = () => {
  const route = useRoute();
  const {requestId} = route.params;
  const navigation = useNavigation();
  const {userToken} = useContext(AuthContext);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    rating: 0,
    tenantFeedback: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchMaintenanceRequest = async () => {
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

      const response = await fetch(
        `${Config.API_URL}/api/maintenance/${requestId}`,
        requestOptions,
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      setRequest(result.request);

      // Prepare images for viewer
      if (result.request?.images && result.request.images.length > 0) {
        const formattedImages = result.request.images.map((url) => ({url}));
        setImageUrls(formattedImages);
      }
    } catch (error) {
      console.error('Error fetching maintenance request:', error);
      setError(
        'Không thể tải thông tin yêu cầu bảo trì. Vui lòng thử lại sau.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenanceRequest();
  }, [requestId, userToken]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', {locale: vi});
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Đang chờ xử lý';
      case 'approved':
        return 'Đã phê duyệt';
      case 'rejected':
        return 'Đã từ chối';
      case 'in_progress':
        return 'Đang sửa chữa';
      case 'completed':
        return 'Hoàn thành';
      default:
        return 'Không xác định';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#D97706';
      case 'approved':
        return '#059669';
      case 'rejected':
        return '#DC2626';
      case 'in_progress':
        return '#3B82F6';
      case 'completed':
        return '#059669';
      default:
        return '#6B7280';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'low':
        return 'Thấp';
      case 'medium':
        return 'Trung bình';
      case 'high':
        return 'Cao';
      default:
        return 'Không xác định';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return '#059669';
      case 'medium':
        return '#D97706';
      case 'high':
        return '#DC2626';
      default:
        return '#6B7280';
    }
  };

  const handleImagePress = (index) => {
    setCurrentImageIndex(index);
    setShowImageViewer(true);
  };

  const handleSubmitFeedback = async () => {
    if (feedbackData.rating === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn số sao đánh giá');
      return;
    }

    if (!feedbackData.tenantFeedback.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung đánh giá');
      return;
    }

    try {
      setSubmitting(true);

      const myHeaders = new Headers();
      myHeaders.append('Authorization', userToken);
      myHeaders.append('Content-Type', 'application/json');

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(feedbackData),
        redirect: 'follow',
      };

      const response = await fetch(
        `${Config.API_URL}/api/maintenance/${requestId}/feedback`,
        requestOptions,
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      Alert.alert('Thành công', 'Đã gửi đánh giá của bạn thành công');
      setShowFeedbackModal(false);
      fetchMaintenanceRequest(); // Refresh data to show feedback
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Lỗi', 'Không thể gửi đánh giá. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const RatingStars = ({
    rating,
    onRatingChange,
    size = 24,
    editable = true,
  }) => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => editable && onRatingChange(star)}
            disabled={!editable}
            style={{padding: 4}}
          >
            <FontAwesome
              name={rating >= star ? 'star' : 'star-o'}
              size={size}
              color={rating >= star ? '#FFC107' : '#D1D5DB'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#0066cc"
        />
        <Text style={styles.loadingText}>Đang tải thông tin yêu cầu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons
          name="alert-circle-outline"
          size={64}
          color="#DC2626"
        />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchMaintenanceRequest}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!request) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Không tìm thấy thông tin yêu cầu bảo trì
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack}>
          <Icon
            name="chevron-back"
            size={24}
            color="#000"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết bảo trì</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statusSection}>
          <View style={styles.statusHeader}>
            <Text
              style={[
                styles.statusText,
                {color: getStatusColor(request.status)},
              ]}
            >
              {getStatusText(request.status)}
            </Text>
            <View
              style={[
                styles.priorityBadge,
                {backgroundColor: getPriorityColor(request.priority) + '20'},
              ]}
            >
              <Text
                style={[
                  styles.priorityText,
                  {color: getPriorityColor(request.priority)},
                ]}
              >
                {getPriorityText(request.priority)}
              </Text>
            </View>
          </View>
          <Text style={styles.timestampText}>
            Ngày yêu cầu: {formatDate(request.createdAt)}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thông tin bất động sản</Text>
          <View style={styles.propertyInfoRow}>
            <Text style={styles.propertyName}>
              {request.estate?.name || 'Không có thông tin'}
            </Text>
          </View>
          {request.estate?.address && (
            <View style={styles.addressContainer}>
              <Text style={styles.addressText}>
                {`${request.estate.address.road || ''}, ${
                  request.estate.address.quarter || ''
                }, ${request.estate.address.city || ''}`}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mô tả vấn đề</Text>
          <Text style={styles.descriptionText}>{request.description}</Text>
        </View>

        {request.images && request.images.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Hình ảnh vấn đề</Text>
            <View style={styles.imagesContainer}>
              {request.images.map((imageUrl, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.imageWrapper}
                  onPress={() => handleImagePress(index)}
                >
                  <Image
                    source={{uri: imageUrl}}
                    style={styles.image}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {request.status === 'approved' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Thông tin phê duyệt</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Loại bảo trì:</Text>
              <Text style={styles.infoValue}>
                {request.maintenanceType === 'landlord'
                  ? 'Chủ nhà tự sửa'
                  : 'Thuê đơn vị sửa chữa'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Chi phí ước tính:</Text>
              <Text style={styles.infoValue}>
                {request.estimatedCost
                  ? request.estimatedCost.toLocaleString('vi-VN') + ' VNĐ'
                  : 'Chưa xác định'}
              </Text>
            </View>
            {request.landlordNotes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Ghi chú từ chủ nhà:</Text>
                <Text style={styles.notesText}>{request.landlordNotes}</Text>
              </View>
            )}
          </View>
        )}

        {request.status === 'completed' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Thông tin hoàn thành</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Chi phí thực tế:</Text>
              <Text style={styles.infoValue}>
                {request.actualCost
                  ? request.actualCost.toLocaleString('vi-VN') + ' VNĐ'
                  : 'Không có thông tin'}
              </Text>
            </View>
            {request.completionDate && (
              <Text style={styles.completionDate}>
                Ngày hoàn thành: {formatDate(request.completionDate)}
              </Text>
            )}
            {request.invoiceImages && request.invoiceImages.length > 0 && (
              <View style={styles.invoiceImagesContainer}>
                <Text style={styles.invoiceImagesLabel}>
                  Hình ảnh hóa đơn/sửa chữa:
                </Text>
                <View style={styles.imagesContainer}>
                  {request.invoiceImages.map((imageUrl, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.imageWrapper}
                      onPress={() => {
                        setImageUrls(
                          request.invoiceImages.map((url) => ({url})),
                        );
                        handleImagePress(index);
                      }}
                    >
                      <Image
                        source={{uri: imageUrl}}
                        style={styles.image}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Feedback section if already submitted */}
        {request.status === 'completed' && request.tenantFeedback && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Đánh giá của bạn</Text>
            <RatingStars
              rating={request.rating || 0}
              onRatingChange={() => {}}
              editable={false}
            />
            <View style={styles.feedbackContainer}>
              <Text style={styles.feedbackText}>{request.tenantFeedback}</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        {request.status === 'completed' && !request.tenantFeedback && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowFeedbackModal(true)}
            >
              <FontAwesome
                name="star"
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.actionButtonText}>Đánh giá bảo trì</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Feedback Modal */}
      <Modal
        isVisible={showFeedbackModal}
        onBackdropPress={() => setShowFeedbackModal(false)}
        backdropOpacity={0.5}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Đánh giá bảo trì</Text>
            <TouchableOpacity onPress={() => setShowFeedbackModal(false)}>
              <Ionicons
                name="close"
                size={24}
                color="#1F2937"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.ratingLabel}>Chất lượng sửa chữa:</Text>
          <RatingStars
            rating={feedbackData.rating}
            onRatingChange={(rating) =>
              setFeedbackData({...feedbackData, rating})
            }
          />

          <Text style={styles.feedbackLabel}>Nhận xét của bạn:</Text>
          <TextInput
            style={styles.feedbackInput}
            multiline
            placeholder="Nhập nhận xét về chất lượng sửa chữa..."
            value={feedbackData.tenantFeedback}
            onChangeText={(text) =>
              setFeedbackData({...feedbackData, tenantFeedback: text})
            }
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.disabledButton]}
            onPress={handleSubmitFeedback}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
            )}
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal
        isVisible={showImageViewer}
        onBackdropPress={() => setShowImageViewer(false)}
        backdropOpacity={0.9}
        style={styles.imageViewerModal}
      >
        <View style={styles.imageViewerContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowImageViewer(false)}
          >
            <Ionicons
              name="close-circle"
              size={32}
              color="#FFFFFF"
            />
          </TouchableOpacity>
          <ImageViewer
            imageUrls={imageUrls}
            index={currentImageIndex}
            enableSwipeDown={true}
            onSwipeDown={() => setShowImageViewer(false)}
            backgroundColor="transparent"
            saveToLocalByLongPress={false}
            renderIndicator={(currentIndex, allSize) => (
              <View style={styles.imageIndicator}>
                <Text style={styles.imageIndicatorText}>
                  {currentIndex}/{allSize}
                </Text>
              </View>
            )}
          />
        </View>
      </Modal>
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
  statusSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  timestampText: {
    fontSize: 14,
    color: '#6B7280',
  },
  card: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  propertyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  addressContainer: {
    marginTop: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#4B5563',
  },
  descriptionText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  imageWrapper: {
    width: '30%',
    aspectRatio: 1,
    margin: '1.66%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    width: 120,
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  notesContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  completionDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  invoiceImagesContainer: {
    marginTop: 16,
  },
  invoiceImagesLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'center',
  },
  feedbackContainer: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  feedbackText: {
    fontSize: 14,
    color: '#4B5563',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  actionButtonsContainer: {
    padding: 16,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066cc',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  modal: {
    justifyContent: 'center',
    margin: 0,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 8,
  },
  feedbackLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginTop: 16,
    marginBottom: 8,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  imageViewerModal: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    width: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 999,
  },
  imageIndicator: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageIndicatorText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
});

export default TenantMaintenanceDetail;
