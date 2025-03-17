import type React from "react";

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
  FlatList,
} from "react-native";
import { Text, Card } from "react-native-ui-lib";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";

import { myTheme } from "@/constants/index";
import ProductSelectionModal from "@/components/modals/product-selection-modal";
import type { IResponseProduct } from "@/types/product";
import useLivestreams from "@/hooks/api/useLivestreams";
import useUser from "@/hooks/api/useUser";

const uploadFile = async (fileUri: string): Promise<string | null> => {
  try {
    // Create a form data object
    const formData = new FormData();

    // Get the file name from the URI
    const fileName = fileUri.split("/").pop() || "image.jpg";

    // Determine the file type
    const match = /\.(\w+)$/.exec(fileName);
    const fileType = match ? `image/${match[1]}` : "image/jpeg";

    // Append the file to the form data
    formData.append("files", {
      uri: fileUri,
      name: fileName,
      type: fileType,
    } as any);

    console.log("Uploading file:", fileName);

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/files/upload`,
      {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to upload file");
    }

    // Parse the response
    const result = await response.json();
    console.log("result", result, result.fileUrl);

    // Return the file ID or URL from the response
    return result.data[0];
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
};

const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
  <Text style={styles.label}>
    {children} <Text style={styles.requiredAsterisk}>*</Text>
  </Text>
);

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
  const { getProfile } = useUser();
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
  const [account, setAccount] = useState<{ id: string; name: string } | null>(
    null
  );

  // Product selection modal state
  const [productModalVisible, setProductModalVisible] = useState(false);

  // Calculate minimum allowed start time (4 hours from now)
  const minStartTime = new Date();
  minStartTime.setHours(minStartTime.getHours() + 4);

  // Fetch user profile data when component mounts
  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getProfile();
        if (data && data.id) {
          setAccount({
            id: data.id,
            name: data.email || "My Account",
          });
          setValue("account", data.id);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        Alert.alert("Error", "Failed to load account information");
      }
    }

    fetchProfile();
  }, [getProfile]);

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
      account: "",
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
  // Updated to receive both IDs and full product objects
  const handleProductSelectionConfirm = (
    selectedIds: string[],
    productObjects: IResponseProduct[]
  ) => {
    console.log(`Selection confirmed: ${selectedIds.length} products selected`);

    // First update the product details to ensure the UI can render them
    setSelectedProductDetails(productObjects);

    // Then update the IDs
    setSelectedProducts(selectedIds);

    // Force a re-render by using a small timeout
    setTimeout(() => {
      // This will trigger the useEffect that updates the form value
      setValue("products", selectedIds);
      trigger("products");
    }, 50);
  };

  // Update form value when products selection changes
  useEffect(() => {
    if (selectedProducts.length > 0) {
      console.log(
        `useEffect triggered: ${selectedProducts.length} products in state`
      );
      setValue("products", selectedProducts);
      trigger("products");
    }
  }, [selectedProducts, setValue, trigger]);

  // Update the pickThumbnail function
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

        // Store the image URI for later upload
        setThumbnailImage(asset.uri);
        // We don't set the form value here anymore, as we'll use the uploaded URL later
        setThumbnailError(null);

        console.log("Thumbnail selected:", asset.uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      setThumbnailError("Failed to select image");
    }
  };

  // Add this near the top of the component with other state variables
  const { createLivestream } = useLivestreams();

  // Replace the onSubmit function with this updated implementation
  // that doesn't show a separate alert for image uploading

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
      // If there's a thumbnail, upload it first
      let thumbnailUrl = "";
      if (thumbnailImage) {
        setThumbnailError(null);

        // Upload the thumbnail without showing a separate alert
        const uploadedFileUrl = await uploadFile(thumbnailImage);

        if (!uploadedFileUrl) {
          throw new Error("Failed to upload thumbnail image");
        }

        thumbnailUrl = uploadedFileUrl;
        console.log("Thumbnail uploaded successfully:", thumbnailUrl);
      }

      // Format the data for API submission
      const formattedData = {
        title: data.title,
        startTime: data.startTime.toISOString(),
        endTime: data.endTime ? data.endTime.toISOString() : "",
        account: data.account,
        thumbnail: thumbnailUrl, // Use the uploaded file URL
        products: data.products,
      };

      console.log("Submitting data:", formattedData);

      // Use the createLivestream function from our hook
      const result = await createLivestream(formattedData);

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
        throw new Error("Failed to create livestream");
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

  // Validation functions for start and end times
  const validateStartTime = (selectedDateTime: Date): true | string => {
    const now = new Date();
    const minAllowedTime = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours from now

    if (selectedDateTime < minAllowedTime) {
      return "Start time must be at least 4 hours from now";
    }

    return true;
  };

  const validateEndTime = (selectedDateTime: Date): true | string => {
    if (!startTime) {
      return "Start time must be selected first";
    }

    if (selectedDateTime <= startTime) {
      return "End time must be after start time";
    }

    return true;
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
            <RequiredLabel>Title</RequiredLabel>
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
            <RequiredLabel>Start Date & Time</RequiredLabel>
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
              <RequiredLabel>End Date & Time</RequiredLabel>
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
                  {endTime ? formatDate(endTime) : "Select date "}
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
                  {endTime ? formatTime(endTime) : "Select time"}
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
          <Text style={styles.sectionTitle}>
            Select Products <Text style={styles.requiredAsterisk}>*</Text>
          </Text>
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
            <Text style={styles.selectProductsText}>
              {selectedProducts.length > 0
                ? `Manage Products (${selectedProducts.length})`
                : "Select Products"}
            </Text>
          </TouchableOpacity>

          {selectedProductDetails.length > 0 ? (
            <View style={styles.selectedProductsContainer}>
              <View style={styles.selectedProductsHeader}>
                <Text style={styles.selectedProductsTitle}>
                  Selected Products ({selectedProductDetails.length})
                </Text>
                {selectedProductDetails.length > 0 && (
                  <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={openProductModal}
                  >
                    <Text style={styles.viewAllText}>Manage</Text>
                  </TouchableOpacity>
                )}
              </View>

              <FlatList
                data={selectedProductDetails}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.selectedProductsScroll}
                keyExtractor={(item) => item.id || Math.random().toString()}
                renderItem={({ item }) => {
                  // Get the main image URL or a placeholder
                  const imageUrl =
                    item.images &&
                    item.images.length > 0 &&
                    item.images[0].fileUrl
                      ? item.images[0].fileUrl
                      : "https://via.placeholder.com/100";

                  // Format price with currency
                  const formattedPrice = item.price
                    ? `$${item.price.toFixed(2)}`
                    : "Price unavailable";

                  return (
                    <View key={item.id} style={styles.selectedProductItem}>
                      <Image
                        source={{ uri: imageUrl }}
                        style={styles.selectedProductImage}
                      />
                      <View style={styles.selectedProductBadge}>
                        <Feather name="check" size={12} color="#fff" />
                      </View>
                      <View style={styles.selectedProductInfo}>
                        <Text
                          style={styles.selectedProductName}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        <Text style={styles.selectedProductPrice}>
                          {formattedPrice}
                        </Text>
                        <View style={styles.selectedProductMeta}>
                          <Text style={styles.selectedProductStock}>
                            {item.quantity !== undefined
                              ? `${item.quantity} in stock`
                              : ""}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                }}
                ListEmptyComponent={
                  <View style={styles.emptyProductsContainer}>
                    <Feather name="shopping-bag" size={24} color="#94a3b8" />
                    <Text style={styles.emptyProductsText}>
                      No products selected
                    </Text>
                  </View>
                }
              />
            </View>
          ) : (
            <View style={styles.emptyProductsContainer}>
              <Feather name="shopping-bag" size={24} color="#94a3b8" />
              <Text style={styles.emptyProductsText}>No products selected</Text>
              <Text style={styles.emptyProductsSubtext}>
                Please select at least one product
              </Text>
            </View>
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
  selectedProductsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#f1f5f9",
    borderRadius: 16,
  },
  viewAllText: {
    fontSize: 12,
    color: myTheme.primary,
    fontWeight: "500",
  },
  selectedProductBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: myTheme.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  selectedProductInfo: {
    padding: 8,
  },
  selectedProductMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  selectedProductStock: {
    fontSize: 10,
    color: "#64748b",
  },
  emptyProductsContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    marginTop: 12,
  },
  emptyProductsText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
    marginTop: 8,
  },
  emptyProductsSubtext: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
  },
  selectedProductsContainer: {
    marginTop: 16,
  },
  selectedProductsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  selectedProductsScroll: {
    marginHorizontal: -8,
  },
  selectedProductItem: {
    width: 160,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  selectedProductImage: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
  selectedProductName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0f172a",
    marginBottom: 4,
  },
  selectedProductPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: myTheme.primary,
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
  requiredAsterisk: {
    color: "#ef4444",
    fontWeight: "bold",
  },
});
