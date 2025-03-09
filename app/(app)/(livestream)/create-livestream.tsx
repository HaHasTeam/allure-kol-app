"use client";

import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Text, Card } from "react-native-ui-lib";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";

import { myTheme } from "@/constants/index";
import ProductSelectionModal from "@/components/modals/product-selection-modal";

import { IResponseProduct } from "@/types/product";

// Add this import at the top with other imports
// import useLivestreams from "@/hooks/api/useLivestreams";

// Mock account data - in a real app, you would get this from your auth context
const MOCK_ACCOUNT = {
  id: "8e0d14c6-e5c6-42fa-9d0f-9ad59eef1935",
  name: "KOL Account",
};

type FormData = {
  title: string;
  startTime: Date;
  endTime?: Date;
  account: string;
  thumbnail?: string;
  products: string[];
};

export default function CreateLivestreamScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedProductDetails, setSelectedProductDetails] = useState<
    IResponseProduct[]
  >([]);
  const [thumbnailImage, setThumbnailImage] = useState<string | null>(null);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);

  // Product selection modal state
  const [productModalVisible, setProductModalVisible] = useState(false);

  // Calculate minimum allowed start time (4 hours from now)
  const minStartTime = new Date();
  minStartTime.setHours(minStartTime.getHours() + 4);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    trigger,
  } = useForm<FormData>({
    defaultValues: {
      title: "",
      startTime: new Date(
        Math.max(new Date().getTime(), minStartTime.getTime())
      ),
      account: MOCK_ACCOUNT.id,
      products: [],
    },
  });

  const startTime = watch("startTime");
  const endTime = watch("endTime");

  // Format date for display
  const formatDate = (date?: Date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format time for display
  const formatTime = (date?: Date) => {
    if (!date) return "";
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Open product selection modal
  const openProductModal = () => {
    setProductModalVisible(true);
  };

  // Handle product selection confirmation
  const handleProductSelectionConfirm = (selectedIds: string[]) => {
    setSelectedProducts(selectedIds);
    setProductModalVisible(false);
  };

  // Update form value when products selection changes
  useEffect(() => {
    setValue("products", selectedProducts);
    trigger("products");

    // Fetch product details when selection changes
    const fetchSelectedProductDetails = async () => {
      if (selectedProducts.length > 0) {
        try {
          // const products = await getProductsByIds(selectedProducts);
          setSelectedProductDetails([]);
        } catch (error) {
          console.error("Error fetching product details:", error);
        }
      } else {
        setSelectedProductDetails([]);
      }
    };

    fetchSelectedProductDetails();
  }, [selectedProducts, setValue, trigger]);

  // Handle thumbnail selection
  const pickThumbnail = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Validate image size (example: max 5MB)
        const asset = result.assets[0];
        const fileSize = asset.fileSize || 0;

        if (fileSize > 5 * 1024 * 1024) {
          setThumbnailError("Image size must be less than 5MB");
          return;
        }

        setThumbnailImage(asset.uri);
        setValue("thumbnail", asset.uri);
        setThumbnailError(null);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      setThumbnailError("Failed to select image");
    }
  };

  // Validate start time is at least 4 hours in the future
  const validateStartTime = (time: Date) => {
    if (time.getTime() < minStartTime.getTime()) {
      return "Start time must be at least 4 hours from now";
    }
    return true;
  };

  // Validate end time is after start time and is required
  const validateEndTime = (time?: Date) => {
    if (!time) return "End time is required";
    if (time.getTime() <= startTime.getTime()) {
      return "End time must be after start time";
    }
    return true;
  };

  // Add this near the top of the component with other state variables
  // const {
  //   createLivestream,
  //   isLoading: isApiLoading,
  //   error: apiError,
  // } = useLivestreams();

  // Replace the onSubmit function with this implementation
  const onSubmit = async (data: FormData) => {
    // Final validation checks
    if (!data.endTime) {
      Alert.alert("Error", "Please select an end time for your livestream");
      return;
    }

    if (selectedProducts.length === 0) {
      Alert.alert("Error", "Please select at least one product");
      return;
    }

    setIsSubmitting(true);

    try {
      // Format the data for API submission
      const formattedData = {
        title: data.title,
        startTime: data.startTime.toISOString(),
        endTime: data.endTime ? data.endTime.toISOString() : "",
        account: data.account,
        thumbnail: data.thumbnail || "",
        products: data.products,
      };

      console.log("Submitting data:", formattedData);

      // Use the createLivestream function from our hook
      const result = true;

      if (result) {
        Alert.alert(
          "Success",
          "Your livestream has been scheduled successfully!",
          [
            {
              text: "OK",
              onPress: () => router.push("/(app)/(tabs)/live"),
            },
          ]
        );
      } else {
        // The error will be handled by the hook and stored in apiError
        // throw new Error(apiError || "Failed to create livestream");
      }
    } catch (error) {
      console.error("Error creating livestream:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to schedule your livestream. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Livestream</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Livestream Details</Text>

          {/* Title Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Title</Text>
            <Controller
              control={control}
              rules={{
                required: "Title is required",
                minLength: {
                  value: 5,
                  message: "Title must be at least 5 characters",
                },
                maxLength: {
                  value: 100,
                  message: "Title must be less than 100 characters",
                },
                pattern: {
                  value: /^[a-zA-Z0-9\s.,!?-]+$/,
                  message: "Title contains invalid characters",
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.title && styles.inputError]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Enter livestream title"
                  placeholderTextColor="#94a3b8"
                  maxLength={100}
                />
              )}
              name="title"
            />
            {errors.title && (
              <Text style={styles.errorText}>{errors.title.message}</Text>
            )}
          </View>

          {/* Start Date & Time */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Start Date & Time</Text>
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity
                style={[
                  styles.dateTimeButton,
                  errors.startTime && styles.inputError,
                ]}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Feather
                  name="calendar"
                  size={16}
                  color="#64748b"
                  style={styles.dateTimeIcon}
                />
                <Text style={styles.dateTimeText}>{formatDate(startTime)}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.dateTimeButton,
                  errors.startTime && styles.inputError,
                ]}
                onPress={() => setShowStartTimePicker(true)}
              >
                <Feather
                  name="clock"
                  size={16}
                  color="#64748b"
                  style={styles.dateTimeIcon}
                />
                <Text style={styles.dateTimeText}>{formatTime(startTime)}</Text>
              </TouchableOpacity>
            </View>
            {errors.startTime && (
              <Text style={styles.errorText}>{errors.startTime.message}</Text>
            )}
            <Text style={styles.helperText}>
              Start time must be at least 4 hours from now
            </Text>

            {showStartDatePicker && (
              <DateTimePicker
                value={startTime}
                mode="date"
                display="default"
                minimumDate={minStartTime}
                onChange={(event, selectedDate) => {
                  setShowStartDatePicker(false);
                  if (selectedDate) {
                    const newDateTime = new Date(startTime);
                    newDateTime.setFullYear(selectedDate.getFullYear());
                    newDateTime.setMonth(selectedDate.getMonth());
                    newDateTime.setDate(selectedDate.getDate());

                    // Validate the new date
                    const isValid = validateStartTime(newDateTime);
                    if (isValid === true) {
                      setValue("startTime", newDateTime, {
                        shouldValidate: true,
                      });
                    } else {
                      Alert.alert("Invalid Date", isValid);
                    }
                  }
                }}
              />
            )}

            {showStartTimePicker && (
              <DateTimePicker
                value={startTime}
                mode="time"
                display="default"
                minimumDate={minStartTime}
                onChange={(event, selectedTime) => {
                  setShowStartTimePicker(false);
                  if (selectedTime) {
                    const newDateTime = new Date(startTime);
                    newDateTime.setHours(selectedTime.getHours());
                    newDateTime.setMinutes(selectedTime.getMinutes());

                    // Validate the new time
                    const isValid = validateStartTime(newDateTime);
                    if (isValid === true) {
                      setValue("startTime", newDateTime, {
                        shouldValidate: true,
                      });
                    } else {
                      Alert.alert("Invalid Time", isValid);
                    }
                  }
                }}
              />
            )}
          </View>

          {/* End Date & Time */}
          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>End Date & Time</Text>
            </View>
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity
                style={[
                  styles.dateTimeButton,
                  errors.endTime && styles.inputError,
                ]}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Feather
                  name="calendar"
                  size={16}
                  color="#64748b"
                  style={styles.dateTimeIcon}
                />
                <Text style={styles.dateTimeText}>
                  {endTime ? formatDate(endTime) : "Select date (required)"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.dateTimeButton,
                  errors.endTime && styles.inputError,
                ]}
                onPress={() => setShowEndTimePicker(true)}
              >
                <Feather
                  name="clock"
                  size={16}
                  color="#64748b"
                  style={styles.dateTimeIcon}
                />
                <Text style={styles.dateTimeText}>
                  {endTime ? formatTime(endTime) : "Select time (required)"}
                </Text>
              </TouchableOpacity>
            </View>
            {errors.endTime && (
              <Text style={styles.errorText}>{errors.endTime.message}</Text>
            )}
            <Text style={styles.helperText}>
              End time is required and must be after start time
            </Text>

            {showEndDatePicker && (
              <DateTimePicker
                value={endTime || new Date(startTime.getTime() + 3600000)} // Default to 1 hour after start time
                mode="date"
                display="default"
                minimumDate={startTime}
                onChange={(event, selectedDate) => {
                  setShowEndDatePicker(false);
                  if (selectedDate) {
                    const currentEndTime =
                      endTime || new Date(startTime.getTime() + 3600000);
                    const newDateTime = new Date(currentEndTime);
                    newDateTime.setFullYear(selectedDate.getFullYear());
                    newDateTime.setMonth(selectedDate.getMonth());
                    newDateTime.setDate(selectedDate.getDate());

                    // Validate the new date
                    const isValid = validateEndTime(newDateTime);
                    if (isValid === true) {
                      setValue("endTime", newDateTime, {
                        shouldValidate: true,
                      });
                    } else {
                      Alert.alert("Invalid Date", isValid);
                    }
                  }
                }}
              />
            )}

            {showEndTimePicker && (
              <DateTimePicker
                value={endTime || new Date(startTime.getTime() + 3600000)} // Default to 1 hour after start time
                mode="time"
                display="default"
                onChange={(event, selectedTime) => {
                  setShowEndTimePicker(false);
                  if (selectedTime) {
                    const currentEndTime =
                      endTime || new Date(startTime.getTime() + 3600000);
                    const newDateTime = new Date(currentEndTime);
                    newDateTime.setHours(selectedTime.getHours());
                    newDateTime.setMinutes(selectedTime.getMinutes());

                    // Validate the new time
                    const isValid = validateEndTime(newDateTime);
                    if (isValid === true) {
                      setValue("endTime", newDateTime, {
                        shouldValidate: true,
                      });
                    } else {
                      Alert.alert("Invalid Time", isValid);
                    }
                  }
                }}
              />
            )}
          </View>

          {/* Thumbnail */}
          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Thumbnail</Text>
              <Text style={styles.optionalText}>(Optional)</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.thumbnailContainer,
                thumbnailError && styles.inputError,
              ]}
              onPress={pickThumbnail}
            >
              {thumbnailImage ? (
                <Image
                  source={{ uri: thumbnailImage }}
                  style={styles.thumbnailImage}
                />
              ) : (
                <View style={styles.thumbnailPlaceholder}>
                  <Feather name="image" size={24} color="#94a3b8" />
                  <Text style={styles.thumbnailText}>
                    Upload thumbnail image
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            {thumbnailError && (
              <Text style={styles.errorText}>{thumbnailError}</Text>
            )}
            <Text style={styles.helperText}>
              Recommended: 16:9 ratio, max 5MB
            </Text>
          </View>
        </Card>

        {/* Products Selection */}
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Select Products</Text>
          <Text style={styles.sectionDescription}>
            Choose products to feature in your livestream
          </Text>

          <TouchableOpacity
            style={styles.selectProductsButton}
            onPress={openProductModal}
          >
            <Feather
              name="shopping-bag"
              size={20}
              color="#fff"
              style={styles.selectProductsIcon}
            />
            <Text style={styles.selectProductsText}>Select Products</Text>
          </TouchableOpacity>

          {selectedProductDetails.length > 0 ? (
            <View style={styles.selectedProductsContainer}>
              <Text style={styles.selectedProductsTitle}>
                Selected Products ({selectedProductDetails.length})
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.selectedProductsScroll}
              >
                {selectedProductDetails.map((product) => {
                  // Get the main image URL or a placeholder
                  const imageUrl =
                    product.images && product.images.length > 0
                      ? product.images[0].fileUrl
                      : "https://via.placeholder.com/100";

                  // Format price with currency
                  const formattedPrice = product.price
                    ? `$${product.price.toFixed(2)}`
                    : "Price unavailable";

                  return (
                    <View key={product.id} style={styles.selectedProductItem}>
                      <Image
                        source={{ uri: imageUrl }}
                        style={styles.selectedProductImage}
                      />
                      <Text
                        style={styles.selectedProductName}
                        numberOfLines={1}
                      >
                        {product.name}
                      </Text>
                      <Text style={styles.selectedProductPrice}>
                        {formattedPrice}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          ) : (
            <Text style={styles.errorText}>
              Please select at least one product
            </Text>
          )}
        </Card>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (isSubmitting || selectedProducts.length === 0) &&
              styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting || selectedProducts.length === 0}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather
                name="video"
                size={20}
                color="#fff"
                style={styles.submitButtonIcon}
              />
              <Text style={styles.submitButtonText}>Schedule Livestream</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Product Selection Modal */}
      <ProductSelectionModal
        visible={productModalVisible}
        onClose={() => setProductModalVisible(false)}
        onConfirm={handleProductSelectionConfirm}
        initialSelectedIds={selectedProducts}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formCard: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  optionalText: {
    fontSize: 12,
    color: "#94a3b8",
    marginLeft: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#0f172a",
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  dateTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    flex: 0.48,
    backgroundColor: "#fff",
  },
  dateTimeIcon: {
    marginRight: 8,
  },
  dateTimeText: {
    fontSize: 14,
    color: "#0f172a",
  },
  thumbnailContainer: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  thumbnailPlaceholder: {
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  thumbnailText: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 8,
  },
  thumbnailImage: {
    width: "100%",
    height: 160,
  },
  selectProductsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: myTheme.primary,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectProductsIcon: {
    marginRight: 8,
  },
  selectProductsText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
  },
  selectedProductsContainer: {
    marginTop: 8,
  },
  selectedProductsTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0f172a",
    marginBottom: 8,
  },
  selectedProductsScroll: {
    flexDirection: "row",
  },
  selectedProductItem: {
    width: 120,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  selectedProductImage: {
    width: "100%",
    height: 100,
  },
  selectedProductName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#0f172a",
    marginTop: 4,
    marginHorizontal: 8,
  },
  selectedProductPrice: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 8,
    marginHorizontal: 8,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: myTheme.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 40,
    ...Platform.select({
      ios: {
        shadowColor: myTheme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
