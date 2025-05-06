import React, {useState, useEffect, useContext, useRef} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
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
import {format} from 'date-fns';
import {vi} from 'date-fns/locale';
import {BackButton} from '@/components';
import BottomSheet, {BottomSheetBackdrop} from '@gorhom/bottom-sheet';
import ImageViewer from 'react-native-image-zoom-viewer';
import Modal from 'react-native-modal';
import ImagePicker from 'react-native-image-crop-picker';

const MaintenanceDetail = () => {
  const route = useRoute();
  const {requestId} = route.params;
  const navigation = useNavigation();
  const {userToken} = useContext(AuthContext);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [formData, setFormData] = useState({
    maintenanceType: 'contractor',
    estimatedCost: '',
    landlordNotes: '',
    rejectionReason: '',
    actualCost: '',
  });
  const [invoiceImages, setInvoiceImages] = useState([]);
  const [uploadedInvoiceImages, setUploadedInvoiceImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState([]);
  const bottomSheetRef = useRef(null);
  const snapPoints = ['50%'];

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

  const handleApproveRequest = async () => {
    if (!formData.estimatedCost) {
      Alert.alert('Lỗi', 'Vui lòng nhập chi phí ước tính');
      return;
    }

    try {
      setSubmitting(true);

      const myHeaders = new Headers();
      myHeaders.append('Authorization', userToken);
      myHeaders.append('Content-Type', 'application/json');

      const requestOptions = {
        method: 'PATCH',
        headers: myHeaders,
        body: JSON.stringify({
          status: 'approved',
          maintenanceType: formData.maintenanceType,
          estimatedCost: parseFloat(formData.estimatedCost),
          landlordNotes: formData.landlordNotes,
        }),
        redirect: 'follow',
      };

      const response = await fetch(
        `${Config.API_URL}/api/maintenance/landlord/${requestId}`,
        requestOptions,
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      Alert.alert('Thành công', 'Đã phê duyệt yêu cầu bảo trì thành công');
      setShowApproveForm(false);
      fetchMaintenanceRequest();
    } catch (error) {
      console.error('Error approving maintenance request:', error);
      Alert.alert(
        'Lỗi',
        'Không thể phê duyệt yêu cầu bảo trì. Vui lòng thử lại sau.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!formData.rejectionReason) {
      Alert.alert('Lỗi', 'Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      setSubmitting(true);

      const myHeaders = new Headers();
      myHeaders.append('Authorization', userToken);
      myHeaders.append('Content-Type', 'application/json');

      const requestOptions = {
        method: 'PATCH',
        headers: myHeaders,
        body: JSON.stringify({
          status: 'rejected',
          rejectionReason: formData.rejectionReason,
        }),
        redirect: 'follow',
      };

      const response = await fetch(
        `${Config.API_URL}/api/maintenance/landlord/${requestId}`,
        requestOptions,
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      Alert.alert('Thành công', 'Đã từ chối yêu cầu bảo trì thành công');
      setShowRejectForm(false);
      fetchMaintenanceRequest();
    } catch (error) {
      console.error('Error rejecting maintenance request:', error);
      Alert.alert(
        'Lỗi',
        'Không thể từ chối yêu cầu bảo trì. Vui lòng thử lại sau.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    try {
      setSubmitting(true);

      const myHeaders = new Headers();
      myHeaders.append('Authorization', userToken);
      myHeaders.append('Content-Type', 'application/json');

      const requestOptions = {
        method: 'PATCH',
        headers: myHeaders,
        body: JSON.stringify({status}),
        redirect: 'follow',
      };

      const response = await fetch(
        `${Config.API_URL}/api/maintenance/progress/${requestId}`,
        requestOptions,
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      Alert.alert(
        'Thành công',
        `Đã cập nhật trạng thái thành ${
          status === 'in_progress' ? 'đang sửa chữa' : 'hoàn thành'
        }`,
      );
      fetchMaintenanceRequest();
    } catch (error) {
      console.error('Error updating maintenance status:', error);
      Alert.alert(
        'Lỗi',
        'Không thể cập nhật trạng thái yêu cầu bảo trì. Vui lòng thử lại sau.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteRequest = async () => {
    if (!formData.actualCost) {
      Alert.alert('Lỗi', 'Vui lòng nhập chi phí thực tế');
      return;
    }

    if (uploadedInvoiceImages.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng tải lên ít nhất một hình ảnh hóa đơn');
      return;
    }

    try {
      setSubmitting(true);

      const myHeaders = new Headers();
      myHeaders.append('Authorization', userToken);
      myHeaders.append('Content-Type', 'application/json');

      const requestOptions = {
        method: 'PATCH',
        headers: myHeaders,
        body: JSON.stringify({
          status: 'completed',
          actualCost: parseFloat(formData.actualCost),
          invoiceImages: uploadedInvoiceImages,
        }),
        redirect: 'follow',
      };

      const response = await fetch(
        `${Config.API_URL}/api/maintenance/progress/${requestId}`,
        requestOptions,
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      Alert.alert('Thành công', 'Đã hoàn thành yêu cầu bảo trì thành công');
      setShowCompleteForm(false);
      fetchMaintenanceRequest();
    } catch (error) {
      console.error('Error completing maintenance request:', error);
      Alert.alert(
        'Lỗi',
        'Không thể hoàn thành yêu cầu bảo trì. Vui lòng thử lại sau.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openImagePicker = () => {
    ImagePicker.openPicker({
      multiple: true,
      mediaType: 'photo',
      includeBase64: true,
    }).then(async (images) => {
      setInvoiceImages(images.map((img) => img.path));

      // Upload images to cloud
      const uploadPromises = images.map(async (img) => {
        const formData = new FormData();
        formData.append('file', {
          uri: img.path,
          type: 'image/jpeg',
          name: 'image.jpg',
        });
        formData.append('upload_preset', 'zkrhoyir');
        formData.append('cloud_name', 'dw1sniewf');

        try {
          const response = await fetch(
            'https://api.cloudinary.com/v1_1/dw1sniewf/image/upload',
            {
              method: 'POST',
              body: formData,
            },
          );
          const result = await response.json();
          return result.url;
        } catch (error) {
          console.error('Error uploading image:', error);
          return null;
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const validUrls = uploadedUrls.filter((url) => url !== null);
      setUploadedInvoiceImages(validUrls);
    });
  };

  const handleImagePress = (index) => {
    setCurrentImageIndex(index);
    setShowImageViewer(true);
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
        <BackButton />
        <Text style={styles.title}>Chi tiết bảo trì</Text>
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
            Yêu cầu lúc: {formatDate(request.createdAt)}
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
            <View style={styles.propertyInfoRow}>
              <Text style={styles.propertyInfoLabel}>Địa chỉ:</Text>
              <Text style={styles.propertyInfoValue}>
                {`${request.estate.address.road || ''}, ${
                  request.estate.address.quarter || ''
                }, ${request.estate.address.city || ''}`}
              </Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.propertyInfoRow}>
            <Text style={styles.propertyInfoLabel}>Người thuê:</Text>
            <Text style={styles.propertyInfoValue}>
              {request.tenant?.email || 'Không có thông tin'}
            </Text>
          </View>
          {request.tenant?.avatar && (
            <View style={styles.tenantAvatarContainer}>
              <Image
                source={{uri: request.tenant.avatar}}
                style={styles.tenantAvatar}
              />
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
            <View style={styles.approvalInfoRow}>
              <Text style={styles.approvalInfoLabel}>Loại bảo trì:</Text>
              <Text style={styles.approvalInfoValue}>
                {request.maintenanceType === 'landlord'
                  ? 'Chủ nhà tự sửa'
                  : 'Thuê đơn vị sửa chữa'}
              </Text>
            </View>
            <View style={styles.approvalInfoRow}>
              <Text style={styles.approvalInfoLabel}>Chi phí ước tính:</Text>
              <Text style={styles.approvalInfoValue}>
                {request.estimatedCost
                  ? request.estimatedCost.toLocaleString('vi-VN') + ' VNĐ'
                  : 'Chưa xác định'}
              </Text>
            </View>
            {request.landlordNotes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Ghi chú:</Text>
                <Text style={styles.notesText}>{request.landlordNotes}</Text>
              </View>
            )}
          </View>
        )}

        {request.status === 'rejected' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Lý do từ chối</Text>
            <Text style={styles.rejectionReason}>
              {request.rejectionReason}
            </Text>
          </View>
        )}

        {request.status === 'completed' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Thông tin hoàn thành</Text>
            <View style={styles.completionInfoRow}>
              <Text style={styles.completionInfoLabel}>Chi phí thực tế:</Text>
              <Text style={styles.completionInfoValue}>
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

        {/* Action Buttons based on request status */}
        <View style={styles.actionButtonsContainer}>
          {request.status === 'pending' && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => setShowApproveForm(true)}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color="#FFFFFF"
                />
                <Text style={styles.actionButtonText}>Phê duyệt</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => setShowRejectForm(true)}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={18}
                  color="#FFFFFF"
                />
                <Text style={styles.actionButtonText}>Từ chối</Text>
              </TouchableOpacity>
            </>
          )}

          {request.status === 'approved' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.inProgressButton]}
              onPress={() => handleUpdateStatus('in_progress')}
            >
              <MaterialCommunityIcons
                name="progress-wrench"
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.actionButtonText}>Bắt đầu sửa chữa</Text>
            </TouchableOpacity>
          )}

          {request.status === 'in_progress' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => setShowCompleteForm(true)}
            >
              <Ionicons
                name="checkmark-done-circle-outline"
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.actionButtonText}>Hoàn thành</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Approve Form Bottom Sheet */}
      {showApproveForm && (
        <View style={styles.formContainer}>
          <TouchableOpacity
            style={styles.formCloseButton}
            onPress={() => setShowApproveForm(false)}
          >
            <Ionicons
              name="close"
              size={24}
              color="#000000"
            />
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.formScrollView}
          >
            <Text style={styles.formTitle}>Phê duyệt yêu cầu bảo trì</Text>

            <Text style={styles.formLabel}>Loại bảo trì:</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() =>
                  setFormData({...formData, maintenanceType: 'contractor'})
                }
              >
                <View style={styles.radioCircle}>
                  {formData.maintenanceType === 'contractor' && (
                    <View style={styles.radioChecked} />
                  )}
                </View>
                <Text style={styles.radioText}>Thuê đơn vị sửa chữa</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioOption}
                onPress={() =>
                  setFormData({...formData, maintenanceType: 'landlord'})
                }
              >
                <View style={styles.radioCircle}>
                  {formData.maintenanceType === 'landlord' && (
                    <View style={styles.radioChecked} />
                  )}
                </View>
                <Text style={styles.radioText}>Chủ nhà tự sửa chữa</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.formLabel}>Chi phí ước tính (VNĐ):</Text>
            <TextInput
              style={styles.formInput}
              keyboardType="numeric"
              placeholder="Nhập chi phí ước tính"
              value={formData.estimatedCost}
              onChangeText={(text) =>
                setFormData({...formData, estimatedCost: text})
              }
            />

            <Text style={styles.formLabel}>Ghi chú (tùy chọn):</Text>
            <TextInput
              style={[styles.formInput, styles.textArea]}
              placeholder="Nhập thông tin về phương án sửa chữa, thời gian dự kiến..."
              value={formData.landlordNotes}
              onChangeText={(text) =>
                setFormData({...formData, landlordNotes: text})
              }
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.disabledButton]}
              onPress={handleApproveRequest}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Text style={styles.submitButtonText}>Phê duyệt</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Reject Form */}
      {showRejectForm && (
        <View style={styles.formContainer}>
          <TouchableOpacity
            style={styles.formCloseButton}
            onPress={() => setShowRejectForm(false)}
          >
            <Ionicons
              name="close"
              size={24}
              color="#000000"
            />
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.formScrollView}
          >
            <Text style={styles.formTitle}>Từ chối yêu cầu bảo trì</Text>

            <Text style={styles.formLabel}>Lý do từ chối:</Text>
            <TextInput
              style={[styles.formInput, styles.textArea]}
              placeholder="Nhập lý do từ chối yêu cầu bảo trì..."
              value={formData.rejectionReason}
              onChangeText={(text) =>
                setFormData({...formData, rejectionReason: text})
              }
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[
                styles.submitButton,
                styles.rejectButton,
                submitting && styles.disabledButton,
              ]}
              onPress={handleRejectRequest}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Text style={styles.submitButtonText}>Từ chối</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Complete Form */}
      {showCompleteForm && (
        <View style={styles.formContainer}>
          <TouchableOpacity
            style={styles.formCloseButton}
            onPress={() => setShowCompleteForm(false)}
          >
            <Ionicons
              name="close"
              size={24}
              color="#000000"
            />
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.formScrollView}
          >
            <Text style={styles.formTitle}>Hoàn thành bảo trì</Text>

            <Text style={styles.formLabel}>Chi phí thực tế (VNĐ):</Text>
            <TextInput
              style={styles.formInput}
              keyboardType="numeric"
              placeholder="Nhập chi phí thực tế"
              value={formData.actualCost}
              onChangeText={(text) =>
                setFormData({...formData, actualCost: text})
              }
            />

            <Text style={styles.formLabel}>Hình ảnh hóa đơn/sửa chữa:</Text>
            <TouchableOpacity
              style={styles.imagePicker}
              onPress={openImagePicker}
            >
              <Ionicons
                name="camera-outline"
                size={24}
                color="#0066cc"
              />
              <Text style={styles.imagePickerText}>
                Tải lên hình ảnh hóa đơn
              </Text>
            </TouchableOpacity>

            {invoiceImages.length > 0 && (
              <View style={styles.selectedImagesContainer}>
                <Text style={styles.selectedImagesTitle}>
                  Đã chọn {invoiceImages.length} hình ảnh
                </Text>
                <View style={styles.selectedImagesList}>
                  {invoiceImages.map((img, index) => (
                    <Image
                      key={index}
                      source={{uri: img}}
                      style={styles.selectedImageThumbnail}
                    />
                  ))}
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.submitButton,
                styles.completeButton,
                submitting && styles.disabledButton,
              ]}
              onPress={handleCompleteRequest}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Text style={styles.submitButtonText}>Hoàn thành</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Image Viewer Modal */}
      <Modal
        isVisible={showImageViewer}
        onBackdropPress={() => setShowImageViewer(false)}
        onBackButtonPress={() => setShowImageViewer(false)}
        backdropOpacity={0.9}
        style={styles.modalContainer}
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
  timestampText: {
    fontSize: 14,
    color: '#6B7280',
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
    marginBottom: 8,
  },
  propertyInfoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  propertyInfoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    width: 90,
  },
  propertyInfoValue: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  tenantAvatarContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  tenantAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
  approvalInfoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  approvalInfoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    width: 120,
  },
  approvalInfoValue: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  approvalDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'right',
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
  rejectionReason: {
    fontSize: 14,
    color: '#DC2626',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  rejectionDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'right',
  },
  completionInfoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  completionInfoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    width: 120,
  },
  completionInfoValue: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  completionDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 16,
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
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 6,
  },
  approveButton: {
    backgroundColor: '#059669',
  },
  rejectButton: {
    backgroundColor: '#DC2626',
  },
  inProgressButton: {
    backgroundColor: '#3B82F6',
  },
  completeButton: {
    backgroundColor: '#059669',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  formContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    maxHeight: '80%',
  },
  formCloseButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  formScrollView: {
    paddingBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  radioGroup: {
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#0066cc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioChecked: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0066cc',
  },
  radioText: {
    fontSize: 14,
    color: '#1F2937',
  },
  submitButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  imagePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#0066cc',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 16,
    marginBottom: 16,
  },
  imagePickerText: {
    marginLeft: 8,
    color: '#0066cc',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedImagesContainer: {
    marginBottom: 16,
  },
  selectedImagesTitle: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
  },
  selectedImagesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectedImageThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 4,
    margin: 4,
  },
  modalContainer: {
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
});

export default MaintenanceDetail;
